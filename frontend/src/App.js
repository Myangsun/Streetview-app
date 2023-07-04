import React from "react";
import MapComponent from "./components/MapComponent";
import Header from "./components/Header";

function App() {
  return (
    <div className="App h-screen w-screen bg-gray-100 overflow-auto">
      <Header />
      <MapComponent />
    </div>
  );
}

export default App;
