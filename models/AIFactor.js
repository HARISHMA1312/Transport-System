const mongoose = require('mongoose');

const aiFactorSchema = new mongoose.Schema({
    routeId: { type: String, required: true, unique: true },
    factor: { type: Number, required: true, default: 1.0 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIFactor', aiFactorSchema);
