var nodemailer = require('nodemailer');
var log = require('./logger')("email");

var transporter = null;
if (process.env.EMAIL_BACKEND === "sendmail") {
    transporter = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
    });
}else {
    log.info("No email backend specified.")
}


function send_email(from, to, subject, text, html) {
    if (!transporter) {
        return;
    }
    transporter.sendMail({
        sender: from,
        to: to,
        subject: subject,
        text: text,
        html: html
    }, function (error, success) {
        if (success) {
            log.info('Email sent');
        }else {
            log.info('Email sending problem: ' + error);
        }
    });
}

exports.send = send_email;
