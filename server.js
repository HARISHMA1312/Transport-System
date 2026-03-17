
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

// require('dotenv').config();
const mongoose = require('mongoose');

// Import Schemas
const Route = require('./models/Route');
const Bus = require('./models/Bus');
const User = require('./models/User');
const Admin = require('./models/Admin');

// Connect to MongoDB

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// API Endpoints: Get Routes and Buses
app.get('/api/data', async (req, res) => {
    try {
        const routes = await Route.find({});
        const buses = await Bus.find({});
        res.json({ routes, buses });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data from database" });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const { routes, buses } = req.body;
        
        // This is a simple bulk overwrite strategy for the admin panel.
        // In a production app you'd want individual endpoints (e.g., POST /api/route, PUT /api/route/:id)
        if (routes) {
            await Route.deleteMany({});
            await Route.insertMany(routes);
        }
        if (buses) {
            await Bus.deleteMany({});
            await Bus.insertMany(buses);
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ error: "Failed to save data" });
    }
});

// --- Authentication Endpoints ---

// User Registration
app.post('/api/auth/register-user', async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({ name, phone, password });
        await newUser.save();
        
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login
app.post('/api/auth/login-user', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone, password }); // Note: In production, hash passwords!
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid phone or password' });
        }
        res.json({ success: true, user: { name: user.name, phone: user.phone, route: user.busRoute } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Admin Registration
app.post('/api/auth/register-admin', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const existingAdmin = await Admin.findOne({ phone });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        const newAdmin = new Admin({ name, email, phone, password });
        await newAdmin.save();
        res.status(201).json({ success: true, message: 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Admin Login
app.post('/api/auth/login-admin', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const admin = await Admin.findOne({ phone, password });
        
        if (!admin) {
            return res.status(401).json({ error: 'Invalid phone or password' });
        }
        res.json({ success: true, admin: { name: admin.name, email: admin.email, phone: admin.phone } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// AI Learning Endpoints
const AIFactor = require('./models/AIFactor');

// Get all AI factors
app.get('/api/ai/factors', async (req, res) => {
    try {
        const factors = await AIFactor.find({});
        const factorMap = {};
        factors.forEach(f => factorMap[f.routeId] = f.factor);
        res.json(factorMap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch AI factors' });
    }
});

// Update an AI factor
app.post('/api/ai/factor', async (req, res) => {
    try {
        const { routeId, factor } = req.body;
        await AIFactor.findOneAndUpdate(
            { routeId },
            { factor, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update AI factor' });
    }
});

// Store latest locations in memory (Kept for blazing fast Socket.io performance)
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


