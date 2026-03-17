const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNo: { type: String, required: true, unique: true },
    capacity: { type: Number },
    driverName: { type: String },
    driverPhone: { type: String }
});

module.exports = mongoose.model('Bus', busSchema);
