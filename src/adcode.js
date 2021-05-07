// 获取上一级行政区adcode仅精确到乡镇
export const getUpDisByAdcode = (adcode) => {
  const provinceCode = parseInt(adcode.slice(0, 2))
  const cityCode = parseInt(adcode.slice(2, 4))
  const streetCode = parseInt(adcode.slice(4, 6))

  if (streetCode) {
    return provinceCode + '' + cityCode + '00'
  } else if (cityCode) {
    return provinceCode + '0000'
  } else {
    return '100000'
  }
}
export const getDepthByAdcode = (c) => {
  return (c + '').replace('00', '').replace('00', '').length / 2
}
/**
 * 返回某个adcode行政区的上级行政区adcode数组(不包中国),由高到低
 */
export const getUpDisticts = (adcode) => {
  const provinceCode = parseInt(adcode.slice(0, 2))
  const cityCode = parseInt(adcode.slice(2, 4))
  const streetCode = parseInt(adcode.slice(4, 6))

  if (streetCode) {
    return [provinceCode + '0000', provinceCode + '' + cityCode + '00']
  } else if (cityCode) {
    return [provinceCode + '0000']
  }
  return []
}
