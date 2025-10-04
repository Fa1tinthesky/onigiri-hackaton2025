import * as Cesium from 'cesium';
import 'cesium/Widgets/widgets.css';

export function createCesiumViewer(container) {
    return new Cesium.Viewer(container, {
        terrainProvider: Cesium.createWorldTerrain()
    });
}
