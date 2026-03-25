/**
 * Arduino Serial Bridge
 * Reads latitude and longitude from the Arduino via USB and sends it to your local Node.js server.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open a terminal in this project folder and run:
 *    npm install serialport socket.io-client
 * 
 * 2. Change the "COM_PORT" below to match your Arduino (e.g., 'COM3' on Windows or '/dev/ttyACM0' on Mac/Linux)
 * 3. Change the "ROUTE_NAME" to the route you want this tracker to update.
 * 
 * RUN:
 * node arduino-bridge.js
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const io = require('socket.io-client');

// ================= CONFIGURATION =================
// ⚠️ IMPORTANT: Change 'COM3' to whatever COM port your Arduino uses in the Arduino IDE!
const COM_PORT = 'COM3'; 

// ⚠️ IMPORTANT: Change this to the exact name of an active route from your admin dashboard
const ROUTE_NAME = 'TCE to Periyar'; 

const SERVER_URL = 'http://localhost:3000'; // Make sure your main server is running on port 3000
// =================================================

// 1. Connect to your Transport-System Backend
const socket = io(SERVER_URL);

socket.on('connect', () => {
    console.log(`[Bridge] Connected to Local Server at ${SERVER_URL}`);
    // Register as a bus provider (mimicking the driver.html behavior)
    socket.emit('bus-provider-connect'); 
});

// 2. Connect to the Arduino via USB/Serial
const serialPort = new SerialPort({ path: COM_PORT, baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

serialPort.on('open', () => {
    console.log(`[Serial] Listening to Arduino on port ${COM_PORT}...`);
});

serialPort.on('error', (err) => {
    console.error(`[Serial] Error: Could not open port ${COM_PORT}. Make sure the Arduino IDE Serial Monitor is CLOSED!`, err.message);
});

// Variables to hold the parts of the coordinate until we get a full pair
let currentLat = null;
let currentLng = null;

// 3. Read data coming from the Arduino
parser.on('data', (line) => {
    // line will look like "lattitude: 9.9252" or "longitude: 78.1198" from your Arduino code
    console.log('[Arduino]:', line);
    
    // Parse Latitude
    if (line.toLowerCase().includes('lattitude:')) {
        currentLat = parseFloat(line.split(':')[1].trim());
    }
    
    // Parse Longitude
    if (line.toLowerCase().includes('longitude:')) {
        currentLng = parseFloat(line.split(':')[1].trim());
        
        // Once we have both latitude and longitude, send the update to the server!
        if (currentLat !== null && currentLng !== null && !isNaN(currentLat) && !isNaN(currentLng)) {
            console.log(`[Bridge] 🚀 Sending to server -> Lat: ${currentLat}, Lng: ${currentLng} for ${ROUTE_NAME}`);
            
            socket.emit('update-bus-location', {
                routeId: ROUTE_NAME,
                lat: currentLat,
                lng: currentLng,
                speed: 15 // Mock speed since we aren't reading speed from your Arduino yet
            });

            // Clear them out waiting for the next reading loop
            currentLat = null;
            currentLng = null;
        }
    }
});
