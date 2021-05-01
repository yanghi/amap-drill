import { getAMap } from './getAMap'
import { get } from './utils'
import { getDepthByAdcode } from './adcode'

var WEB_KEY
var AMAP_BASE_URL = 'https://restapi.amap.com/v3'
export const getDistictData = (params) => {
  if (typeof params == 'string') {
    params = {
      keywords: params
    }
  }
  return get(AMAP_BASE_URL + '/config/district', {
    key: WEB_KEY,
    ...params
  })
}
export const setAMapWebApiKey = (k) => {
  WEB_KEY = k
}
const DIS_LEVEL_MAP = (function () {
  let map = {}
  ;['street', 'district', 'city', 'province', 'country'].forEach((l, i) => {
    map[l] = i
  })
  return map
})()

export const levelWeight = (l) => {
  return DIS_LEVEL_MAP[l] || -1
}

export const levelWeighter = (a, b) => levelWeight(a) > b

export const createDistrictLayer = (level, params) => {
  const AMap = getAMap()
  if (level == 'country') {
    return new AMap.DistrictLayer.Country({
      zIndex: 10,
      SOC: 'CHN',
      depth: 1,
      styles: {
        fill: '#ffffff'
      },
      ...params
    })
  } else {
    return new AMap.DistrictLayer.Province({
      zIndex: 12,
      styles: {
        fill: '#ffffff',
        'city-stroke': '#cccccc',
        'county-stroke': '#cccccc'
      },
      ...params,
      adcode: [params.adcode]
    })
  }
}
export const createDistrictLayerByDis = (disData, ps) => {
  return createDistrictLayer(disData.level, {
    depth: getDepthByAdcode(disData.adcode),
    ...ps
  })
}
