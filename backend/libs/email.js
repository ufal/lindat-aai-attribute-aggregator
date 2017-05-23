var nodemailer = require('nodemailer');
var log = require('./logger')("email");

var transporter = nodemailer.createTransport({
    'host': 'localhost'
});

function send_email(from, to, subject, body) {
    transporter.sendMail({
        sender: from,
        to: to,
        subject: subject,
        body: body
    }, function (error, success) {
        log.info('Email ' + (success ? 'sent' : 'failed') + ': ' + error);
    });
}

exports.send = send_email;
