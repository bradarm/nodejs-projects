import { Cartesian2, Cartesian3, Color, HorizontalOrigin, Ion, PolylineDashMaterialProperty, Terrain, Viewer, VerticalOrigin, defined } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

import Sat from './sat.js';

Ion.defaultAccessToken = process.env.CESIUM_TOKEN;

export default class Visualizer{
    constructor() {
        // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
        this.viewer = new Viewer('cesiumContainer', {
            canAnimate: true,
            msaaSamples: 4,
            shouldAnimate: true,
            terrain: Terrain.fromWorldTerrain(),
            infoBox: true,
            useBrowserRecommendedResolution: false,  // explicitly use window.devicePixelRatio
            vrButton: false,
        });

        // use window.devicePixelRatio
        this.viewer.resolutionScale = 1.0;

        this.viewer.scene.globe.enableLighting = true;
        this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 100000000;
        this.viewer.scene.debugShowFramesPerSecond = true;

        this.ENTITY_CONFIG = require('../config/entity-config.json');
        this.GLB_CONFIG = require('../config/glb-config.json');

        this.satellites = [];
        this.initSatellites();
    }

    initSatellites() {
        for (let i = 0; i < this.ENTITY_CONFIG.length; i++) {
            const entity_config = this.ENTITY_CONFIG[i];
            const asset_config = this.GLB_CONFIG[entity_config.asset];
            let entity = this.viewer.entities.add({
                id: entity_config.id,
                label: {
                    id: entity_config.id,
                    text: entity_config.id,
                    font: '10px sans-serif',
                    pixelOffset: new Cartesian2(0.0, -5.0),
                    horizontalOrigin: HorizontalOrigin.CENTER,
                    verticalOrigin: VerticalOrigin.BOTTOM
                },
                position: new Cartesian3(0,0,0),
                model: {
                    uri: asset_config.uri,
                    minimumPixelSize: asset_config.pixelSize,
                },
                description: ""
            });
            let sat = new Sat(entity_config.id, entity_config.tle1, entity_config.tle2, entity);
            this.satellites.push(sat);
        }
    }

    update(clock) {
        this.updateSatellites(clock);
    }

    updateSatellites(clock) {
        if (!(this.satellites === undefined)) {
            let i = 0;
            while (i < this.satellites.length) {
                let sat = this.satellites[i];
                sat.update(clock);

                // Update the satellite description if it is the current selected entity
                if (defined(this.viewer.selectedEntity) && defined(this.viewer.selectedEntity.id))
                {
                    if (sat.id == this.viewer.selectedEntity.id) {
                        sat.updateDescription(clock);
                    }
                }

                i++;
            }
        }
    }

    displaySatelliteTrajectory(sat, clock) {
        const trajectoryPositions = sat.computeTrajectory(clock);
        if (this.satTrajectory === undefined) {
            this.satTrajectory = this.viewer.entities.add({
                polyline: {
                    positions: trajectoryPositions,
                    width: 1,
                    material: new PolylineDashMaterialProperty({
                        color: Color.LIMEGREEN,
                        dashLength: 25.0,
                    })
                }
            });
        }
    }
}