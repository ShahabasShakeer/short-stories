const express = require('express')
require('./db/mongoose')
const path = require('path')
var bodyParser = require('body-parser')
const authenticate = require('./middleware/auth')
const userRouter = require('./routers/user')
const storyRouter = require('./routers/story')
const request = require('request')

const app = express()
app.use(express.json())
app.use(userRouter)
app.use(storyRouter)

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// create application/json parser
var jsonParser = bodyParser.json()

//For displaying the webpage
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))
app.set('view engine', 'html')

app.get('/test', authenticate(["user", "admin"]), (req, res) => {
    res.send("Hey everyone!")
})

app.get('/onlyAdmin', authenticate(["admin"]), (req, res) => {
    res.send("Hey Admin!")
})

app.post('/showStoryForm', urlencodedParser, (req, res) => {
    try {
        // const user = await User.findByCredentials(req.body.email, req.body.password)
        // const token = await user.generateAuthToken()
        // res.send( { user , token } )
        // console.log(user.roles)
        request({
            url: "http://localhost:3000/users/login",
            method: "POST",
            json: true,   // <--Very important!!!
            body: req.body
        }, function (error, response, body){
            if (error){
                return res.status(400).send("Error occured: " + error)
            }
            if (body.user.roles.indexOf('writer') !== -1){
                return res.sendFile(publicDirectoryPath + '/story-form.html')
            } 
            res.send("FrontEnd is available only for writers at the moment")
        })
                //console.log(req.body)
        //res.send(req.body)
    } catch (e) {
        res.status(400).send("Unable to login. Error: " + e.message)
    }
})



module.exports = app