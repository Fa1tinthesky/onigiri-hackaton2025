import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { assert } from "../utils/assert.js";
import get_tiles_url from "../lib/get_tiles.js";
import pollutionPanel from "./pollutionPanel.jsx";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_API;

/**
 * @param {Cesium.Viewer} viewer
 * @param {HTMLCanvasElement} canvas
 * @param {Object} bounds*/
function addHeatmap(viewer, canvas, bounds) {
  const img = new Image();

  img.onload = () => {
    const imageryProvider = new Cesium.SingleTileImageryProvider({
      url: img.src,
      rectangle: Cesium.Rectangle.fromDegrees(
        bounds.west,
        bounds.south,
        bounds.east,
        bounds.north
      ),
    });

    viewer.imageryLayers.addImageryProvider(imageryProvider);
  };

  img.src = canvas.toDataURL();
}

/**
 * @function
 * @param {Cesium.Viewer} viewer - will be modified to load boundaries.
 * @throws {AssertionError} When input is not a correct Cesium viewer.
 * @returns {Promise<void>}
 */
const loadBoundaries = async (viewer) => {
  assert(!!viewer?.dataSources, "Must be a viewer object with dataSources");

  try {
    const geoJsonSource = new Cesium.GeoJsonDataSource();
    const geoJsonUrl =
      "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

    geoJsonSource
      .load(geoJsonUrl, {
        clampToGround: true,
        stroke: Cesium.Color.RED, // enable outlines
        strokeWidth: 2,
        fill: Cesium.Color.TRANSPARENT,
      })
      .then((dataSource) => {
        viewer.dataSources.add(dataSource);

        dataSource.entities.values.forEach((entity) => {
          const props = entity.properties;

          if (
            props &&
            props.continent &&
            props.continent.getValue() === "North America"
          ) {
            if (entity.polygon) {
              const positions = entity.polygon.hierarchy.getValue(
                Cesium.JulianDate.now()
              ).positions;
              viewer.entities.add({
                polyline: {
                  positions: positions,
                  clampToGround: true,
                  material: Cesium.Color.RED,
                  width: 2,
                },
              });
              entity.polygon.show = new Cesium.ConstantProperty(false);
            } else {
              entity.show = false;
            }
          }
        });

        return geoJsonSource;
      })
      .catch((e) => {
        console.log("Error trying obtain outline data", e);
      });
  } catch (error) {
    console.error("Error loading country data:", error);
  }

  // viewer.zoomTo(dataSource);
};

async function loadTiles(viewer) {
  assert(
    viewer?.dataSources && viewer?.scene,
    "Must be a viewer object with dataSources"
  );
  const url = await get_tiles_url();

  console.info(url);
  viewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: url,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 6,
    })
  );
}

/**
 * @function Higher-order function that binds all handlers
 * @param {Cesium.Viewer} viewer that will be modified
 * @param {Array<Function>} action_handlers - an array of handlers to be binded
 * @throws {AssertionError} When input is not a correct Cesium viewer.
 * @returns {Cesium.ScreenSpaceEventHandler};
 * */
function momyHandler(viewer, action_handlers, callback_handlers) {
  assert(
    !!viewer?.dataSources && !!viewer?.scene,
    "Must be an existing viewer"
  );

  console.info("Viewer state:", viewer.isDestroyed());
  if (!!viewer.isDestroyed()) {
    console.info("Called upon destroyed viewer");
    return;
  }

  console.log("Momy was summoned");
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  for (let i = 0; i < action_handlers.length; ++i) {
    if (callback_handlers[i]) {
      action_handlers[i](viewer, handler, callback_handlers[i]);
    } else {
      action_handlers[i](viewer, handler);
    }
  }

  return handler;
}

/**
 * @function This function is not pure.
 * @todo Add requests to the server with lat and lon. Finish doc for handler
 * @param {Cesium.Viewer} viewer that will be modified
 * @param {Cesium.ScreenSpaceEventHandler} handler
 * @throws {AssertionError} When input is not a correct Cesium viewer.
 * @returns {void}
 * */
/**
 * @function addClickHandler
 * @param {Cesium.Viewer} viewer - The Cesium viewer instance
 * @param {Cesium.ScreenSpaceEventHandler} handler - Cesium click handler
 * @param {(lon: number, lat: number) => void} onClick - Callback invoked when user clicks on map
 * @throws {AssertionError} When viewer is not valid
 * @returns {void}
 */
