import React, { useEffect, useRef, useState} from 'react';
import * as Cesium from 'cesium';
import { assert } from '../utils/assert.js';
import get_tiles from '../lib/get_tiles.js';

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_API;

/**
    * @function
    * @param {Cesium.Viewer} viewer - will be modified to load boundaries.
    * @throws {AssertionError} When input is not a correct Cesium viewer.
    * @returns {Promise<void>} 
    */
const loadBoundaries = async (viewer) => { 
    assert(viewer?.dataSources, "Must be a viewer object with dataSources");

    try {
        const geoJsonDataSource = new Cesium.GeoJsonDataSource();

        await viewer.dataSources.add(geoJsonDataSource);

        const geoJsonUrl = '/data/test.geojson';

        geoJsonDataSource
            .load(geoJsonUrl, {
                clampToGround: true,
            })
            .then((dataSource) => {
                dataSource.entities.values.forEach((entity) => {
                    if (entity.polygon) {
                        // entity.polygon.material = Cesium.Color.BLUE.withAlpha(1.0);
                        entity.polygon.material = Cesium.Color.TRANSPARENT;
                        entity.polygon.outline = true;
                        entity.polygon.outlineColor = Cesium.Color.RED;
                        entity.polygon.height = 20;
                        entity.polygon.outlineWidth = 3;
                    }
                });
            }).catch((e) => {
                console.log("Error trying obtain outline data", e);
            })        
    } catch (error) {
        console.error('Error loading country data:', error);
    }

    // viewer.zoomTo(dataSource);
}

async function loadTiles(viewer) {
    assert(viewer?.dataSources && viewer?.scene, "Must be a viewer object with dataSources");
    const url = await get_tiles();

    console.info(viewer);
    viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
            url: url,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 6
        })
    );
}

/** 
    * @function Higher-order function that binds all handlers
    * @param {Cesium.Viewer} viewer that will be modified
    * @param {Array<Function>} action_handlers - an array of handlers to be binded
    * @throws {AssertionError} When input is not a correct Cesium viewer.
    * @returns {void}
    * */
async function momyHandler(viewer, action_handlers) {
    assert(viewer?.dataSources && viewer?.scene && !viewer.isDestroyed(), "Must be a viewer loaded viewer");

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    
    for (const action_handler of action_handlers) {
            action_handler(viewer, handler);
    }
}

/**
    * @function This function is not pure.
    * @todo Add requests to the server with lat and lon. Finish doc for handler
    * @param {Cesium.Viewer} viewer that will be modified
    * @throws {AssertionError} When input is not a correct Cesium viewer.
    * @returns {Promise<void>} 
    * */
