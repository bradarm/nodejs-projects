import {
    Cartesian3,
    createOsmBuildingsAsync,
    HeadingPitchRange,
    HeadingPitchRoll,
    Ion,
    Math,
    Model,
    ModelAnimationLoop,
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

// Start the simulation time
viewer.clock.shouldAnimate = true;

// Add Cesium OSM Buildings, a global 3D buildings layer.
// Uncomment the following lines to add 3D buildings to the globe.
// createOsmBuildingsAsync().then((buildingTileset) => {
//     viewer.scene.primitives.add(buildingTileset);
// });

// Load glb-config.json and add 3D models to the globe.
fetch("glb-config.json")
    .then((response) => response.json())
    .then(async (data) => {
        for (const asset of data.assets) {
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

            const model = await Model.fromGltfAsync({
                url: asset.modelPath,
                modelMatrix: Transforms.headingPitchRollToFixedFrame(position, hpr),
                minimumPixelSize: asset.pixelSize,
                maximumPixelSize: asset.pixelSize,
            });

            viewer.scene.primitives.add(model);

            const intervalId = setInterval(() => {
                if (model.ready) {
                    if (asset.animation && asset.animation !== "None") {
                        var animationLoop = ModelAnimationLoop.NONE;
                        if (asset.animation.animationLoop) {
                            animationLoop = ModelAnimationLoop.REPEAT;
                        }
                        model.activeAnimations.add({
                            loop: animationLoop,
                            name: asset.animation.animationName,
                            speed: asset.animation.animationSpeed,
                        });
                    }

                    console.log(`Added ${asset.name} to the scene`);
                    clearInterval(intervalId);
                }
            }, 100);
        }
    });