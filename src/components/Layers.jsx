import { useState } from "react";

export default function Layers() {
  const [layers, setLayers] = useState({
    temperature: true,
    pollution: true,
    wind: false,
  });

  const toggleLayer = (key) => {
    setLayers({ ...layers, [key]: !layers[key] });
  };

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
