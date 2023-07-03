import React from "react";
import MapComponent from "./components/MapContainer";
import Header from "./components/Header";

function App() {
  return (
    <div className="App h-screen bg-gray-100 overflow-hidden">
      <Header />
      <MapComponent />
    </div>
  );
}

export default App;
