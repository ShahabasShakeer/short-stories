const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'This is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    roles: {
        type: [{
            type: String,
            enum: ['writer', 'approver', 'admin']
        }],
        default: ['writer']
    },
    tokens: [{
        createdAt: {
            type: Date,
            default: Date.now
        },
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.statics.findByToken = function(token, roles) {
    const UserModel = this
    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return Promise.reject()
    }
    return UserModel.findOne({
        _id: decoded._id,
        roles: {
            $in: roles
        },
        'tokens.token': token
    })
}

userSchema.virtual('stories', {
    ref: 'Story',
    localField: '_id',
    foreignField: 'owner'
})

// userSchema.methods.toJSON = function() {
//     const user = this
//     const userObject = user.toObject()

//     delete userObject.password
//     delete userObject.tokens
//     delete userObject.avatar

//     return userObject
// }

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('User not Found')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Password mismatch')
    }

    return user
}

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// userSchema.pre('remove', async function (next) {
//     const user = this
//     await Task.deleteMany({owner: user._id})
//     next()
// })

const User = mongoose.model('User', userSchema)

module.exports = User