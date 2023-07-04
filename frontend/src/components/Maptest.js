import React, { useState, useEffect, useRef } from "react";
import { Map, Geolocation, Marker } from "@uiw/react-amap";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString } from "firebase/storage";

// Initialize Firebase. Replace these values with your actual Firebase config.
const firebaseConfig = {
  apiKey: "AIzaSyB3p-yiWJEFyxN_qJeDHOw3FKy3KtrgpQA",
  authDomain: "streetview-app-5cc5a.firebaseapp.com",
  projectId: "streetview-app-5cc5a",
  storageBucket: "streetview-app-5cc5a.appspot.com",
  messagingSenderId: "820610466111",
  appId: "1:820610466111:web:3f7dd70579f8a75a5d938a",
  measurementId: "G-8EMLDPGBSM",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const MapComponent = () => {
  const mapRef = useRef();
  const [userId, setUserId] = useState("");
  const [address, setAddress] = useState("");
  const [markerPosition, setMarkerPosition] = useState({
    longitude: 0,
    latitude: 0,
  });

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const AMap = window.AMap;
    const map = mapRef.current.getAMapInstance();
    const geocoder = new AMap.Geocoder({});

    AMap.event.addListener(map, "moveend", () => {
      const center = map.getCenter();
      setMarkerPosition({ longitude: center.lng, latitude: center.lat });

      geocoder.getAddress(center, function (status, result) {
        if (status === "complete" && result.info === "OK") {
          setAddress(result.regeocode.formattedAddress);
        }
      });
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const storageRef = ref(storage, `locations/${userId}`);
      await uploadString(storageRef, address);
      alert("Data submitted successfully");
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };

  return (
    <div>
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Enter User ID"
      />
      <Map
        ref={mapRef}
        center={markerPosition}
        zoom={13}
        amapkey="5006aba1c28995bc84672dca708fc2d8"
        version="2.0"
      >
        <Geolocation />
        <Marker position={markerPosition} />
      </Map>
      <button onClick={handleSubmit}>Submit</button>
      <div>Address: {address}</div>
    </div>
  );
};

export default MapComponent;
