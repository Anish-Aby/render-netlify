const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
    },
  });

  //   2. Define email options
  const mailOptions = {
    from: "Render.io <render.io.blog>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
