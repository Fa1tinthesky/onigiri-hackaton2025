import { useEffect, useState } from "react";
import "./css/Layers.css"

export default function Layers({ layers, toggleLayer }) {
    console.log("LAYERS LAYERS:", layers);
  return (
    <div className="layers-panel">
      <h4>🗺 Layers</h4>
      {Object.keys(layers).map((layer) => (
        <label key={layer} className="layer-checkbox">
          <input
            type="checkbox"
            checked={layers[layer]}
            onChange={() => toggleLayer(layer)}
          />
          {layer.charAt(0).toUpperCase() + layer.slice(1)}
        </label>
      ))}
    </div>
  );
}
