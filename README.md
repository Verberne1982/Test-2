# LocAR Augmented Reality Project

Dit project maakt gebruik van **three.js** en **LocAR** bibliotheken om een augmented reality (AR) ervaring te creëren op basis van GPS-coördinaten. Hieronder volgt een beschrijving van de belangrijkste functionaliteiten:

## Functionaliteiten:
1. **3D-omgeving**:
   - De gebruiker ziet 3D-objecten (rood kubusblok) geplaatst op basis van GPS-coördinaten in een augmented reality omgeving.
   - De objecten worden dynamisch toegevoegd aan de scène en gepositioneerd op basis van de GPS-positie.

2. **Bewegingsupdates**:
   - Wanneer de gebruiker beweegt, worden de 3D-objecten bijgewerkt op basis van de nieuwe GPS-positie van de gebruiker.

3. **Locatiebronnen**:
   - De locaties kunnen worden opgehaald via een externe API (zoals de Fontys API) of handmatig worden ingesteld met een specifieke locatie (bijvoorbeeld de Fontys Campus).
   - De keuze voor het gebruik van de API of handmatige locatie kan eenvoudig worden geconfigureerd.

4. **Interactie met objecten**:
   - Gebruikers kunnen interageren met de 3D-objecten door erop te klikken.
   - Bij het klikken op een object, wordt een **alert** weergegeven met de naam van het object.

5. **Augmented Reality**:
   - Het gebruik van de webcam en apparaatoriëntatie zorgt voor een dynamische AR-ervaring.
   - De 3D-scène wordt gerenderd op de volledige schermgrootte en reageert op de beweging van het apparaat.

## Technologieën:
- **three.js**: Gebruikt voor het creëren van de 3D-scène en rendering.
- **LocAR**: Gebruikt voor het toevoegen van locatiegebaseerde objecten en het verwerken van GPS-updates.
- **Webcam en Device Orientation**: Voor het mogelijk maken van de AR-ervaring en het interactief maken van de scène.

## Werking van de code:
De JavaScript code zorgt voor de integratie van augmented reality (AR) in een webpagina en maakt gebruik van de **A-Frame** en **LocAR** bibliotheken om GPS-gegevens te verwerken en Points of Interest (POI) weer te geven als 3D-objecten in een AR-omgeving. 

### Wat doet de code?

1. **Wachten op pagina-laad**:
   - De code wordt pas uitgevoerd wanneer de pagina volledig is geladen (`window.onload`).

2. **GPS-positie ophalen**:
   - De code luistert naar updates van de GPS-camera in de A-Frame scène. Elke keer als de positie van de gebruiker verandert, wordt de `gps-camera-update-position` event geactiveerd en wordt de huidige GPS-positie (breedte- en lengtegraad) opgehaald.

3. **POI-data ophalen**:
   - Wanneer de eerste GPS-positie is verkregen, haalt de code gegevens op van een externe API (`https://fontys-geolocation-api.onrender.com/`) om een lijst van **Points of Interest (POI)** op te halen. Deze POI bevatten GPS-coördinaten en namen.

4. **Afstand berekenen**:
   - Voor elke POI berekent de code de afstand van de gebruiker tot het POI door de Haversine-formule te gebruiken. Dit geeft de afstand in meters tussen twee GPS-punten.

5. **Schaal van objecten instellen**:
   - De code stelt de schaal van de 3D-objecten in op basis van de afstand tussen de gebruiker en het POI. Objecten die verder weg zijn, worden groter weergegeven (tot een maximale schaal van 100) en dichterbij de gebruiker blijven ze kleiner (bijvoorbeeld een schaal van 20).

6. **3D-objecten creëren**:
   - Voor elk POI wordt een **compound entity** gemaakt die zowel een **box** als een **tekstlabel** bevat:
     - De **box** vertegenwoordigt het POI als een 3D-vorm, die geschaald en gekleurd (blauw) wordt.
     - Het **tekstlabel** toont de naam van het POI en is altijd gericht naar de gebruiker (camera), zodat de tekst leesbaar blijft, ongeacht de kijkrichting van de gebruiker.

7. **Objecten toevoegen aan de scène**:
   - De 3D-objecten (de box en de tekst) worden toegevoegd aan de **A-Frame scène**, waardoor ze zichtbaar zijn in de AR-omgeving.

8. **Berekening van afstand (Haversine-formule)**:
   - De Haversine-formule wordt gebruikt om de afstand tussen twee GPS-coördinaten te berekenen. Dit is essentieel voor het bepalen van de juiste schaal van de objecten afhankelijk van de afstand van de gebruiker tot het POI.

9. **Preventie van dubbele data-oogst**:
   - De variabele `downloaded` voorkomt dat de POI-data meerdere keren worden gedownload, door te controleren of de gegevens al zijn opgehaald voordat de fetch-request wordt uitgevoerd.

### Samenvatting:
Deze code zorgt ervoor dat de gebruiker in een augmented reality-omgeving 3D-objecten ziet die gebaseerd zijn op zijn GPS-locatie. De objecten worden weergegeven op de locatie van **Points of Interest** (POI) en kunnen interactief worden bekeken. Afhankelijk van de afstand van de gebruiker tot een POI, worden de objecten groter of kleiner weergegeven.


