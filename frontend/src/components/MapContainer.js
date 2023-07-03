import React, { Component } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import "./MapContainer.css";
import Submit from "./Submit";

class MapComponent extends Component {
  constructor() {
    super();
    this.map = {};
  }

  // dom渲染成功后进行map对象的创建
  componentDidMount() {
    AMapLoader.load({
      key: "5006aba1c28995bc84672dca708fc2d8", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then((AMap) => {
        var position = new AMap.LngLat(116.397428, 39.90923);

        // 创建地图实例
        var marker,
          map = new AMap.Map("container", {
            zoom: 13,
            center: position,
            mapStyle: "amap://styles/whitesmoke",
            viewMode: "2D",
            resizeEnable: true,
          });

        // 点标记显示内容，HTML要素字符串
        // var markerContent =
        //   "" +
        //   '<div class="custom-content-marker">' +
        //   '   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/dir-via-marker.png">' +
        //   '   <div class="close-btn" onclick="clearMarker()">X</div>' +
        //   "</div>";

        // 实例化点标记
        function addMarker() {
          marker = new AMap.Marker({
            //icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
            position: [116.406315, 39.908775],
            offset: new AMap.Pixel(-13, -30),
          });
          marker.setMap(map);
        }
        addMarker();
        // 将 markers 添加到地图
        map.add(marker);

        // 清除 marker
        function clearMarker() {
          if (marker) {
            marker.setMap(null);
            marker = null;
          }
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }

  render() {
    // 初始化创建地图容器,div标签作为地图容器，同时为该div指定id属性；
    return (
      <div className="h-screen bg-gray-100 overflow-hidden">
        <div id="container" className="map"></div>
        <div className="input-item fixed bottom-12 z-50 flex left-8 space-x-4 items-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded"
            id="addMarker"
            // onClick={addMarker}
          >
            添加点
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white text-sm font-bold py-1 px-3 rounded"
            id="clearMarker"
            // onClick={clearMarker}
          >
            删除点
          </button>

          {/* Click to send location information/ request url */}
          <Submit />
        </div>
      </div>
    );
  }
}
// 导出地图组建类
export default MapComponent;
