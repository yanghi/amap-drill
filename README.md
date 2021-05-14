# amap-drill

## 使用

```
yarn add amap-drill -S
// or
npm install amap-drill -S
```

首先引入 amap

```html
<script src="https://webapi.amap.com/maps?v=1.4.15&key=yourkey&plugin=AMap.DistrictLayer"></script>
```

或者使用提供的获取 AMap 的工具函数

```js
import { getAMap } from 'amap-drill'

async function init() {
  const AMap = await getAMap({ key: 'yourMapKey' })
  // 后续逻辑
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
  webApiKey: 'your_amap_web_api_key',
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

### MapDrill

new MapDrill(map, dirllOptions)

- `map`: Map 实例
- `dirllOptions`: mapDirll 配置

默认配置

```js
{
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
```

#### MapDirll.drillTo

> 钻取行政区

`MapDirll.drillTo(keywords)`

- keywords- 邮政编码或者行政区名称 api

#### MapDirll.updrill

> 向上一层行政区钻取

`MapDirll.updrill()`

#### MapDirll.drill

> 钻取行政区,这个方法是不需要通过查询行政区 api 的

`MapDirll.drill(districtData)`

- districtData: `DistrictLayer.getDistrictByContainerPos`获取到的数据

```js
{
  SOC: 'CHN',
  x: 120, // x,y将被设置为地图的中心点
  y: 30,
  level: 'country',
  adcode: '100000',
  NAME_CHN: '中华人民共和国'
}
```

### DisrtictLabel

> 行政区名称显示

`new DisrtictLabel(mapDrill, labelOptions)`

- mapDrill: MapDirll 实例
- labelOptions

```js
{
  webApiKey: 'your_amap_web_api_key',
  // labelMarker配置,参考amap文档
  labelMarker: {
    text: {
      style: {
        fillColor: '#37C0F6'
      }
    }
  }
```
