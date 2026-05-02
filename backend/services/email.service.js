import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

const ensureConfig = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    throw new Error("Missing Gmail credentials in environment variables");
  }
};

export const sendOTPEmail = async (to, otp) => {
  ensureConfig();

  const transporter = createTransporter();

  return transporter.sendMail({
    from: `"SkyLedger" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your SkyLedger verification OTP",
    html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 10 minutes.</p>`,
  });
};

export const sendBookingConfirmation = async (to, booking, pdfBuffer) => {
  ensureConfig();

  const transporter = createTransporter();

  return transporter.sendMail({
    from: `"SkyLedger" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Booking Confirmed — PNR: ${booking.PNR}`,
    html: `<h2>Booking Confirmed!</h2><p>PNR: <strong>${booking.PNR}</strong></p>`,
    attachments: [
      {
        filename: `${booking.PNR}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};
