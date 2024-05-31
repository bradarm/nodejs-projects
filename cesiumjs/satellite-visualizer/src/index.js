import { defined } from 'cesium';

import Visualizer from './visualizer.js';

function main() {
    // Initialize the Visualizer
    var visualizer = new Visualizer();

    // Add a listener to the clock tick event
    visualizer.viewer.clock.onTick.addEventListener(function(clock) {
        visualizer.update(clock)
    });

    // Add a listener to the selected entity changed event to display or remove a satellite's trajectory
    visualizer.viewer.selectedEntityChanged.addEventListener(function(selectedEntity) {
        if (defined(selectedEntity) && defined(selectedEntity.id)) {
            if (!(visualizer.satellites === undefined)) {
                let i = 0;
                while (i < visualizer.satellites.length) {
                    let sat = visualizer.satellites[i];
                    if (sat.id == selectedEntity.id) {
                        if (!(visualizer.satTrajectory === undefined)) {
                            visualizer.viewer.entities.remove(visualizer.satTrajectory);
                            visualizer.satTrajectory = undefined
                        }
                        visualizer.displaySatelliteTrajectory(sat, visualizer.viewer.clock);
                        i = visualizer.satellites.length;  // exit loop
                    }
                    i++;
                }
            }
        }
        else {
            if (!(visualizer.satTrajectory === undefined)) {
                visualizer.viewer.entities.remove(visualizer.satTrajectory);
                visualizer.satTrajectory = undefined
            }
        }
    });
}

main();