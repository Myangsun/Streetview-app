import React from "react";
// import MapComponent from "./components/MapContainer";
// import MapContent from "./components/MapContent";
import MapComponent from "./components/Maptest";
import Header from "./components/Header";

function App() {
  return (
    <div className="App h-screen w-screen bg-gray-100 overflow-auto">
      <Header />
      {/* <MapComponent /> */}
      {/* <MapContent /> */}
      <MapComponent />
    </div>
  );
}

export default App;
