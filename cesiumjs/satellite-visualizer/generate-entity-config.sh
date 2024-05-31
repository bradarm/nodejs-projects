#!/bin/bash

# This script generates a JSON file that contains the configuration for the
# satellite entities in the CesiumJS satellite visualizer. The configuration
# includes the satellite id, the satellite's TLE, and the satellite's asset.

# The values of each satellite are taken from https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle

# The JSON file is written to ./config/entity-config.json

# The JSON file is an array of objects, where each object has the following properties:
# - id: The id of the satellite
# - tle1: The first line of the satellite's TLE
# - tle2: The second line of the satellite's TLE
# - asset: The path to the satellite's asset

OUTPUT_FILE="./config/entity-config.json"

# Create the config directory if it doesn't exist
mkdir -p config

# Get the satellite data from Celestrak
echo "Fetching satellite data from Celestrak..."
SATELLITE_DATA=$(curl -s 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&amp;FORMAT=tle')

echo "Generating $OUTPUT_FILE..."
# Split the data into an array of lines
IFS=$'\n' read -d '' -r -a LINES <<< "$SATELLITE_DATA"

# Initialize an empty array to store the satellite configurations
CONFIGS=()

# Iterate over the lines, grouping them into satellite configurations
for ((i = 0; i < ${#LINES[@]}; i += 3)); do
    ID=$(echo "${LINES[i]}" | sed 's/[[:space:]]*$//')
    TLE1=$(echo "${LINES[i + 1]}" | tr -d '\n\r')
    TLE2=$(echo "${LINES[i + 2]}" | tr -d '\n\r')
    ASSET="Satellite"

    # Add the satellite configuration to the array if the ID has not been seen before
    # Check if the satellite ID is already in the array
    EXISTS=false
    for ((j = 0; j < ${#CONFIGS[@]}; j++)); do
        if [[ "${CONFIGS[j]}" == *"$ID"* ]]; then
            EXISTS=true
            break
        fi
    done

    # If the satellite ID is not in the array, add it
    if [ "$EXISTS" = false ]; then
        CONFIGS+=(
"    {
        \"id\":\"$ID\",
        \"tle1\":\"$TLE1\",
        \"tle2\":\"$TLE2\",
        \"asset\":\"$ASSET\"
    }"
)
    fi
done

# Write the satellite configurations to a JSON file
echo "[" >$OUTPUT_FILE
for ((i = 0; i < ${#CONFIGS[@]}; i++)); do
    if (( $i != ${#CONFIGS[@]}-1 )); then
        echo "${CONFIGS[i]}," >>$OUTPUT_FILE
    else
        echo "${CONFIGS[i]}" >>$OUTPUT_FILE
    fi
done
echo "]" >>$OUTPUT_FILE

echo "Generated $OUTPUT_FILE"