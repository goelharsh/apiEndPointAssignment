const mongoose = require("mongoose");


const communitySchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, maxlength: 128 },
    slug: { type: String, maxlength: 255 },
    owner: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date },
});


module.exports = mongoose.model("community", communitySchema);