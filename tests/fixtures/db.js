const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Story = require('../../src/models/story')

const adminUserId = new mongoose.Types.ObjectId()
const adminUser = {
    _id: adminUserId,
    email: 'john@app.com',
    password: 'john1235',
    roles: ['writer', 'approver', 'admin'],
    tokens: [{
        token: jwt.sign({_id:adminUserId}, process.env.JWT_SECRET)
    }]
}

const approverUserId = new mongoose.Types.ObjectId()
const approverUser = {
    _id: approverUserId,
    email: 'shravan@app.com',
    password: 'ooehsfuj12345',
    roles: ['approver'],
    tokens: [{
        token: jwt.sign({_id:approverUserId}, process.env.JWT_SECRET)
    }]
}

const writerUserId = new mongoose.Types.ObjectId()
const writerUser = {
    _id: writerUserId,
    email: 'jacob@skyxo.com',
    password: 'another@pass12345',
    roles: ['writer'],
    tokens: [{
        token: jwt.sign({_id:writerUserId}, process.env.JWT_SECRET)
    }]
}


const storyOne = {
    _id: new mongoose.Types.ObjectId(),
    title: 'First Story title',
    content: 'This is the first story',
    approved: false,
    owner: writerUserId
}

const storyTwo = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Second Story title',
    content: 'This is the second story',
    approved: false,
    owner: writerUserId
}


const storyThree = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Third Story title',
    content: 'This is the third story',
    approved: true,
    owner: writerUserId
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Story.deleteMany()
    await new User(adminUser).save()
    await new User(approverUser).save()
    await new User(writerUser).save()
    await new Story(storyOne).save()
    await new Story(storyTwo).save()
    await new Story(storyThree).save()
}

module.exports = {
    adminUser,
    approverUser,
    writerUser,
    setupDatabase
}