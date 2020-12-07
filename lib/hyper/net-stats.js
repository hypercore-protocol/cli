import speedometer from 'speedometer'

const HISTORY_LENGTH = 10 // retain this many entries
const POLL_INTERVAL = 2e3 // ms, capture stats on this interval

// globals
// =

var activeCaptures = {} // [keyStr] => NetStatCapture

// exported api
// =

class NetStatCapture {
  constructor (struct) {
    this.struct = struct
    this.interval = undefined
    this.download = (new Array(HISTORY_LENGTH)).fill(0)
    this.upload = (new Array(HISTORY_LENGTH)).fill(0)

    var speedometers = {download: speedometer(), upload: speedometer()}
    function onTfx (type) { return (seq, data) => speedometers[type](data.length) }
    function attach (feed) {
      feed.on('download', onTfx('download'))
      feed.on('upload', onTfx('upload'))
    }

    if (this.struct.type === 'hyperdrive') {
      attach(this.struct.api.metadata)
      this.struct.api.getContent((err, feed) => {
        if (feed) attach(feed)
      })
    } else if (this.struct.type === 'hyperbee') {
      attach(this.struct.api.feed)
    } else {
      attach(this.struct.api)
    }

    this.interval = setInterval(() => {
      rollingArrayPush(this.download, speedometers.download())
      rollingArrayPush(this.upload, speedometers.upload())
    }, POLL_INTERVAL)
    this.interval.unref()

    struct.on('closed', () => {
      clearInterval(this.interval)
      delete activeCaptures[struct.keyStr]
    })
  }

  toJSON () {
    return {download: this.download, upload: this.upload}
  }
}

export function get (struct) {
  if (!activeCaptures[struct.keyStr]) {
    activeCaptures[struct.keyStr] = new NetStatCapture(struct)
  }
  return activeCaptures[struct.keyStr]
}

// internal methods
// =

function rollingArrayPush (arr, value) {
  for (let i = 0; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1]
  }
  arr[arr.length - 1] = value
}