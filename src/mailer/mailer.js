const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD 
    },
})

const sendWelcomeMail = async (user, pass) => {
    const options = {
        from: process.env.EMAIL,
        to: user,
        subject: 'Welcome!',
        text: `Hello there!\n\nWelcome to Short Stories App.\n\nUsername: ${user}\nPassword: ${pass}\n(Password is case sensitive)\n\n This is an automated email, please do not reply back to this email.`
    }
    
    transporter.sendMail(options, function(err, info){
        if (err){
            console.log(err)
            return
        }
        console.log('Email has been sent to the user.\n\nPreview URL: ' + nodemailer.getTestMessageUrl(info))
    })
}

const sendPasswordChangedMail = async (user, pass) => {
    const options = {
        from: process.env.EMAIL,
        to: user,
        subject: 'Password has been Reset',
        text: `Hello there!\n\nYour password has been reset. Please find your new  credentials below.\n\nUsername: ${user}\nPassword: ${pass}\n(Password is case sensitive)\n\n This is an automated email, please do not reply back to this email.`
    }
    
    transporter.sendMail(options, function(err, info){
        if (err){
            console.log(err)
            return
        }
        console.log('Email has been sent to the user.\n\nPreview URL: ' + nodemailer.getTestMessageUrl(info))
    })
}

module.exports = {sendWelcomeMail, sendPasswordChangedMail}