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

export const sendFlightCancelledEmail = async (to, booking, flight) => {
  ensureConfig();
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"SkyLedger" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Flight Cancelled — ${flight.flightNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#0C447C;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0">Flight Cancelled</h2>
        </div>
        <div style="padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px">
          <p>We regret to inform you that flight <strong>${flight.flightNumber}</strong> (${flight.origin} → ${flight.destination}) has been cancelled.</p>
          <p>Your booking <strong>${booking.PNR}</strong> is affected. A full refund of <strong>₹${booking.totalAmount.toLocaleString("en-IN")}</strong> will be credited to your account within 5–7 business days.</p>
          <p style="color:#666;font-size:12px">SkyLedger | We apologize for the inconvenience.</p>
        </div>
      </div>
    `,
  });
};

export const sendCancellationEmail = sendFlightCancelledEmail; // Alias for backward compatibility if any
