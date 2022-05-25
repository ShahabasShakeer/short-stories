const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        trim:true,
        maxlength: 100,
        required:true
    },
    content: {
        type: String,
        trim: true,
        maxlength: 700,
        required: true
    },
    approved: {
        type: Boolean,
        default:false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Story = mongoose.model('Story', storySchema)

module.exports = Story