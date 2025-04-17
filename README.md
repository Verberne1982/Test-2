# Overview
This JavaScript file (basic.js) is used to implement a basic augmented reality (AR) experience with GPS functionality. 
The script allows users to interact with Points of Interest (POIs) displayed in an AR scene. 

The POIs are dynamically added based on the user's GPS location, and the user can interact with them by clicking on them to trigger events. 
Additionally, the script includes a timer that counts down from 60 seconds, and the user can earn points by interacting with the POIs.

## Features
### **GPS-based POI rendering:**
- POIs are shown based on the user's proximity (within 1 km) and are scaled according to their distance.

### **AR integration:** 
- Uses AR.js and A-Frame to render AR entities such as boxes and text.

### **Interactive POIs:** 
- Clicking on a POI triggers an alert with the name of the POI.

### **Proximity detection:** 
- The script checks if the user is close enough (within 2 meters) to a POI to activate a "Combine" button.

### **Timer:**
- A countdown timer starts when the game begins, and the remaining time is displayed on the screen.

### **Points system:**
- Points are awarded based on time remaining when interacting with POIs.

## Setup
Ensure that you have AR.js and A-Frame libraries included in your project. These libraries are necessary for rendering AR content and interacting with the GPS data.  
This script assumes that there is an HTML element with the attribute `[gps-new-camera]` to display the AR camera.  
The script listens for the `gps-camera-update-position` event to update the user's position and check proximity to POIs.

## Code Breakdown
### **Variables** 
- **downloaded:** Ensures that the GPS data is only downloaded once.
- **totalPoints:** Keeps track of the total points earned by the user.
- **lastUpdateTime:** Stores the timestamp of the last GPS update.

### GPS Position Update
The script listens for the `gps-camera-update-position` event, which provides the user's current GPS position.  
Based on the user's position, the script calculates the distance to each POI using the `calculateDistance` function.

POIs are displayed if they are within 1 km of the user. The distance to each POI is used to scale the POI's appearance (closer POIs are larger).

### POI Rendering
Each POI is represented by a box and a text label displaying the POI's name and the distance to it.  
The POI is dynamically added to the AR scene, and clicking on the POI triggers an alert with its name.  
The "Combine" button appears when the user is within 2 meters of a POI. Clicking the button adds points based on the remaining time.

### Timer
A countdown timer starts when the game begins and updates every second. The remaining time is displayed in the format minutes:seconds.  
The timer is reset every time a new POI is interacted with.

## Functions
### `calculateDistance(lat1, lon1, lat2, lon2)`
This function calculates the distance between two geographical points using the Haversine formula. It returns the distance in meters.

### `startTimer()`
This function starts the countdown timer and updates the displayed time every second.

## Example Usage
1. Add the `basic.js` script to your HTML file.
2. Ensure that your HTML includes the necessary AR.js and A-Frame setup.
3. Add a `<div>` with the ID `timer` in your HTML to display the countdown timer.
4. The script will automatically detect the user's GPS position, render POIs, and allow interactions with them.

## Requirements
- **AR.js:** A library for augmented reality in the browser.
- **A-Frame:** A web framework for building virtual reality experiences.

## Troubleshooting
- **"GPS camera element not found":** Ensure that your HTML contains an element with the `gps-new-camera` attribute.
- **"AR.js library not loaded":** Verify that AR.js and A-Frame are correctly included in your project.

## How does it work?
https://i475239.hera.fontysict.net/
