export const isArray = Array.isArray
export function extend(dest) {
  var i, j, len, src

  for (j = 1, len = arguments.length; j < len; j++) {
    src = arguments[j]
    for (i in src) {
      dest[i] = src[i]
    }
  }
  return dest
}
export const isNil = (a) => a == null

export function objectToQuery(data, prefix = '?') {
  if (!data) return ''
  let res = []
  for (let key in data) {
    let value = data[key]
    if (isNil(value)) continue
    res.push(key + '=' + value)
  }
  if (!res.length) return ''
  return (prefix || '') + res.join('&')
}
export const hasOwnProp = (obj, prop) => {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

export const applyOption = (target, options) => {
  for (let k in options) {
    let prop = options[k]

    if (hasOwnProp(target, k) && typeof prop == 'object' && prop) {
      applyOption(target[k], options[k])
    } else {
      target[k] = options[k]
    }
  }
  return target
}
function typeOf(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}
export const isObject = () => {
  return obj && typeof obj == 'object'
}
export const deepCopy = (data) => {
  const t = typeOf(data)
  let o

  if (t === 'Array') {
    o = []
  } else if (t === 'Object') {
    o = {}
  } else {
    return data
  }

  if (t === 'Array') {
    for (let i = 0; i < data.length; i++) {
      o.push(deepCopy(data[i]))
    }
  } else if (t === 'Object') {
    for (let i in data) {
      o[i] = deepCopy(data[i])
    }
  }
  return o
}
