const express = require('express')
const User = require('../models/user')
const authenticate = require('../middleware/auth')
const {sendWelcomeMail, sendPasswordChangedMail} = require('../mailer/mailer')
const router = new express.Router()

router.post('/users', authenticate(['admin']), async (req, res) => { 
    const user = new User(req.body)
    console.log("Trying to save user")
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
        sendWelcomeMail(req.body.email, req.body.password)
    } catch (e) {
        res.status(401).send(e)
    }
})

router.get('/users', authenticate(['admin']), async (req, res) => { 
    try {
        const users = await User.find({})
        res.status(201).send(users)
    } catch (e) {
        res.status(401).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send( { user , token } )
        console.log(user.roles)
    } catch (e) {
        res.status(400).send("Unable to login. Error: " + e.message)
    }
})

router.post('/users/logout', authenticate(['writer', 'approver', 'admin']), async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send("Logged out")
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', authenticate(['writer', 'approver', 'admin']), async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send("Logged out from all accounts")
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/resetPassword/me', authenticate(['writer', 'approver', 'admin']), async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates! Only password can be entered.' })
    }

    try {

        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
    
        if (!user) {
            return res.status(404).send()
        }

        res.send("Password has been reset.")
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', authenticate(['writer', 'approver']), async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)

        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        res.send("I am deleted!" + req.user)
    } catch (e) {
        res.status(500).send({error: "Internal Server Error"})
    }
})

router.patch('/users/resetPassword/:id', authenticate(['admin']), async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates! Only password can be entered.' })
    }

    try {

        const user = await User.findById(req.params.id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
    
        if (!user) {
            return res.status(404).send()
        }

        res.send("Password has been reset.")
        sendPasswordChangedMail(user.email, req.body.password)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/:id', authenticate(['admin']), async (req, res) => {
    try {
        console.log("Trying to delete user")
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send("The user was not found to delete.")
        }
        res.send("User has been deleted.")
    } catch (e) {
        res.status(500).send({error: "Internal Server Error"})
    }
})

module.exports = router