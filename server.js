const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const fs = require('fs');

// Serve static files from current directory
app.use(express.static(__dirname));

// Use JSON body parser
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read data
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return { routes: [], buses: [] };
    }
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        return { routes: [], buses: [] };
    }
}

// Helper to save data
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Endpoints
app.get('/api/data', (req, res) => {
    res.json(readData());
});

app.post('/api/data', (req, res) => {
    // Expect { routes, buses }
    const newData = req.body;
    saveData(newData);
    // Also update in-memory locations if needed or just rely on IDs
    res.json({ success: true });
});

// Store latest locations in memory
// Map<busRouteId, { lat, lng, timestamp, heading, speed }>
const busLocations = new Map();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific bus room (for both drivers and users)
    socket.on('join-bus-room', (busRouteId) => {
        const routeIdNormalized = String(busRouteId).trim().toLowerCase();
        socket.join(routeIdNormalized);
        console.log(`Socket ${socket.id} joined room ${routeIdNormalized}`);

        // If we have a last known location, send it immediately
        if (busLocations.has(routeIdNormalized)) {
            socket.emit('bus-location-update', busLocations.get(routeIdNormalized));
        }
    });

    socket.on('leave-bus-room', (busRouteId) => {
        const routeIdNormalized = String(busRouteId).trim().toLowerCase();
        socket.leave(routeIdNormalized);
        console.log(`SUCCESS: Socket ${socket.id} LEFT room ${routeIdNormalized}`);
    });

    // Driver sends location update
    socket.on('update-bus-location', (data) => {
        // data: { routeId, lat, lng, ... }
        const { routeId, lat, lng } = data;
        const routeIdNormalized = String(routeId).trim().toLowerCase();

        const locationData = {
            ...data,
            routeId: routeIdNormalized,
            timestamp: Date.now()
        };

        busLocations.set(routeIdNormalized, locationData);

        // Broadcast to everyone in this bus's room
        io.to(routeIdNormalized).emit('bus-location-update', locationData);
        console.log(`Location update for ${routeIdNormalized}: ${lat}, ${lng}`);
    });

    // Driver stops tracking
    socket.on('stop-tracking', (routeId) => {
        const routeIdNormalized = String(routeId).trim().toLowerCase();

        // Remove from memory
        if (busLocations.has(routeIdNormalized)) {
            busLocations.delete(routeIdNormalized);
            console.log(`Cleared location for ${routeIdNormalized}`);
        }

        // Notify clients
        io.to(routeIdNormalized).emit('bus-offline', routeIdNormalized);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

