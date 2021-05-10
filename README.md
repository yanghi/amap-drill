# amap-drill

## 使用

首先引入 amap

```js
;<script src="https://webapi.amap.com/maps?v=1.4.15&key=yourkey&plugin=AMap.DistrictLayer,AMap.MouseTool"></script>
// 或者使用提供的获取AMap的工具函数
import { getAMap } from 'amap-drill'

async function init() {
  const AMap = await getAMap({ key: 'yourMapKey' })
  //
  后续逻辑
}
```

```js
import { MapDrill, DisrtictLabel } from 'amap-drill'
const initDistrictLayer = new AMap.DistrictLayer.Country({
  zIndex: 10,
  SOC: 'CHN',
  depth: 1,
  styles: {
    fill: '#ffffff'
  }
})
const map = new AMap.Map('map', {
  zooms: [3, 18],
  showIndoorMap: false,
  center: [120, 30],
  zoom: 4,
  resizeEnable: true,
  layers: [initDistrictLayer]
})
const dirllOptions = {}
let mapDrill = new MapDrill(map, drillOptions)
```

### 显示行政区名称

```js
new DisrtictLabel(mapDrill, {
  key: 'your_amap_web_api_key',
  // labelMarker配置,参考amap文档
  labelMarker: {
    text: {
      style: {
        fillColor: '#37C0F6'
      }
    }
  }
})
```

#### MapDirll.drillTo

`MapDirll.drillTo(keywords)`
keywords- 邮政编码或者行政区名称

#### MapDirll.updrill

`MapDirll.updrill()`

向上一层行政区钻取
