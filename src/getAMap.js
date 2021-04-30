import { isArray } from './utils'
var _AMap,
  KEY,
  PLUGINS,
  VERSION = '1.4.15'

const _getAMap = (key, plugins) => {
  plugins = (isArray(plugins) ? plugins : [plugins]).filter((p) => typeof p == 'string')
  plugins.push('AMap.DistrictLayer')
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://webapi.amap.com/maps?v=${VERSION}&key=${key}&plugin=${plugins.join(',')}`
    script.onerror = reject
    script.onload = () => {
      resolve((_AMap = window.AMap))
    }
    document.head.appendChild(script)
  })
}

export const getAMap = (reload) => {
  if (!reload && _AMap) {
    return _AMap
  }
  return _getAMap(KEY, PLUGINS)
}
export const setAMapUrlOption = ({ key, plugins, version }) => {
  key && (KEY = key)
  plugins && (PLUGINS = plugins)
  version && (VERSION = version)
}