function addClickHandler(viewer, handler) { 
    let pin = null;
    const pin_config = {
        name: "pin",
        position: Cesium.Cartesian3.fromDegrees(50.0, 50.0),
        color: Cesium.Color.RED,                    
    }

    handler.setInputAction(function (movement) {
        const scene = viewer.scene;

        const pickedPosition = scene.pickPosition(movement.position);

        if (Cesium.defined(pickedPosition)) {
            const carthographic = Cesium.Cartographic.fromCartesian(pickedPosition);

            const longitude = Cesium.Math.toDegrees(carthographic.longitude);
            const latitude = Cesium.Math.toDegrees(carthographic.latitude);
            const height = carthographic.height;

            console.log(`Longitude: ${longitude}, Latitude: ${latitude}, height: ${height}`);
        
            if (pin) {
                viewer.entities.remove(pin);
            }

            pin = viewer.entities.add({
                name: pin_config.name,
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                id: "pin_configId",
                point: {
                    pixelSize: 8,
                    color: pin_config.color,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
                label: {
                    text: pin_config.name,
                    font: '24pt monospace',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -9),
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                },
            });
        } else {
            console.log("No terrain picked");
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


/**
    * @function This function is not pure.
    * @todo Add requests to the server with lat and lon.
    * @param {Cesium.Viewer} viewer that will be modified
    * @throws {AssertionError} When input is not a correct Cesium viewer.
    * @returns {Promise<void>} 
    * */
function addHoverHandler(viewer, handler) {
    /** @type {Object} */
    let highlightedEntity = null;
    const scene = viewer.scene;

    handler.setInputAction(function(movement) {
        const pickedObject = scene.pick(movement.endPosition);
        console.log(pickedObject);

        if (highlightedEntity) {
            highlightedEntity.polygon.material = highlightedEntity.originalMaterial;
            highlightedEntity = null;
        }

        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon) {
            highlightedEntity = pickedObject.id;
            highlightedEntity.originalMaterial = highlightedEntity.polygon.material;
            highlightedEntity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.7);
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

const CesiumViewer = () => {
    const cesiumContainer = useRef(null);
    const [pin, setPin] = useState(null);
    const viewer = useRef(null);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const initializeCesium = async () => {
            if (cesiumContainer.current && !viewer.current) {
                try {
                    // Better performance
                    // const terrainProvider = new Cesium.EllipsoidTerrainProvider();
                    
                    const worldTerrain = await Cesium.createWorldTerrainAsync();
                    Cesium.RequestScheduler.maximumRequestsPerServer = 2;

                    viewer.current = new Cesium.Viewer(cesiumContainer.current, {
                        terrainProvider: worldTerrain,
                      skyAtmosphere: new Cesium.SkyAtmosphere(),
                      dataSources: new Cesium.DataSourceCollection(),
                      baseLayerPicker: true,
                      vrButton: false,
                      sceneModePicker: false,
                      navigationHelpButton: false,
                      animation: false,
                      creditContainer: document.createElement('div'), // Hide credits
                      timeline: false,
                      fullscreenButton: false,
                      geocoder: false,
                      homeButton: false,
                      infoBox: false,
                      selectionIndicator: false,
                    });

                    viewer.current.scene.sun = new Cesium.Sun();
                    viewer.current.scene.moon = new Cesium.Moon();

                    // Enable depth testing for better visual quality
                    viewer.current.scene.globe.depthTestAgainstTerrain = true;

                    // Smooth camera controls
                    viewer.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                    viewer.current.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

                    const entities = [
                        {
                            name: 'New York City',
                            position: Cesium.Cartesian3.fromDegrees(-74.006, 40.7128),
                            color: Cesium.Color.CYAN,
                        },
                        {
                            name: 'London',
                            position: Cesium.Cartesian3.fromDegrees(-0.1276, 51.5074),
                            color: Cesium.Color.YELLOW,
                        },
                        {
                            name: 'Tokyo',
                            position: Cesium.Cartesian3.fromDegrees(139.6917, 35.6895),
                            color: Cesium.Color.LIME,
                        },
                        {
                            name: "Indonesia",
                            position: Cesium.Cartesian3.fromDegrees(117.0, 0.0, 50),
                            color: Cesium.Color.RED,
                        },
                        {
                            name: "North America",
                            position: Cesium.Cartesian3.fromDegrees(48.17, -100.17),
                            color: Cesium.Color.RED,
                        },
                    ];

                    entities.forEach(entity => {
                        viewer.current?.entities.add({
                            name: entity.name,
                            position: entity.position,
                            point: {
                                pixelSize: 8,
                                color: entity.color,
                                outlineColor: Cesium.Color.WHITE,
                                outlineWidth: 2,
                                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                            },
                            label: {
                                text: entity.name,
                                font: '24pt monospace',
                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                outlineWidth: 2,
                                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                pixelOffset: new Cesium.Cartesian2(0, -9),
                                fillColor: Cesium.Color.WHITE,
                                outlineColor: Cesium.Color.BLACK,
                            },
                        });
                    });


                    setIsLoading(false);
                } catch (error) {
                    console.error('Error initializing Cesium:', error);

                    setIsLoading(false);
                }
            }
        };

        initializeCesium().then("CONFIG DONE");

        return () => {
            // For some reason, this cleanup function runs before
            // the viewer is loaded, so I just added a timeout...
            // TODO: Find normal fix instead
            setTimeout(() => { 
                if (viewer.current) {
                    viewer.current.destroy();
                    viewer.current = null;
                }
            }, 3500);

        };
    }, []); 

    useEffect(() => {
        if (viewer.current && viewer.current.scene) {
            loadTiles(viewer.current);
            loadBoundaries(viewer.current);

            momyHandler(viewer.current, [addClickHandler, addHoverHandler]);
        }
    }, [viewer.current]);



  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px'
        }}>
          Loading Cesium...
        </div>
      )}
      <div 
        ref={cesiumContainer}
        className='cesium-container'
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );};

export default CesiumViewer;

