require('dotenv').config();
const nodeMailer = require('nodemailer');
const mailGen = require('mailgen');
const logWriter = require('./logger');

const sendEmail = async (mailParameters) => {
  try {
    // create Transporter
    const mailTransporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailGenerator = new mailGen({
      theme: 'default',
      product: {
        name: 'Church Connect',
        link: mailParameters.link,
      },
    });

    const email = {
      body: {
        name: mailParameters.name,
        intro:
          `Thank you for choosing Church connect, you recieved this email because ` +
          mailParameters.reason,
        action: mailParameters.action || null,
        outro:
          mailParameters.outro ||
          'Need help or have questions? Just reply to this mail and we will be glad to help you.',
      },
    };

    const emailHtml = mailGenerator.generate(email);
    const emailText = mailGenerator.generatePlaintext(email);

    //  Define the Mail mailParameters
    const message = {
      from: process.env.EMAIL_USERNAME,
      to: mailParameters.reciever,
      subject: mailParameters.subject,
      text: emailText,
      html: emailHtml,
    };

    //   Send the mail
    return await mailTransporter.sendMail(message);
  } catch (error) {
    logWriter('Error sending email.', 'errorsLogs.log');
    throw error;
  }
};

module.exports = sendEmail;
