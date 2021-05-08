import { createDistrictLayer, getDistictData, setAMapWebApiKey } from './district'
import { getDepthByAdcode, getUpDisticts } from './adcode'
import { extend } from './utils'
import { getAMap, setAMapUrlOption } from './getAMap'
class MapDrill {
  static defaultDrillOptions = {
    clickOutsideToUp: true,
    drill: {
      province: {
        zoom: 7
      },
      country: {
        zoom: 4
      },
      city: {
        zoom: 8
      },
      district: {
        zoom: 10
      },
      street: {
        zoom: 12
      }
    }
  }
  /**
   * 行政区layer
   */
  _DL = null
  _disData = null
  _disStack = []
  constructor(map, opts) {
    this._map = map
    // 仅浅层设置options,
    opts = this.options = { ...MapDrill.defaultDrillOptions, ...opts }
    if (opts.webApiKey) {
      setAMapWebApiKey(opts.webApiKey)
    }
    if (opts.mapKey) {
      setAMapUrlOption({
        key: opts.mapKey,
        plugins: opts.mapPlugins
      })
    }
    const AMap = getAMap()
    if (!opts.init) opts.init = {}
    let dl = opts.init.layer
    if (!dl) {
      dl = map
        .getLayers()
        .find((l) => l instanceof AMap.DistrictLayer.Country || l instanceof AMap.DistrictLayer.Province)
    }
    if (!dl) {
      dl = createDistrictLayer('country')
      map.add(dl)
    }
    this._DL = dl
    let initDisDt = opts.init.data
    if (this._DL instanceof AMap.DistrictLayer.Country) {
      initDisDt = {
        x: 120,
        y: 30,
        adcode: 100000,
        level: 'country',
        SOC: 'CHN',
        NAME_CHN: '中华人民共和国'
      }
    }
    initDisDt && this._disStack.push((this._disData = initDisDt))
    map.on('click', async (ev) => {
      var data = this._DL.getDistrictByContainerPos(ev.pixel)
      if (data) {
        this.drill(data)
      } else {
        opts.clickOutsideToUp && this.updrill()
      }
    })
  }
  _getDisDrillOpts(level) {
    return this.options.drill[level] || MapDrill.defaultDrillOptions.drill[level]
  }
  _isSameDis(a, b) {
    return a && b && a.level == b.level && a.adcode == b.adcode
  }
  _isCurDis(a) {
    return this._isSameDis(this._disData, a)
  }
  _updateStack(dt) {
    let idx = this._disStack.findIndex((d) => d.level == dt.level)
    if (idx > -1) {
      let target = this._disStack[idx]
      if (this._isSameDis(target, dt)) {
        // do nothing
      } else {
        this._disStack.splice(idx)
        this._disStack.push(dt)
      }
    } else {
      this._disStack.push(dt)
    }
    console.log('dis stack', this._disStack.map((i) => `${i.level}-${i.NAME_CHN}-${i.adcode}`).join(';'))
  }
  updrill() {
    if (this._disStack.length < 1) return
    let idx = this._disStack.findIndex((d) => this._isCurDis(d))
    if (idx) {
      let up = this._disStack[idx - 1]
      this.drill(up)
    } else if (this._isPreGetDis) {
      this._map.once('districtDataSetuped', (e) => {
        if (e.adcode == this._disData.adcode) {
          this.updrill()
        }
      })
    }
  }
  async drillTo(keywords) {
    const disDt = await this._getDisData(keywords)
    if (!disDt) return
    this.drill(disDt)
    let adcode = disDt.adcode
    this._preGetDisData(adcode)
  }
  async _getDisData(keywords) {
    if (keywords == '100000') {
      return {
        SOC: 'CHN',
        x: 120,
        y: 30,
        level: 'country',
        adcode: '100000',
        NAME_CHN: '中国人民共和国'
      }
    }
    const data = await getDistictData({
      keywords
    })
    if (!data.districts) return
    let curDis = data.districts[0]
    if (!curDis) return
    let pos = curDis.center.split(',')

    const disDt = {
      SOC: 'CHN',
      x: parseInt(pos[0]),
      y: parseInt(pos[1]),
      level: curDis.level,
      adcode: curDis.adcode,
      NAME_CHN: curDis.name
    }
    return disDt
  }
  _preGetDisData(adcode) {
    let upDis = getUpDisticts(adcode)
    if (!upDis.length) {
      upDis.unshift(100000)
    }
    console.log('up', upDis)

    this._isPreGetDis = true
    let disDtFn = upDis.map((c) => {
      return new Promise((resolve, reject) => {
        this._getDisData(c).then(resolve, reject)
      })
    })

    Promise.all(disDtFn).then((res) => {
      res = res.filter((i) => !!i)
      if (!res.length) return
      const topest = res[0]
      let tIdx = this._disStack.findIndex((i) => i.adcode == topest.adcode)

      if (~tIdx) {
        this._disStack.splice(0, tIdx + 1)
      }
      let idx = this._disStack.findIndex((i) => i.adcode == adcode)

      if (idx > -1) {
        this._disStack.splice(idx, 0, ...res)
      }
      this._isPreGetDis = false
      this._map.emit('districtDataSetuped', {
        adcode
      })
    })
  }
  /**
   * 钻取行政区,
   * 当前只支持相邻level的行政区钻取(向上或者向下一个级别)
   * @param {*} districtData getDistrictByContainerPos获取到的数据
   * @returns
   */
  drill(districtData) {
    if (!districtData || !this._DL) return
    const { level, adcode } = districtData
    const curDisDt = this._disData
    if (this._isCurDis(districtData)) return
    const map = this._map
    map.emit('districtBeforeChange', { ...districtData })
    map.remove(this._DL)
    // }
    this._updateStack(districtData)
    const depth = getDepthByAdcode(adcode)
    const newDisLay = createDistrictLayer(level, {
      depth,
      adcode
    })
    this._DL = newDisLay
    this._disData = districtData

    let disOpt = this._getDisDrillOpts(level)
    map.add(newDisLay)
    map.setZoom(disOpt.zoom)
    map.setCenter([districtData.x, districtData.y])
    map.emit('districtChange', {
      level: districtData.level,
      last: curDisDt,
      current: districtData
    })
  }
  getMap() {
    return this._map
  }
  getCurrentDisData() {
    return extend({}, this._disData)
  }
}

export default MapDrill
