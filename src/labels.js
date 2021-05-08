import { setAMapWebApiKey, getDistictData } from './district'
import { applyOption, deepCopy } from './utils/util'
export class DisrtictLabel {
  options = {
    lablesLayerOption: {
      zIndex: 100
    },
    labelMarker: {
      text: {
        style: {
          fillColor: '#424242'
        },
        direction: 'center',
        offset: [0, 0]
      }
    }
  }
  constructor(md, opts) {
    this._md = md
    let _opts = applyOption(this.options, opts)
    setAMapWebApiKey(_opts.webApiKey)
    this._labelsLay = new AMap.LabelsLayer(_opts.lablesLayerOption)
    let disDt = md.getCurrentDisData()
    if (disDt) {
      this.show(disDt.adcode)
    }
    var map = (this._map = md.getMap())
    map.on('districtBeforeChange', (e) => {
      this.show(e.adcode)
    })
  }
  async show(keywords) {
    if (!keywords) return
    const data = await getDistictData({
      keywords
    })

    let curDis = data.districts[0]
    let subDis = curDis.districts
    if (!curDis) return

    let markers = subDis.map((s) => {
      let markerOption = deepCopy(this.options.labelMarker)
      markerOption.text.content = s.name
      markerOption.position = s.center.split(',')
      let marker = new AMap.LabelMarker(markerOption)
      marker.on('click', this.handleMarkerClick.bind(this))
      return marker
    })
    this._updateNameLabels(markers)
  }
  _updateNameLabels(labelMarkers = []) {
    let labelsLay = this._labelsLay
    labelsLay.clear()
    this._map.remove(labelsLay)
    labelMarkers.forEach((l) => {
      labelsLay.add(l)
    })
    this._map.add(labelsLay)
  }
  handleMarkerClick(ev) {
    const map = this._map
    map.emit('click', ev)
  }
}
