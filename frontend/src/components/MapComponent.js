import React, { useState, useEffect, useRef } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Submit from "./Submit";

const MapComponent = () => {
  const [userId, setUserId] = useState("");
  const [address, setAddress] = useState("");
  const [markerPosition, setMarkerPosition] = useState({
    longitude: 0,
    latitude: 0,
  });
  window._AMapSecurityConfig = {
    securityJsCode: "5e0c8daa97f90c952d78ffd79f5a65a9",
  };
  const geocoder = useRef(null);

  useEffect(() => {
    AMapLoader.load({
      key: "5006aba1c28995bc84672dca708fc2d8",
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
      const docRef = doc(db, "locations", userId);
      await setDoc(docRef, {
        username: userId,
        address: currentAddress,
        position: [markerPosition.longitude, markerPosition.latitude],
        timestamp: serverTimestamp(),
      });
      setAddress(currentAddress);
      alert("Data submitted successfully");
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };

  return (
    <div className="h-screen bg-gray-100 overflow-hidden mx-auto">
      <div className="fixed w-full top-20 z-50 text-center">
        <input
          className=" w-[60%] text-lg rounded-lg px-3"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
        />{" "}
        <div className="w-[60%] top-28 text-md rounded-lg font-light px-3">
          Address: {address}
        </div>
      </div>
      <div id="container" className="h-full"></div>

      <div className="w-full fixed bottom-12 items-center flex">
        <button
          onClick={handleSubmit}
          className="bg-gray-500 hover:bg-gray-700 text-white text-md font-bold py-1 px-3 rounded ml-auto mr-6"
        >
          Submit
        </button>
        {/* Click to send location information/ request url */}
        <Submit />
      </div>
    </div>
  );
};

export default MapComponent;
