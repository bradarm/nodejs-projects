# Sample ThreeJS Devcontainer
A starter CesiumJS devcontainer, leveraging [Cesium's Webpack 4 Example](https://github.com/CesiumGS/cesium-webpack-example/tree/main/webpack-4).

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

1. Once the devcontainer has built and the project has reopened, launch the application via `F5` or:
    ```
    Run and Debug -> Run Application
    ```

1. Once webpack has built and deployed the application, it can be accessed at:
    ```
    http://localhost:8080
    ```