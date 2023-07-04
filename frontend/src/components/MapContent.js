import React from "react";
import { ReactDOM } from "react";
import { Map, Marker, InfoWindow } from "react-amap";

class MapContent extends React.Component {
  constructor() {
    super();
    this.state = {
      position: { longitude: 116.4, latitude: 39.9 },
      center: { longitude: 116.4, latitude: 39.9 },
      geocoder: "",
    };
    this.mapPlugins = ["ToolBar", "Scale", "Map.Geolocation"];
    this.markerEvents = {
      click: () => {
        console.log("marker clicked!");
      },
    };
  }

  getLocation() {
    const mapError = new Map([
      ["Get ipLocation failed.", "IP精确定位失败"],
      ["Browser not Support html5 geolocation.", "浏览器不支持原生定位接口"],
      ["Geolocation permission denied.", "浏览器禁止了非安全域的定位请求"],
      ["Get geolocation time out.", "浏览器定位超时"],
      ["Get geolocation failed.", "定位失败"],
    ]);
    this.map.plugin("MAP.Geolocation", () => {
      const geolocation = new Map.Geolocation({
        enableHighAccuracy: true, //是否使用高精度定位
        timeout: 30000, //超过n秒后停止定位
        showButton: true, //显示定位按钮
        showMarker: true, //定位成功后在定位到的位置显示点标记
        showCircle: true, //定位成功后用圆圈表示定位精度范围
        panToLocation: true, //定位成功后将定位到的位置作为地图中心点---
        zoomToAccuracy: true, //调整地图视野范围使定位位置及精度范围视野内可见
      });
      this.map.setZoom(12); // 缩放比例改变后重新定位时设置初始缩放比例
      this.map.addControl(geolocation); // 添加控件
      geolocation.getCurrentPosition(); // 进入页面时自动定位
      Map.event.addListener(geolocation, "complete", (result) => {
        // 不在这里取数据，因为返回的经纬度、详细地址偏差比较大----下面有获取精确地址的介绍
      });
      Map.event.addListener(geolocation, "error", (err) => {
        // 定位失败的错误提示
        let msg = mapError.get(err.message) || err.message;
        console.log(msg);
      });
    });
  }

  mapMove() {
    // * 地图移动中
    this.map.on("mapmove", () => {
      this.mapMove = false;
    });
    // * 地图移动结束
    this.map.on("moveend", () => {
      this.mapMove = true;
      this.getCenterAddress(); // 获取地址----下面会做详细介绍
    });
  }

  getCenterAddress() {
    let lnglat = this.map.getCenter();
    Map.service("MAP.PlaceSearch", () => {
      let placeSearch = new Map.PlaceSearch({
        pageSize: 10,
        pageIndex: 1,
        children: 1,
        extensions: "all",
        type: "通行设施|地名地址信息|政府机构及社会团体|楼宇|产业园区|风景名胜|机场出发/到达|火车站|港口码头|长途汽车站|地铁站|轻轨站|公交车站",
      });
      let center = [lnglat.lng, lnglat.lat];
      placeSearch.searchNearBy("", center, 50, (sta, result) => {
        if (sta === "complete" && result.info === "OK") {
          // result.poiList.pois 数组第一项就是获取的精确地址
          return result.poiList.pois[0];
        }
      });
    });
  }

  render() {
    return (
      <div className="h-screen bg-gray-100 ">
        <div className=" w-full h-full ">
          <div className="fixed bottom-12 z-50 flex left-8 space-x-4 items-center">
            <button
              className=" bg-blue-500 hover:bg-blue-700 text-white text-md font-bold py-1 px-3 rounded"
              onClick={() => {
                this.addMarker();
              }}
            >
              Position
            </button>
            <button
              className=" bg-blue-500 hover:bg-blue-700 text-white text-md font-bold py-1 px-3 rounded"
              onClick={() => {
                this.removeMarker();
              }}
            >
              Draggable
            </button>
          </div>
          <Map
            plugins={this.mapPlugins}
            center={this.state.position}
            ampakey={"5006aba1c28995bc84672dca708fc2d8"}
            zoom={12}
            onChange={this.getLocation}
          >
            <Marker events={this.markerEvents} position={this.state.position} />
            <InfoWindow
              position={this.state.position}
              visible={this.state.visible}
              isCustom={false}
              content={"hello user"}
              size={this.state.size}
              offset={this.state.offset}
              events={this.windowEvents}
            />
          </Map>
        </div>
      </div>
    );
  }
}
export default MapContent;
