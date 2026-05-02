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

export const sendCancellationEmail = (to, booking) =>
  transporter.sendMail({
    from: `"OATS Air" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Booking Cancelled — PNR: ${booking.PNR}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#0C447C;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0">Booking Cancelled</h2>
        </div>
        <div style="padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px">
          <p>Your booking <strong>${booking.PNR}</strong> has been cancelled.</p>
          <p>Refund of <strong>₹${booking.refundAmount?.toLocaleString("en-IN")}</strong> will be credited within 5–7 business days.</p>
          <p style="color:#666;font-size:12px">OATS Air | This is an automated email.</p>
        </div>
      </div>
    `,
  });
