import { Cartesian3, HeadingPitchRoll, JulianDate, Transforms } from 'cesium';
import * as SATELLITE from 'satellite.js';

export default class Sat {
    constructor(
        id,
        tle1,
        tle2,
        entity,
    ) {
        this.id = id;
        this.satrec = SATELLITE.twoline2satrec(tle1, tle2);
        this.entity = entity;
        this.entity.description = "";
    }

    computePositionAndVelocityECEF(clock) {
        // Computes the satellite's ECEF position and velocity at the given time
        const date = JulianDate.toDate(clock.currentTime);
        const positionAndVelocity = SATELLITE.propagate(this.satrec, date);
        const gmst = SATELLITE.gstime(date);
        const newPositionEcef = SATELLITE.eciToEcf(positionAndVelocity.position, gmst);
        const newVelocityEcef = SATELLITE.eciToEcf(positionAndVelocity.velocity, gmst);
        const newPosition = new Cartesian3(newPositionEcef.x * 1000.0, newPositionEcef.y * 1000.0, newPositionEcef.z * 1000.0);
        const newVelocity = new Cartesian3(newVelocityEcef.x * 1000.0, newVelocityEcef.y * 1000.0, newVelocityEcef.z * 1000.0);
        return {
            'position': newPosition,
            'velocity': newVelocity,
        };
    }

    computePositionGeodesic(clock) {
        // Computes the satellite's Geodesic position at the given time
        const date = JulianDate.toDate(clock.currentTime);
        const positionAndVelocity = SATELLITE.propagate(this.satrec, date);
        const gmst = SATELLITE.gstime(date);
        const geodeticPosition = SATELLITE.eciToGeodetic(positionAndVelocity.position, gmst);
        const newPosition = new Cartesian3(SATELLITE.degreesLong(geodeticPosition.longitude), SATELLITE.degreesLat(geodeticPosition.latitude), geodeticPosition.height* 1000)
        return newPosition;
    }

    computeTrajectory(clock) {
        // Computes the trajectory of a satellite at the given time
        const date = clock.currentTime;
        let trajectoryPositions = new Array();
        for (let minutes = -45; minutes <= 45; minutes+=1) {
            const timeJulian = JulianDate.addMinutes(date, minutes, new JulianDate());
            const timeDate = JulianDate.toDate(timeJulian);
            const positionAndVelocity = SATELLITE.propagate(this.satrec, timeDate);
            const gmst = SATELLITE.gstime(timeDate);
            const newPositionGeodetic = SATELLITE.eciToGeodetic(positionAndVelocity.position, gmst);
            trajectoryPositions.push(newPositionGeodetic.longitude);
            trajectoryPositions.push(newPositionGeodetic.latitude);
            trajectoryPositions.push(newPositionGeodetic.height * 1000);
        }
        return Cartesian3.fromRadiansArrayHeights(trajectoryPositions);
    }

    computeHeadingPitchRoll(position, velocity) {
        // Computes the satellite's orientation (Heading, Pitch, Roll) given position and velocity in ECEF
        const positionNormalized = Cartesian3.normalize(position, new Cartesian3());
        const nadirVector = new Cartesian3(positionNormalized.x * -1.0, positionNormalized.y * -1.0, positionNormalized.z * -1.0)
        const newVelocityNormalized = Cartesian3.normalize(velocity, new Cartesian3());
        const unitZVector = new Cartesian3(0.0, 0.0, 1.0);
        const projectedZVector = Cartesian3.cross(Cartesian3.cross(nadirVector, unitZVector, new Cartesian3()), nadirVector, new Cartesian3());
        const projectedVelocityVector = Cartesian3.normalize(Cartesian3.cross(nadirVector, newVelocityNormalized, new Cartesian3()), new Cartesian3());
        const heading = Cartesian3.angleBetween(projectedZVector, projectedVelocityVector);
        const pitch = SATELLITE.degreesToRadians(-90.0);
        const roll = 0.0;
        return {
            'heading': heading,
            'roll': roll,
            'pitch': pitch
        };
    }

    updateDescription(clock) {
        // Calculate the satellite's position and orientation
        const positionAndVelocityECEF = this.computePositionAndVelocityECEF(clock);
        const positionGeodesic = this.computePositionGeodesic(clock);
        const positionECEF = positionAndVelocityECEF.position;
        const velocityECEF = positionAndVelocityECEF.velocity;

        // Computes a satellite's description string
        let description = ''
        description += `<p><pre>`;
        description += `Geodetic Position [degrees, km]:<br /> longitude: ${positionGeodesic.x.toFixed(2)}<br /> latitude: ${positionGeodesic.y.toFixed(2)}<br /> height: ${(positionGeodesic.z / 1000).toFixed(2)}<br />`;
        description += `<br />`;
        description += `ECEF Position [km]:<br /> x: ${(positionECEF.x / 1000).toFixed(2)}<br /> y: ${(positionECEF.y / 1000).toFixed(2)}<br /> z: ${(positionECEF.z / 1000).toFixed(2)}<br />`;
        description += `<br />`;
        description += `ECEF Velocity [m/s]:<br /> x: ${velocityECEF.x.toFixed(2)}<br /> y: ${velocityECEF.y.toFixed(2)}<br /> z: ${velocityECEF.z.toFixed(2)}<br />`;
        description += `</pre></p>`;
        this.entity.description = description;
    }

    update(clock) {
        // Calculate the satellite's position and orientation
        const positionAndVelocityECEF = this.computePositionAndVelocityECEF(clock);
        const headingPitchRoll = this.computeHeadingPitchRoll(positionAndVelocityECEF.position, positionAndVelocityECEF.velocity);

        // Update position and orientation
        this.entity.position = positionAndVelocityECEF.position;
        this.entity.orientation = Transforms.headingPitchRollQuaternion(positionAndVelocityECEF.position, new HeadingPitchRoll(headingPitchRoll.heading, headingPitchRoll.pitch, headingPitchRoll.roll));
    }
}