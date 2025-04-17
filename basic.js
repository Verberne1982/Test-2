// c:\Users\rolan\OneDrive\Bureaublad\Belangrijk\Afgerond\Buitenspeeltuin\Games\Test 2\basic.js
// Refactored for dynamic updates and efficiency

console.log("basic.js is loaded");

window.onload = () => {
    console.log("Window loaded");

    // --- Game State Variables ---
    let poisLoaded = false; // Flag to ensure POIs are loaded only once
    let totalPoints = 0;
    let currentLatitude = null;
    let currentLongitude = null;
    let pois = []; // Array to hold POI data and their A-Frame elements
    let updateInterval = null; // Single interval for all updates
    let combineButton = null;
    let currentTargetPoiIndex = -1; // Index in the 'pois' array of the POI currently in range
    let timerInterval = null;
    let timeRemaining = 60; // Start with 60 seconds

    // --- DOM Elements ---
    const scene = document.querySelector("a-scene");
    const camera = document.querySelector("[gps-new-camera]");
    // *** IMPORTANT: Add these elements to your HTML body ***
    // Use standard HTML for UI elements like timer and points for easier management
    const timerDisplay = document.getElementById("timer-display"); // e.g., <span id="timer-display">1:00</span>
    const pointsDisplay = document.getElementById("points-display"); // e.g., <span id="points-display">0</span>

    // --- Initial Checks ---
    if (!camera) {
        console.error("GPS camera element '[gps-new-camera]' not found!");
        alert("Error: GPS camera element not found. Cannot start game.");
        return;
    }
    if (!scene) {
        console.error("A-Frame scene '<a-scene>' not found!");
        alert("Error: A-Frame scene not found. Cannot start game.");
        return;
    }
     if (!timerDisplay || !pointsDisplay) {
        // If using a-text instead, select them here. Otherwise, ensure HTML elements exist.
        console.error("UI elements for timer ('#timer-display') or points ('#points-display') not found in HTML.");
        alert("Error: UI elements (timer/points display) not found. Please add them to your HTML (see suggestion at bottom).");
        return; // Stop if UI elements are missing
    }
    if (typeof AFRAME === 'undefined' || typeof AFRAME.components['gps-new-camera'] === 'undefined') {
        console.error("AR.js library not loaded or gps-new-camera component not found");
        alert("Error: AR.js library not loaded correctly.");
        return;
    }

    // --- Initialization ---
    updatePointsDisplay(); // Set initial points display (0)
    createCombineButton(); // Create the button structure (initially hidden)

    // --- Event Listener for GPS Updates ---
    camera.addEventListener("gps-camera-update-position", (e) => {
        // Always update the current user position
        currentLatitude = e.detail.position.latitude;
        currentLongitude = e.detail.position.longitude;
        // console.log("GPS position updated:", currentLatitude, currentLongitude); // Can be noisy, uncomment for debugging

        // Load POIs only on the first valid GPS update
        if (!poisLoaded && currentLatitude && currentLongitude) {
            console.log(`Got first GPS position: lon ${currentLongitude}, lat ${currentLatitude}`);
            loadPois(); // Load and display the points of interest
            poisLoaded = true;

            // Only start the game loop and timer if POIs were actually loaded
            if (pois.length > 0) {
                startUpdateLoop(); // Start the main loop for distance checks and text updates
                startTimer(); // Start the game timer
            } else {
                console.warn("No POIs loaded within range, game loop and timer not started.");
                // Optionally display a message to the user
                alert("No points of interest found nearby (within 1km).");
            }
        }
    });

    // --- Functions ---

    /**
     * Loads POIs from static data, creates A-Frame entities,
     * calculates initial distance, and stores references.
     */
    function loadPois() {
        // Static POIs (replace with dynamic loading if needed)
        const staticPois = [
            { name: "POI 1", location: { coordinates: [51.39469141180008, 5.472743696095106] } },
            { name: "POI 2", location: { coordinates: [51.39476082482901, 5.472648803874907] } }, // Close one
            { name: "POI 3", location: { coordinates: [51.398, 5.470] } },
            { name: "POI 4", location: { coordinates: [51.400, 5.460] } }
        ];

        pois = []; // Clear any previous POIs if this function were called again

        staticPois.forEach((poiData, index) => {
            const { coordinates } = poiData.location;
            const name = poiData.name || `POI ${index + 1}`;
            const lat = coordinates[0];
            const lon = coordinates[1];

            // Calculate initial distance using the first valid user coordinates
            const distance = calculateDistance(currentLatitude, currentLongitude, lat, lon);
            console.log(`Initial distance to ${name}: ${distance.toFixed(1)} meters`);

            // Filter out POIs that are too far away initially
            if (distance > 5000) { // Render only POIs within 1 km initially
                console.log(`POI ${name} is too far (${distance.toFixed(1)}m), skipping.`);
                return; // Skip this POI
            }

            // Scale based on initial distance (larger when closer)
            // Added Math.max(1, distance) to prevent division by zero if distance is 0
            const scale = Math.max(10, Math.min(100, 5000 / Math.max(1, distance)));

            // Create the parent entity for the POI
            const compoundEntity = document.createElement("a-entity");
            compoundEntity.setAttribute("gps-new-entity-place", {
                latitude: lat,
                longitude: lon,
            });
            compoundEntity.setAttribute("data-poi-name", name); // Useful for debugging

            // Create the visual box
            const box = document.createElement("a-box");
            box.setAttribute("scale", `${scale} ${scale} ${scale}`);
            // Color based on initial distance
            box.setAttribute("material", { color: distance < 50 ? "red" : (distance < 500 ? "green" : "blue") }); // Red if very close
            box.setAttribute("position", `0 ${scale / 2} 0`); // Position box relative to entity center

            // Create the text label
            const text = document.createElement("a-text");
            const fixedTextScale = 5; // Keep text scale relatively constant and readable
            // Set initial text value including the calculated distance
            text.setAttribute("value", `${name}\n(${Math.round(distance)}m)`);
            text.setAttribute("look-at", "[gps-new-camera]"); // Make text face the user
            text.setAttribute("scale", `${fixedTextScale} ${fixedTextScale} ${fixedTextScale}`);
            text.setAttribute("align", "center");
            text.setAttribute("position", `0 ${scale + fixedTextScale * 0.6} 0`); // Position text above the box

            // Append elements to the compound entity
            compoundEntity.appendChild(box);
            compoundEntity.appendChild(text);

            // Append the compound entity to the scene
            scene.appendChild(compoundEntity);
            console.log(`Added POI: ${name} to the scene`);

            // Store POI data along with references to its A-Frame elements
            // This is crucial for updating the text later
            pois.push({
                name: name,
                latitude: lat,
                longitude: lon,
                entity: compoundEntity, // Reference to the parent entity
                textElement: text,      // Reference to the text element
                boxElement: box         // Reference to the box element (optional, for clicks etc.)
            });

            // Optional: Add click listener directly to the box for info
            box.addEventListener("click", () => {
                // Calculate distance *at the time of click* using current location
                const currentDist = calculateDistance(currentLatitude, currentLongitude, lat, lon);
                alert(`You clicked on: ${name} (${currentDist.toFixed(1)}m away)`);
            });
        });

        console.log(`Loaded ${pois.length} POIs within range.`);
    }

    /**
     * Calculates the distance between two GPS coordinates using the Haversine formula.
     * Returns distance in meters.
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            // console.warn("Cannot calculate distance - missing coordinates.");
            return Infinity; // Return infinity if coordinates are invalid
        }
        const R = 6371e3; // Earth's radius in meters
        const phi1 = (lat1 * Math.PI) / 180; // φ, λ in radians
        const phi2 = (lat2 * Math.PI) / 180;
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
        const deltaLambda = ((lon2 - lon1) * Math.PI) / 180; // Corrected: lon2 - lon1

        const a =
            Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Starts the main update loop. This single interval handles:
     * - Calculating distances to all POIs based on current user location.
     * - Updating the text label of each POI with the current distance.
     * - Checking for proximity to trigger the "Combine" button.
     */
    function startUpdateLoop() {
        if (updateInterval) clearInterval(updateInterval); // Clear existing interval if any

        console.log("Starting main update loop (distance checks and text updates).");
        const updateFrequency = 2500; // Check every 2.5 seconds (adjust as needed for performance/responsiveness)

        updateInterval = setInterval(() => {
            // Ensure we have a current location and active POIs
            if (currentLatitude === null || currentLongitude === null || pois.length === 0) {
                manageCombineButton(-1); // Hide button if no position or no POIs left
                return; // Skip update if no location or no POIs
            }

            let closestPoiInRangeIndex = -1;
            let minDistanceFound = 2.0; // Proximity threshold in meters for the "Combine" button

            // Iterate through all *currently active* POIs
            for (let i = 0; i < pois.length; i++) {
                const poi = pois[i];

                // Calculate distance using the LATEST user coordinates
                const distance = calculateDistance(currentLatitude, currentLongitude, poi.latitude, poi.longitude);

                // --- Requirement 1: Update POI text with current distance ---
                // Check if the text element still exists before trying to update it
                if (poi.textElement) {
                    poi.textElement.setAttribute('value', `${poi.name}\n(${Math.round(distance)}m)`);
                } else {
                    console.warn(`Text element for ${poi.name} not found for update.`);
                }

                // --- Requirement 2: Check proximity for Combine button ---
                // console.log(`Distance check to ${poi.name}: ${distance.toFixed(1)}m`); // For debugging

                // Check if this POI is the closest one found *so far* within the combine range
                if (distance <= minDistanceFound) {
                     // If you want the button for *any* POI in range, uncomment the next line and remove the check in the outer if
                     // closestPoiInRangeIndex = i;
                     // break; // Optimization: Stop checking once one POI is found in range

                     // If you want the button *only* for the absolute closest POI within range:
                     if (closestPoiInRangeIndex === -1 || distance < calculateDistance(currentLatitude, currentLongitude, pois[closestPoiInRangeIndex].latitude, pois[closestPoiInRangeIndex].longitude)) {
                         closestPoiInRangeIndex = i;
                     }
                     // minDistanceFound = distance; // Update minimum distance if needed for other logic
                }
            }

            // Update button state based on whether *any* POI was found in range
            manageCombineButton(closestPoiInRangeIndex);

        }, updateFrequency);
    }

    /**
     * Creates the Combine button DOM element (if it doesn't exist)
     * and adds its click listener.
     */
    function createCombineButton() {
        if (combineButton) return; // Already created

        combineButton = document.createElement("button");
        combineButton.id = "combine-button";
        combineButton.textContent = "Combine"; // Default text
        // Apply styling
        combineButton.style.position = "absolute";
        combineButton.style.bottom = "20px";
        combineButton.style.left = "50%";
        combineButton.style.transform = "translateX(-50%)";
        combineButton.style.padding = "12px 25px";
        combineButton.style.fontSize = "18px";
        combineButton.style.backgroundColor = "#28a745"; // Green
        combineButton.style.color = "white";
        combineButton.style.border = "none";
        combineButton.style.borderRadius = "5px";
        combineButton.style.cursor = "pointer";
        combineButton.style.zIndex = "10000"; // Ensure it's on top of AR view
        combineButton.style.display = 'none'; // Start hidden

        combineButton.addEventListener("click", handleCombineClick); // Attach the handler
        document.body.appendChild(combineButton);
        console.log("Combine button created (initially hidden).");
    }

    /**
     * Shows or hides the Combine button based on proximity and updates its text.
     * @param {number} poiIndex - Index of the POI in range in the `pois` array, or -1 if none.
     */
    function manageCombineButton(poiIndex) {
        if (!combineButton) {
            console.error("manageCombineButton called before button was created.");
            return;
        }

        currentTargetPoiIndex = poiIndex; // Store the index of the POI currently targeted by the button

        if (poiIndex !== -1 && poiIndex < pois.length) {
            // A POI is in range, show the button
            const targetPoiName = pois[poiIndex].name;
            combineButton.textContent = `Combine ${targetPoiName}`; // Update button text
            combineButton.style.display = 'block'; // Show button
        } else {
            // No POI in range or index out of bounds
            combineButton.style.display = 'none'; // Hide button
        }
    }

    /**
     * Handles the click event for the single Combine button.
     */
    function handleCombineClick() {
        if (currentTargetPoiIndex === -1 || currentTargetPoiIndex >= pois.length) {
            console.warn("Combine clicked, but no valid target POI index:", currentTargetPoiIndex);
            manageCombineButton(-1); // Hide button just in case
            return; // Safety check
        }

        // Get the POI object using the stored index
        const poiToCombine = pois[currentTargetPoiIndex];
        console.log(`Combine button clicked for: ${poiToCombine.name}`);

        // Award points based on remaining time
        if (timeRemaining > 0) {
            totalPoints += timeRemaining; // Add remaining seconds as points
            updatePointsDisplay();
            console.log(`Awarded ${timeRemaining} points. Total points: ${totalPoints}`);
        } else {
            console.log("Time was up, no points awarded for this combination.");
        }

        alert(`Combination successful with ${poiToCombine.name}!`);

        // Remove the POI's A-Frame entity from the scene
        if (poiToCombine.entity && poiToCombine.entity.parentNode === scene) {
             scene.removeChild(poiToCombine.entity);
            console.log(`Removed ${poiToCombine.name} entity from scene.`);
        } else {
            console.warn(`Could not find entity for ${poiToCombine.name} in the scene to remove.`);
        }

        // Remove the POI from the active list using the correct index
        // This prevents it from being checked in the update loop again
        pois.splice(currentTargetPoiIndex, 1);
        console.log(`Removed ${poiToCombine.name} from POI list. Remaining POIs: ${pois.length}`);

        // Reset target and hide button immediately
        manageCombineButton(-1);

        // Check game end condition or restart timer for the next POI
        if (pois.length === 0) {
            alert(`Congratulations! You found all POIs! Final Score: ${totalPoints}`);
            console.log("Game finished.");
            if (timerInterval) clearInterval(timerInterval); // Stop timer
            if (updateInterval) clearInterval(updateInterval); // Stop the main update loop
            timerDisplay.textContent = "Done!";
        } else {
            startTimer(); // Restart the timer for the next POI
        }
    }

    /**
     * Starts or restarts the game timer using the HTML element.
     */
    function startTimer() {
        console.log("Starting timer (60 seconds).");
        if (timerInterval) {
            clearInterval(timerInterval); // Stop any existing timer
        }

        timeRemaining = 60; // Reset time

        // Update display immediately to show 1:00
        timerDisplay.textContent = `1:00`;

        timerInterval = setInterval(() => {
            timeRemaining--;

            // Ensure time doesn't go below zero for display
            const displayTime = Math.max(0, timeRemaining);
            const minutes = Math.floor(displayTime / 60);
            const seconds = displayTime % 60;
            const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

            // Update the HTML timer display
            timerDisplay.textContent = formattedTime;

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = "0:00";
                console.log("Timer finished.");
                // Optionally handle timeout (e.g., alert, penalty)
                // alert("Time's up for this POI!");
            }
        }, 1000); // Update every second
    }

    /**
     * Updates the points display HTML element.
     */
    function updatePointsDisplay() {
        if (pointsDisplay) {
            pointsDisplay.textContent = totalPoints;
        }
    }
};

// --- HTML Structure Suggestion ---
/*
Add this inside your <body> tag, *outside* the <a-scene>:

<div id="ui-overlay" style="position: absolute; top: 10px; left: 10px; z-index: 10; color: white; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 5px; font-family: Arial, sans-serif; font-size: 16px;">
    <div>Time: <span id="timer-display">1:00</span></div>
    <div>Points: <span id="points-display">0</span></div>
</div>

<!-- The Combine button (<button id="combine-button">...) will be added here dynamically by the script -->
*/
