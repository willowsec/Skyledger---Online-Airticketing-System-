import crypto from "crypto";

// PNR: 6 alphanumeric chars, uppercase — e.g. "XK7R2P"
export const generatePNR = () =>
  crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);

// Price breakdown
export const calcFare = (baseFarePerSeat, passengerCount) => {
  const baseFare = baseFarePerSeat * passengerCount;
  const taxes = Math.round(baseFare * 0.18);
  return { baseFare, taxes, totalAmount: baseFare + taxes };
};
