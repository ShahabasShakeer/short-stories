const express = require('express')
const Story = require('../models/story')
const authenticate = require('../middleware/auth')
var bodyParser = require('body-parser')

const router = new express.Router()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/stories', urlencodedParser, authenticate(['writer']), async (req, res) => { 
    
    const fields = Object.keys(req.body)
    const allowedFields = ['content', 'title']
    const isValidOperation = fields.every((field) => allowedFields.includes(field))
    
    if (!isValidOperation) {
        return res.status(400).send({ error: 'You can only include title and story content.' })
    }

    console.log("Creating Story")
    const story = new Story({
        ...req.body,
        owner: req.user._id
    })

    try {
        await story.save()
        res.status(200).send("Story was successfully created!")
    } catch (e) {
        res.status(401).send(`Unable to create story. Error: ${e}`)
    }
})

router.get('/stories', async (req, res) => {
    try {
        const stories = await Story.find({approved:true})
        if (stories.length === 0){
            return res.status(200).send({info: "There are no stories at the moment"})
        }
        res.status(200).send(stories)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/stories/me', authenticate(['writer']), async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'stories',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        if (req.user.stories.length === 0){
            return res.status(200).send({info: "You haven't submitted any stories yet"})
        }
        res.status(200).send(req.user.stories)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/stories/unapproved', authenticate(['approver']), async (req, res) => {
    try {
        console.log("Getting unapproved stories")
        const stories = await Story.find({approved:false})
        if (stories.length === 0){
            return res.status(200).send({info: "There are no unapproved stories at the moment"})
        }
        res.status(200).send(stories)
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

router.get('/stories/all', authenticate(['approver']), async (req, res) => {
    try {
        const stories = await Story.find({})
        if (stories.length === 0){
            return res.status(200).send({info: "There are no stories at the moment"})
        }
        res.status(200).send(stories)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/stories/:id', authenticate(['approver']), async (req, res) => {
    const _id = req.params.id

    try {
        const story = await Story.findOne({_id})
        if (!story){
            return res.status(404).send({error:"Story is not found"})
        }
        res.status(200).send(story)
    } catch (e) {
        return res.status(500).send({error:"Internal Server Error"})
    }
})

router.get('/stories/me/:id', authenticate(['writer']), async (req, res) => {
    const _id = req.params.id

    try {
        const story = await Story.findOne({_id, owner: req.user._id})
        if (!story){
            return res.status(404).send({error:"Story is not found"})
        }
        res.status(200).send(story)
    } catch (e) {
        return res.status(500).send({error:"Internal Server Error"})
    }
})

router.patch('/stories/approve/:id', authenticate(['approver']), async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['approved']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'You can only approve stories' })
    }

    try {
        const _id = req.params.id
        const story = await Story.findOne({_id})
        updates.forEach((update) => story[update] = req.body[update])
        await story.save()
    
        if (!story) {
            return res.status(404).send({error: "Story is not found"})
        }

        res.send(`${story.title} has been approved`)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/stories/:id', authenticate(['writer']), async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'content']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'You can only update Title and Content of the story' })
    }

    try {
        const _id = req.params.id
        const story = await Story.findOne({_id, owner: req.user._id})
        updates.forEach((update) => story[update] = req.body[update])
        await story.save()
    
        if (!story) {
            return res.status(404).send({error: "Story is not found"})
        }

        res.send(story)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/stories/:id', authenticate(['writer']), async (req, res) => {
    try {
        console.log("Deleting story")
        const _id = req.params.id
        const story = await Story.findOne({_id, owner: req.user._id})
        if (!story) {
            return res.status(404).send()
        }
        await story.remove()
        res.send("Story has been deleted")
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router