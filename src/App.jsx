import React from "react";
import WorldMap from "./components/WorldMap";

function App() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",  // ocupa toda a tela
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <WorldMap />
    </div>
  );
}

export default App;
