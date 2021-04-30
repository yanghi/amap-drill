const defaultError = 'Server Error 500'
const defaultTimeout = 'Request Timeout'
const xhr = (method, url, data = null, cb) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const doReject = (xhr) => {
      reject(xhr.response || xhr.statusText || defaultError)
    }
    xhr.open(method, url)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.timeout = 10000
    if (cb) cb(xhr)
    xhr.onload = () => {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
          let response = xhr.response
          resolve(response)
        } else {
          doReject(xhr)
        }
      } else {
        doReject(xhr)
      }
    }
    xhr.onerror = () => {
      doReject(xhr)
    }
    xhr.ontimeout = () => {
      xhr.abort()
      reject(defaultTimeout)
    }
    xhr.send(data && JSON.stringify(data))
  })
}

export const get = (url) => {
  return xhr('GET', url)
}
export const post = (url, data, cb) => {
  return xhr('POST', url, data, cb)
}
