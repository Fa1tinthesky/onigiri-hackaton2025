import React, {useEffect, useRef} from 'react';
import { createCesiumViewer } from '../lib/cesium';
import 'cesium/Widgets/widgets.css';

export function createCustomViewer(container) {
    const mapRef = useRef(null);

    useEffect(() => {
        const viewer = createCesiumViewer(mapRef.current);
        return () => viewer.destroy();
    }, []);

    return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
}
