import { createDistrictLayer } from './district'
import { getDepthByAdcode } from './adcode'
import { extend } from './utils'
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
    if (opts.init) {
      this._DL = opts.init.layer || createDistrictLayer('country')
      opts.init.data && this._disStack.push((this._disData = opts.init.data))
    }
    if (!this._DL) {
      this._DL = createDistrictLayer('country')
    }
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
    }
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
