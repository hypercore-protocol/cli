import http from 'http'
import parseRange from 'range-parser'
import pump from 'pump'
import * as HyperStruct from '../../hyper/struct.js'
import * as mime from '../../mime.js'

const FULL_USAGE = `
Options:

  -p/--port {number} - Choose the port to serve on (default 8080).

Examples:

  hyp drive http hyper://1234..af/
`

export default {
  name: 'drive http',
  options: [
    {
      name: 'port',
      default: 8080,
      abbr: 'p'
    }
  ],
  description: 'Host a hyperdrive as using HTTP on the localhost.',
  usage: {
    simple: '{url}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')
    var port = args.port || 8080

    var drive = await HyperStruct.get(args._[0], {expect: 'hyperdrive'})
    const server = http.createServer(createRequestHandler(drive))
    server.listen(port)
    console.log(`Serving at localhost:${port}`)
    process.on('SIGINT', () => {
      server.close()

      // force a close after 1s if its being finicky
      let to = setTimeout(() => process.exit(0), 1e3)
      to.unref()
    })
  }
}

function createRequestHandler (drive) {
  return async function (req, res) {
    const respondRedirect = (url) => {
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end(`<!doctype html><meta http-equiv="refresh" content="0; url=${url}">`)
    }
    const respondError = (code, status, body = undefined) => {
      res.writeHead(code, status)
      res.end(body ? body : code + ' ' + status)
    }

    try {
      // validate request
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return respondError(405, 'Method Not Supported')
      }

      var filepath = req.url
      if (!filepath) filepath = '/'
      if (filepath.indexOf('?') !== -1) filepath = filepath.slice(0, filepath.indexOf('?')) // strip off any query params
      var hasTrailingSlash = filepath.endsWith('/')

      // lookup entry
      var statusCode = 200
      var headers = {}
      try {
        var entry = await drive.api.promises.stat(filepath)
      } catch (e) {
        return respondError(404, 'Not Found')
      }

      // handle folder
      if (entry && entry.isDirectory()) {
        if (!hasTrailingSlash) {
          // make sure there's a trailing slash
          return respondRedirect(`${req.url || ''}/`)
        }

        var files = await drive.api.promises.readdir(filepath)
        files.sort()
        if (files.includes('index.html')) {
          res.writeHead(200, {'Content-Type': 'text/html'})
          drive.api.createReadStream(filepath + 'index.html').pipe(res)
        } else {
          res.writeHead(200, {'Content-Type': 'text/html'})
          var updog = filepath === '/' ? '' : `<li><a href="..">..</a></li>`
          res.end(`<ul>${updog}${files.map(file => `<li><a href="./${file}">${file}</a></li>`).join('')}</ul>`)
        }
        return
      }

      // 404
      if (!entry) {
        return respondError(404, 'File Not Found')
      }

      // handle range
      headers['Accept-Ranges'] = 'bytes'
      var length
      var range = req.headers.Range || req.headers.range
      if (range) range = parseRange(entry.size, range)
      if (range && range.type === 'bytes') {
        range = range[0] // only handle first range given
        statusCode = 206
        length = (range.end - range.start + 1)
        headers['Content-Length'] = '' + length
        headers['Content-Range'] = 'bytes ' + range.start + '-' + range.end + '/' + entry.size
      } else {
        if (entry.size) {
          length = entry.size
          headers['Content-Length'] = '' + length
        }
      }

      Object.assign(headers, {
        'Cache-Control': 'no-cache'
      })

      var mimeType = entry.metadata.mimeType;
      if (!mimeType) {
        // FIXME- for some reason createReadStream() is hanging when opts.length > the actual file length
        // -prf
        // let chunk
        // for await (const part of drive.api.createReadStream(filepath, { start: 0, length: 512 })) {
        //   chunk = chunk ? Buffer.concat([chunk, part]) : part;
        // }
        mimeType = mime.identify(filepath/*, chunk*/)
      }
      if (mimeType.startsWith('text/markdown')) {
        mimeType = 'text/plain'
      }
      headers['Content-Type'] = mimeType

      if (req.method === 'HEAD') {
        res.writeHead(204, headers)
        res.end()
      } else {
        res.writeHead(statusCode, headers)
        pump(
          drive.api.createReadStream(filepath, range),
          res,
          err => {
            if (err) {
              console.error('Error while serving file', filepath)
              console.error(err)
            }
            res.end()
          }
        )
      }
    } catch (e) {
      respondError(500, 'Uncaught error', e.toString())
    }
  }
}