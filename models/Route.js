const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    type: { type: String, enum: ['source', 'destination', 'intermediate'], required: true }
});

const routeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    stops: [stopSchema],
    buses: [{ type: String }], // Array of bus numbers assigned to this route
    geometry: [[Number]] // Array of [lat, lng] coordinates for the exact road path
});

module.exports = mongoose.model('Route', routeSchema);
