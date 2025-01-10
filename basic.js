console.log("basic.js is loaded");

window.onload = () => {
    console.log("Window loaded");

    // Variabelen voor het bijhouden van de staat van het spel
    let downloaded = false; // Voorkomt dat de GPS-data meerdere keren wordt gedownload
    let totalPoints = 0; // Houdt het totaal aantal punten bij
    let lastUpdateTime = 0; // Houdt de tijd bij van de laatste GPS-update

    // Het element waarin de GPS-camera wordt weergegeven
    const el = document.querySelector("[gps-new-camera]");
    console.log("GPS camera element:", el);

    if (!el) {
        console.error("GPS camera element not found");
        return;
    }

    // Controleer of de AR.js library correct is geladen
    if (typeof AFRAME === 'undefined' || typeof AFRAME.components['gps-new-camera'] === 'undefined') {
        console.error("AR.js library not loaded or gps-new-camera component not found");
        return;
    }

    // Luisteraar voor het bijwerken van de GPS-positie
    el.addEventListener("gps-camera-update-position", async (e) => {
        console.log("GPS position updated:", e.detail.position);

        // Zorg ervoor dat we de GPS-data maar één keer downloaden
        if (!downloaded) {
            const latitude = e.detail.position.latitude; // Verkrijg de breedtegraad van de gebruiker
            const longitude = e.detail.position.longitude; // Verkrijg de lengtegraad van de gebruiker

            console.log(`Got first GPS position: lon ${longitude}, lat ${latitude}`);

            // Handmatig gedefinieerde Points of Interest (POI's) in de buurt van de gebruiker
            const pois = [
                { name: "POI 1", location: { coordinates: [51.39469141180008, 5.472743696095106] } },
                { name: "POI 2", location: { coordinates: [51.396, 5.475] } },
                { name: "POI 3", location: { coordinates: [51.398, 5.470] } },
                { name: "POI 4", location: { coordinates: [51.400, 5.460] } }
            ];

            // Itereer over elke POI om deze toe te voegen aan de AR-scene
            pois.forEach((poi, index) => {
                const { coordinates } = poi.location;
                const name = poi.name || "Unknown POI"; // Naam van de POI, of "Unknown" als er geen naam is

                // Bereken de afstand tussen de gebruiker en de POI
                const distance = calculateDistance(latitude, longitude, coordinates[0], coordinates[1]);
                console.log(`Distance to ${name}: ${distance} meters`);
                if (distance > 1000) { // Render alleen POI's binnen 1 km
                    return;
                }
                const scale = Math.max(10, Math.min(100, 5000 / distance)); // Schaal de POI op basis van de afstand (hoe dichterbij, hoe groter)

                // Maak een nieuw entity-element voor de POI
                const compoundEntity = document.createElement("a-entity");
                compoundEntity.setAttribute("gps-new-entity-place", {
                    latitude: coordinates[0],
                    longitude: coordinates[1],
                });

                // Maak een box die de POI visueel representeert
                const box = document.createElement("a-box");
                box.setAttribute("scale", `${scale} ${scale} ${scale}`);
                box.setAttribute("material", { color: distance < 500 ? "green" : "blue" }); // Groen als dichtbij, blauw als verder weg
                box.setAttribute("position", `0 ${scale / 2} 0`);

                // Voeg tekst toe die de naam van de POI en de afstand toont
                const text = document.createElement("a-text");
                const textScale = scale / 5;
                text.setAttribute("value", `${name}\n(${Math.round(distance)}m)`); // Toon de naam en afstand
                text.setAttribute("look-at", "[gps-new-camera]"); // Zorg ervoor dat de tekst altijd naar de camera kijkt
                text.setAttribute("scale", `${textScale} ${textScale} ${textScale}`);
                text.setAttribute("align", "center");
                text.setAttribute("position", `0 ${scale + 10} 0`);

                // Event listener voor het klikken op de POI-box
                box.addEventListener("click", () => {
                    alert(`You clicked on: ${name}`); // Toon een alert met de naam van de POI
                });

                // Voeg de box en tekst toe aan de POI-entity
                compoundEntity.appendChild(box);
                compoundEntity.appendChild(text);

                // Voeg de POI-entity toe aan de scene
                document.querySelector("a-scene").appendChild(compoundEntity);
                console.log(`Added POI: ${name} to the scene`);

                // Functie om de nabijheid van de gebruiker tot de POI te controleren
                const checkProximity = () => {
                    const currentDistance = calculateDistance(latitude, longitude, coordinates[0], coordinates[1]);
                    console.log(`Current distance to ${name}: ${currentDistance} meters`);
                    if (currentDistance <= 2) { // Als de gebruiker binnen 2 meter is
                        let combineButton = document.querySelector("#combine-button");
                        if (!combineButton) {
                            // Maak de "Combine" knop aan als deze nog niet bestaat
                            combineButton = document.createElement("button");
                            combineButton.id = "combine-button";
                            combineButton.textContent = "Combine";
                            combineButton.style.position = "absolute";
                            combineButton.style.bottom = "20px";
                            combineButton.style.left = "50%";
                            combineButton.style.transform = "translateX(-50%)";
                            combineButton.style.padding = "10px 20px";
                            combineButton.style.fontSize = "16px";
                            combineButton.style.backgroundColor = "#28a745";
                            combineButton.style.color = "white";
                            combineButton.style.border = "none";
                            combineButton.style.borderRadius = "5px";
                            combineButton.style.cursor = "pointer";

                            // Event handler voor de "Combine" knop
                            combineButton.addEventListener("click", () => {
                                if (timeRemaining > 0) {
                                    totalPoints += timeRemaining; // Voeg de resterende tijd als punten toe
                                    updatePointsDisplay(); // Werk de puntenweergave bij
                                }
                                alert("Combination successful!"); // Toon een succesbericht
                                document.querySelector("a-scene").removeChild(compoundEntity); // Verwijder de POI uit de scene
                                pois.splice(index, 1); // Verwijder de POI uit de lijst
                                combineButton.remove(); // Verwijder de knop
                                if (pois.length > 0) {
                                    startTimer(); // Start de timer opnieuw voor de volgende POI
                                }
                            });

                            document.body.appendChild(combineButton); // Voeg de knop toe aan de body van de pagina
                        }
                    } else {
                        // Verwijder de "Combine" knop als de gebruiker niet dichtbij genoeg is
                        const combineButton = document.querySelector("#combine-button");
                        if (combineButton) {
                            combineButton.remove(); // Verwijder de knop
                        }
                    }
                };

                // Controleer elke 5 seconden of de gebruiker dicht genoeg bij de POI is
                setInterval(checkProximity, 5000);
            });

            downloaded = true; // Zorg ervoor dat we de GPS-data maar één keer downloaden
            startTimer(); // Start de timer wanneer het spel begint
        }
    });

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Straal van de aarde in meters
        const phi1 = (lat1 * Math.PI) / 180;
        const phi2 = (lat2 * Math.PI) / 180;
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
        const deltaLambda = ((lon1 - lon2) * Math.PI) / 180;

        const a =
            Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Retourneer de afstand in meters
    }

    let timerInterval; // Interval voor de timer
    let timeRemaining = 60; // Begin met 60 seconden

    // Start de timer
    function startTimer() {
        console.log("Starting timer");
        if (timerInterval) {
            clearInterval(timerInterval); // Stop elke bestaande timer
        }

        timeRemaining = 60; // Zet de tijd opnieuw op 60 seconden

        // Interval voor het bijwerken van de timer
        timerInterval = setInterval(() => {
            timeRemaining--; // Verminder de tijd met 1 seconde

            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            document.getElementById("timer").textContent = formattedTime; // Werk de HTML timer bij
            if (timeRemaining <= 0) {
                clearInterval(timerInterval); // Stop de timer als de tijd op is
                document.getElementById("timer").textContent = "0:00"; // Zet de timer op 0:00
            }
        }, 1000);
    }

    // Logica voor het weergeven van de punten
    const pointsText = document.createElement("a-text");
    pointsText.setAttribute("value", "Points: 0"); // Begin met 0 punten
    pointsText.setAttribute("position", "2.5 2.5 -2");
    pointsText.setAttribute("align", "center");
    pointsText.setAttribute("color", "green");
    pointsText.setAttribute("scale", "2 2 2");
    document.querySelector("a-scene").appendChild(pointsText);

    // Werk de puntenweergave bij
    function updatePointsDisplay() {
        pointsText.setAttribute("value", `Points: ${totalPoints}`);
    }
};