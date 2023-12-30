const mongoose = require("mongoose");


const memberSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    community: { type: String },
    user: { type: String },
    role: { type: String },
    created_at: { type: Date },
});


module.exports = mongoose.model("member", memberSchema);