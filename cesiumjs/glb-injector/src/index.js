import {
  Cartesian3,
  createOsmBuildingsAsync,
  HeadingPitchRange,
  HeadingPitchRoll,
  Ion,
  Math,
  Terrain,
  Transforms,
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

// Load glb-config.json and add 3D models to the globe.
// An example entry looks like so:
// {
//   "assets": [
//     {
//         "name": "Godzilla 1",
//         "position": {
//             "longitudeDegrees": -74.0060,
//             "latitudeDegrees": 40.7128,
//             "heightMeters": 0
//         },
//         "pixelSize": 256,
//         "modelPath": "assets/glb/godzilla.glb"
//     }
// }
fetch("glb-config.json")
  .then((response) => response.json())
  .then((data) => {
    data.assets.forEach((asset) => {
      const position = Cartesian3.fromDegrees(
        asset.position.longitudeDegrees,
        asset.position.latitudeDegrees,
        asset.position.heightMeters
      );

      const heading = Math.toRadians(asset.orientation.headingDegrees);
      const pitch = Math.toRadians(asset.orientation.pitchDegrees);
      const roll = Math.toRadians(asset.orientation.rollDegrees);

      const hpr = new HeadingPitchRoll(heading, pitch, roll);
      const orientation = Transforms.headingPitchRollQuaternion(
        position,
        hpr
      );

      viewer.entities.add({
        name: asset.name,
        position: position,
        orientation: orientation,
        model: {
          uri: asset.modelPath,
          minimumPixelSize: asset.pixelSize,
        },
      });
    });
  });