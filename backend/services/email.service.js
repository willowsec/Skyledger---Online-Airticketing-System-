import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

//we are doing proper error handling in this function because if the email fails to send, we want to know about it and handle it gracefully in the controller
export const sendOTPEmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"SkyLedger" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your SkyLedger verification OTP",
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 10 minutes.</p>`,
    });
  } catch (error) {
    console.error("OTP email failed:", error);
    throw new Error("Email service failed");
  }
};

// proper error handling like before
export const sendBookingConfirmation = async (to, booking, pdfBuffer) => {
  try {
    await transporter.sendMail({
      from: `"SkyLedger" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Booking Confirmed — PNR: ${booking.PNR}`,
      html: `<h2>Booking Confirmed!</h2><p>PNR: <strong>${booking.PNR}</strong></p>`,
      attachments: [{ filename: `${booking.PNR}.pdf`, content: pdfBuffer }],
    });
  } catch (error) {
    console.error("Booking confirmation email failed:", error);
    throw new Error("Email service failed");
  }
};
