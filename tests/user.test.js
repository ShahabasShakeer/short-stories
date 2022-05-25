const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {adminUser, approverUser, writerUser, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test("Admin should be able to create a new Writer user", async () => {
    await request(app).post('/users')
    .set("Authorization", `Bearer ${adminUser.tokens[0].token}`)
    .send({
        email: 'test@app.com',
        password: 'test@12345',
        roles: ['writer']
    }).expect(201)
})

test("Approver should be able to view unapproved stories", async () => {
    await request(app).get('/stories/unapproved')
    .set("Authorization", `Bearer ${approverUser.tokens[0].token}`)
    .send().expect(200)
})

test("Writer should not be able to view unapproved stories", async () => {
    await request(app).get('/stories/unapproved')
    .set("Authorization", `Bearer ${writerUser.tokens[0].token}`)
    .send().expect(401)
})