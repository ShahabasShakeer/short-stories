const jwt = require('jsonwebtoken')
const UserModel = require('../models/user')

const authenticate = (roles) => {
    return (req, res, next) => {
        const token = req.header('Authorization').replace('Bearer ', '')
        UserModel.findByToken(token, roles).then((user) => {
            if (!user) {
                return Promise.reject();
            }
            req.user = user
            req.token = token
            next();
        }).catch((e) => {
            res.status(401).send(`Please authenticate first. ErrorObject: ${e}`)
        })
    }
}

module.exports = authenticate