import dotenv from 'dotenv';
import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
dotenv.config();

export async function sendAlert (origin) {
  const config = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  };
  const date = new Date().toLocaleString('en-My');
  // Create a Nodemailer transporter using SMTP
  const transporter = nodemailer.createTransport(config);

  const mailGenerator = new Mailgen({
    theme: 'salted',
    product: {
      name: 'Tiroi Farm Surveillance',
      link: 'http://localhost:3000'
    }
  });

  const email = {
    body: {
      name: 'Safuan Idris',
      intro: `<h1>Potential problem detected at ${origin} which require your immediate attention</h1><br>Surveillance Date: <b>${date}<b>`,
      action: {
        instructions: 'Click the button below to view the detailed report:',
        button: {
          color: '#fb8c00',
          text: 'Go To Dashboard',
          link: 'http://localhost:3000/surveillance/view'
        }
      },
      outro: 'If you have any trouble accessing the dashboard, please call 911'
    }
  };

  // Generate an HTML email with the provided contents
  const emailBody = mailGenerator.generate(email);

  const message = {
    from: process.env.EMAIL_USERNAME,
    to: 'behem67958@laymro.com',
    subject: 'POSSIBLE OUTBREAK DETECTED',
    html: emailBody
  };

  transporter.sendMail(message).then(() => {
    return console.log('Sent mail successfully');
  }).catch(e => {
    console.log(e);
  });
};
