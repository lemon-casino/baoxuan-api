const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: "qq",
    port: 465,
    secure: false,
    auth: {
        user: '1875483499@qq.com',
        pass: 'ptlobipgaovwchjb'
    }
})


const mailOptions = {
    from: `bi <1875483499@qq.com>`,
    to: '1875483499@qq.com',
    subject: 'BI occurs errors'
}

const send = (msg) => {
    mailOptions.text = msg
    transporter.sendMail(mailOptions, (error, info) => {})
}

module.exports = {send}