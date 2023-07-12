import React, { useState, useEffect, useRef } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import Submit from "./Submit";
import dynamoDB from "../config";
import amapConfig from "../amapConfig";

const MapComponent = () => {
  const [userId, setUserId] = useState("");
  const [address, setAddress] = useState("");
  const [markerPosition, setMarkerPosition] = useState({
    longitude: 0,
    latitude: 0,
  });
  window._AMapSecurityConfig = {
    securityJsCode: amapConfig.securityJsCode,
  };
  const geocoder = useRef(null);

  useEffect(() => {
    AMapLoader.load({
      key: amapConfig.key,
      version: "2.0",
      plugins: ["AMap.Geocoder", "AMap.Geolocation"],
    })
      .then((AMap) => {
        const map = new AMap.Map("container", {
          zoom: 13,
          resizeEnable: true,
        });

        const marker = new AMap.Marker({
          map: map,
        });

        geocoder.current = new AMap.Geocoder({});

        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          convert: true,
          showButton: true,
          buttonPosition: "RB",
          buttonOffset: new AMap.Pixel(10, 20),
          showMarker: false,
          showCircle: true,
          panToLocation: true,
          zoomToAccuracy: true,
        });

        map.addControl(geolocation);

        geolocation.getCurrentPosition((status, result) => {
          if (status === "complete") {
            marker.setPosition(result.position);
            setMarkerPosition({
              longitude: result.position.lng,
              latitude: result.position.lat,
            });
          } else {
            console.log("Geolocation failed: " + result.message);
          }
        });

        map.on("moveend", function () {
          const center = map.getCenter();
          marker.setPosition(center);
          setMarkerPosition({ longitude: center.lng, latitude: center.lat });
        });
      })
      .catch((e) => console.error(e));
  }, []);

  const getAddress = (longitude, latitude) => {
    return new Promise((resolve, reject) => {
      geocoder.current.getAddress([longitude, latitude], (status, result) => {
        console.log("Geocoding status: ", status);
        console.log("Geocoding result: ", result);
        if (status === "complete" && result.info === "OK") {
          resolve(result.regeocode.formattedAddress);
        } else {
          reject("Failed to get address");
        }
      });
    });
  };

  const handleSubmit = async () => {
    try {
      if (userId.trim() === "") {
        alert("User ID cannot be empty");
        return;
      }
      const currentAddress = await getAddress(
        markerPosition.longitude,
        markerPosition.latitude
      );
      const params = {
        TableName: "location",
        Item: {
          id: Date.now().toString(),
          username: userId,
          address: currentAddress,
          position: {
            longitude: markerPosition.longitude,
            latitude: markerPosition.latitude,
          },
          timestamp: new Date().toISOString(),
        },
      };
      await dynamoDB.put(params).promise();
      setAddress(currentAddress);
      alert("Data submitted successfully 成功提交");
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };

  return (
    <div className="h-screen bg-gray-100 overflow-hidden mx-auto">
      <div className="fixed w-full top-20 z-50 text-center">
        <input
          className=" w-[80%] text-lg rounded-lg px-3 pt-2 pb-2"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="输入用户名"
        />{" "}
        {/* <div className="w-[60%] top-28 text-md rounded-lg font-light px-3"> */}
        {/* Address: {address} */}
        {/* </div> */}
      </div>
      <div id="container" className="h-full"></div>

      <div className="w-full fixed bottom-14 items-center flex">
        <button
          onClick={handleSubmit}
          className="bg-gray-500 hover:bg-gray-700 text-white text-md font-bold py-2 px-4 rounded ml-auto mr-3"
        >
          提交
        </button>
        {/* Click to send location information/ request url */}
        <Submit />
      </div>
    </div>
  );
};

export default MapComponent;
