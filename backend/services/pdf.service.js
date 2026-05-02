import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
const fmtDur = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;
const pad = (s, n) => String(s).padStart(n, "0");

export const generateETicketPDF = async (booking) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const flight = booking.flightId;
    const airline = flight.airlineId;

    // ── QR code encodes booking ID for airport scanners ──
    const qrDataUrl = await QRCode.toDataURL(booking._id.toString(), {
      width: 120,
      margin: 1,
    });
    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

    // ── Header strip ──
    doc.rect(0, 0, doc.page.width, 80).fill("#0C447C");
    doc
      .fillColor("#ffffff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("OATS AIR", 50, 24);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Online Air Ticketing System — E-Ticket", 50, 50);
    doc
      .fillColor("#a8d4f5")
      .fontSize(11)
      .text(`PNR: ${booking.PNR}`, doc.page.width - 140, 30, {
        align: "right",
      });

    doc.moveDown(3);

    // ── Flight info block ──
    doc
      .fillColor("#0C447C")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("Flight Details", 50, 100);
    doc
      .moveTo(50, 116)
      .lineTo(545, 116)
      .strokeColor("#cce0f5")
      .lineWidth(1)
      .stroke();

    const fi = [
      ["Airline", `${airline.name} (${airline.code})`],
      ["Flight No.", flight.flightNumber],
      ["Route", `${flight.origin}  →  ${flight.destination}`],
      ["Departure", fmt(flight.departureTime)],
      ["Arrival", fmt(flight.arrivalTime)],
      ["Duration", fmtDur(flight.duration)],
      [
        "Class",
        booking.cabinClass.charAt(0).toUpperCase() +
          booking.cabinClass.slice(1),
      ],
    ];

    let y = 124;
    doc.font("Helvetica").fontSize(10).fillColor("#333");
    for (const [label, value] of fi) {
      doc.fillColor("#666").text(label, 50, y);
      doc.fillColor("#111").text(value, 200, y);
      y += 20;
    }

    // ── QR code ──
    doc.image(qrBuffer, doc.page.width - 140, 100, { width: 100 });
    doc
      .fillColor("#666")
      .fontSize(8)
      .text("Scan at boarding gate", doc.page.width - 145, 205, {
        width: 110,
        align: "center",
      });

    // ── Passenger table ──
    y = Math.max(y, 230) + 20;
    doc
      .fillColor("#0C447C")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("Passenger Details", 50, y);
    y += 16;
    doc
      .moveTo(50, y)
      .lineTo(545, y)
      .strokeColor("#cce0f5")
      .lineWidth(1)
      .stroke();
    y += 8;

    // Table header
    doc.fillColor("#fff").rect(50, y, 495, 22).fill("#0C447C").stroke();
    doc.fillColor("#fff").fontSize(9).font("Helvetica-Bold");
    doc.text("Name", 60, y + 6);
    doc.text("DOB", 220, y + 6);
    doc.text("ID Type", 330, y + 6);
    doc.text("ID Number", 410, y + 6);
    doc.text("Seat", 500, y + 6);
    y += 22;

    for (let i = 0; i < booking.passengers.length; i++) {
      const p = booking.passengers[i];
      doc
        .fillColor(i % 2 === 0 ? "#f5f9ff" : "#ffffff")
        .rect(50, y, 495, 22)
        .fill()
        .stroke("#ddeeff");
      doc.fillColor("#222").font("Helvetica").fontSize(9);
      doc.text(p.name, 60, y + 6, { width: 155, ellipsis: true });
      doc.text(new Date(p.dob).toLocaleDateString("en-IN"), 220, y + 6);
      doc.text(p.idType.toUpperCase(), 330, y + 6);
      doc.text(p.idNumber, 410, y + 6);
      doc.text(p.seatNumber, 500, y + 6);
      y += 22;
    }

    // ── Fare breakdown ──
    y += 24;
    doc
      .fillColor("#0C447C")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("Fare Breakdown", 50, y);
    y += 16;
    doc
      .moveTo(50, y)
      .lineTo(545, y)
      .strokeColor("#cce0f5")
      .lineWidth(1)
      .stroke();
    y += 8;

    const fareRows = [
      ["Base fare", `₹${booking.baseFare.toLocaleString("en-IN")}`],
      ["Taxes & fees (18%)", `₹${booking.taxes.toLocaleString("en-IN")}`],
      ["Total paid", `₹${booking.totalAmount.toLocaleString("en-IN")}`],
    ];
    doc.font("Helvetica").fontSize(10).fillColor("#333");
    for (const [label, val] of fareRows) {
      const isTot = label.startsWith("Total");
      if (isTot) {
        doc.font("Helvetica-Bold").fillColor("#0C447C");
      }
      doc.text(label, 50, y);
      doc.text(val, 450, y, { align: "right", width: 95 });
      if (isTot) doc.font("Helvetica").fillColor("#333");
      y += 20;
    }

    // ── Boarding instructions ──
    y += 20;
    doc
      .fillColor("#0C447C")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Boarding Instructions", 50, y);
    y += 16;
    const instructions = [
      "Please arrive at the airport at least 2 hours before departure for domestic, 3 hours for international flights.",
      "Carry a valid government-issued photo ID matching the name on this ticket.",
      "Web check-in opens 48 hours and closes 2 hours before departure.",
      "Baggage allowance: Economy 15kg, Business 25kg, First 35kg.",
    ];
    doc.font("Helvetica").fontSize(9).fillColor("#444");
    for (const inst of instructions) {
      doc.text(`• ${inst}`, 50, y, { width: 495 });
      y += doc.heightOfString(`• ${inst}`, { width: 495 }) + 6;
    }

    // ── Footer ──
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill("#0C447C");
    doc
      .fillColor("#ffffff")
      .fontSize(8)
      .text(
        `Booking ID: ${booking._id} | Generated: ${new Date().toLocaleString("en-IN")} | This is a computer-generated e-ticket`,
        50,
        doc.page.height - 26,
        { width: doc.page.width - 100, align: "center" },
      );

    doc.end();
  });
};
