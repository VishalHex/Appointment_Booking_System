import nodemailer from 'nodemailer';
// For SMS, you can use Twilio or similar service (placeholder below)

export async function sendEmailReminder(to, subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (err) {
    throw new Error('Email reminder failed: ' + err.message);
  }
}

export async function sendSMSReminder(to, message) {
  try {
    // Integrate with Twilio or other SMS provider here
    // Example placeholder:
    // await twilioClient.messages.create({ to, from: process.env.TWILIO_FROM, body: message });
    return true;
  } catch (err) {
    throw new Error('SMS reminder failed: ' + err.message);
  }
}
