import dotenv from 'dotenv';
import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
dotenv.config();

export async function sendAlert (req, res) {
  const config = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  };

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
      intro: 'Potential problem detected at the farm which require your immediate attention',
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
    to: 'witewey879@tanlanav.com',
    subject: 'POSSIBLE OUTBREAK DETECTED',
    html: emailBody
  };

  transporter.sendMail(message).then(() => {
    return console.log('Sent mail successfully');
  }).catch(e => {
    console.log(e);
  });
};
