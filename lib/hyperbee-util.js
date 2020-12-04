
export function keyToPath (key) {
  var start = 0
  var arr = []
  for (let i = 0; i < key.length; i++) {
    if (key[i] === 0) {
      arr.push(encodeURIComponent(key.slice(start, i).toString('utf8')))
      start = i + 1
    }
  }
  if (start < key.length) {
    arr.push(encodeURIComponent(key.slice(start).toString('utf8')))
  }
  return arr.join('/')
}