function addClickHandler(viewer, handler, onClick) {
  assert(!!viewer.scene, "Viewer didn't load properly");

  let pin = null;
  const pin_config = {
    name: "pin",
    color: Cesium.Color.RED,
  };

  handler.setInputAction(function (movement) {
    const scene = viewer.scene;
    const pickedPosition = scene.pickPosition(movement.position);

    if (Cesium.defined(pickedPosition)) {
      const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      if (onClick) onClick(longitude, latitude);

      // Manage the pin on map
      if (pin) viewer.entities.remove(pin);
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
          font: "24pt monospace",
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
 * @param {Cesium.ScreenSpaceEventHandler} handler
 * @throws {AssertionError} When input is not a correct Cesium viewer.
 * @returns {void}
 * */
function addHoverHandler(viewer, handler) {
  /** @type {Object} */
  let highlightedEntity = null;

  assert(!!viewer.scene, "Viewer didn't load properly");
  const scene = viewer.scene;

  handler.setInputAction(function (movement) {
    const pickedObject = scene.pick(movement.endPosition);

    if (highlightedEntity) {
      highlightedEntity.polygon.material = highlightedEntity.originalMaterial;
      highlightedEntity = null;
    }

    if (
      Cesium.defined(pickedObject) &&
      pickedObject.id &&
      pickedObject.id.polygon
    ) {
      highlightedEntity = pickedObject.id;
      highlightedEntity.originalMaterial = highlightedEntity.polygon.material;
      highlightedEntity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.7);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

const CesiumViewer = ({ handler, layer }) => {
  const cesiumContainer = useRef(null);
  const [pin, setPin] = useState(null);
  const eventHandler = useRef(null);
  const isInitializing = useRef(false);

  const viewer = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeCesium = async () => {
      if (
        cesiumContainer.current &&
        !viewer.current &&
        !isInitializing.current
      ) {
        isInitializing.current = true;
        try {
          // Better performance
          // const terrainProvider = new Cesium.EllipsoidTerrainProvider();

          console.log("Here at least");
          const worldTerrain = await Cesium.createWorldTerrainAsync();
          Cesium.RequestScheduler.maximumRequestsPerServer = 3;

          viewer.current = new Cesium.Viewer(cesiumContainer.current, {
            terrainProvider: worldTerrain,
            skyAtmosphere: new Cesium.SkyAtmosphere(),
            dataSources: new Cesium.DataSourceCollection(),
            baseLayerPicker: true,
            vrButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            animation: false,
            creditContainer: document.createElement("div"), // Hide credits
            timeline: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            selectionIndicator: false,
          });

          viewer.current.scene.sun = new Cesium.Sun();
          viewer.current.scene.moon = new Cesium.Moon();

          viewer.current.scene.globe.depthTestAgainstTerrain = false;
          viewer.current.scene.globe.terrainExaggeration = 1.0;

          // Smooth camera controls
          viewer.current.cesiumWidget.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
          );
          viewer.current.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

          const entities = [
            {
              name: "North America",
              position: Cesium.Cartesian3.fromDegrees(48.17, -100.17),
              color: Cesium.Color.RED,
            },
          ];

          /* const northAmericaRectangle = viewer.current?.entities.add({
                        name: "North America",
                        rectangle: {
                            coordinates: Cesium.Rectangle.fromDegrees(
                                -168.0, // west: slightly west of Alaska
                                5.0,    // south: slightly south of Panama
                                -50.0,  // east: slightly east of Greenland
                                83.0    // north: slightly north of northern Canada
                            ),                            material: Cesium.Color.RED.withAlpha(0.5), // semi-transparent red
                            outline: true,
                            outlineColor: Cesium.Color.WHITE,
                            outlineWidth: 2,
                        }
                    }); */

          entities.forEach((entity) => {
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
                font: "24pt monospace",
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -9),
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
              },
            });
          });

          // await loadBoundaries(viewer.current);

          // const na_bounds = { west: -130, south: 20, east: -60, north: 50 };
          // let heatmap_canvas = await render_aqi_points(viewer.current, na_bounds);
          // addHeatmap(viewer.current, heatmap_canvas, na_bounds);

          console.log("RUNNING URL FETCHING");
          await loadTiles(viewer.current);

          eventHandler.current = momyHandler(
            viewer.current,
            [addClickHandler, addHoverHandler],
            [handler, null]
          );

          setIsLoading(false);
          console.log("CONFIG DONE");
        } catch (error) {
          console.error("Error initializing Cesium:", error);

          setIsLoading(false);
        }
      }
    };

    initializeCesium();
    return () => {
      // For some reason, this cleanup function runs before
      // the viewer is loaded, so I just added a timeout...
      // TODO: Find normal fix instead

      if (eventHandler.current && !eventHandler.current.isDestroyed()) {
        eventHandler.current.destroy();
        eventHandler.current = null;
      }

      if (viewer.current && !viewer.current.isDestroyed()) {
        viewer.current.destroy();
        viewer.current = null;
      }

      // Cleanup condition, might be used in future to keep memory clean.
      if (viewer.current && viewer.current.dataSources) {
        viewer.current.dataSources.remove(Cesium.GeoJsonDataSource, true);
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
          }}
        >
          Loading Cesium...
        </div>
      )}
      <div
        ref={cesiumContainer}
        className="cesium-container"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default CesiumViewer;
