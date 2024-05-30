# CesiumJS GLB Injector
This project demonstrates how GLB assets can be configurably injected into Cesium. Out of the box, this example will spawn Godzilla in several locations around the world. However, any asset can be spawned provided its GLB exists in the `assets/glb` directory and it has been fully specified in `glb-config.json`.

## Setup
1. Create a free [Cesium Account](https://ion.cesium.com/signup/)

1. Go to [Cesium Ion](https://ion.cesium.com) and select `Access Tokens`

1. Create or reuse an existing access token with the following access:
    - assets:read
    - geocode

1. Copy the value under `Token`

1. Create a `.env` file in the root directory of this repository containing the following, where `<Token Value>` is replaced by the token copied in the previous step:
    ````
    CESIUM_TOKEN=<Token Value>
    ````

## Usage
1. Open this project in the provided devcontainer:
    ```
    F1-> DevContainers: Rebuild and Reopen in Container
    ```

1. Add or Remove GLB Assets to `./glb-injector/assets/glb`. [Sketchfab](https://sketchfab.com) is an excellent resource for GLB assets.

1. Update `glb-config.json` with the asset information required for your scene

1. Launch the application via `F5` or:
    ```
    Run and Debug -> Run Application
    ```

1. Once webpack has built and deployed the application, it can be accessed at:
    ```
    http://localhost:8080
    ```

## Attribution
"Godzilla" (https://skfb.ly/oHwV8) by David Wigforss is licensed under Creative Commons Attribution-NonCommercial (http://creativecommons.org/licenses/by-nc/4.0/).
