import {
  Cartesian3,
  createOsmBuildingsAsync,
  Ion,
  Math,
  Terrain,
  Viewer,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./css/main.css";

import { config } from "dotenv";
config();

// Your access token can be found at: https://ion.cesium.com/tokens.
// Replace process.env.CESIUM_TOKEN;` with your Cesium ion access token,
// or create a new .env file in the root of the project with the following:
// CESIUM_TOKEN=your_access_token

Ion.defaultAccessToken = process.env.CESIUM_TOKEN;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
});

// Add Cesium OSM Buildings, a global 3D buildings layer.
// Uncomment the following lines to add 3D buildings to the globe.
// createOsmBuildingsAsync().then((buildingTileset) => {
//   viewer.scene.primitives.add(buildingTileset);
// });

// Fly the camera to Seattle at the given longitude, latitude, and height.
viewer.camera.flyTo({
  destination: Cartesian3.fromDegrees(-122.35, 47.5, 10000.0),
  orientation: {
    heading: Math.toRadians(0.0),
    pitch: Math.toRadians(-45.0),
  },
});