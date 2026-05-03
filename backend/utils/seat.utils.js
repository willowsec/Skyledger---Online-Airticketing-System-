import Seat from "../models/Seat.model.js";

export const generateSeats = async (flightId, config, session) => {
  const seats = [];
  const classes = [
    {
      cabin: "first",
      rows: config.first,
      cols: ["A", "B", "C", "D"],
      startRow: 1,
    },
    {
      cabin: "business",
      rows: config.business,
      cols: ["A", "B", "C", "D", "E", "F"],
      startRow: config.first + 1,
    },
    {
      cabin: "economy",
      rows: config.economy,
      cols: ["A", "B", "C", "D", "E", "F"],
      startRow: config.first + config.business + 1,
    },
  ];
  for (const cls of classes) {
    for (let r = 0; r < cls.rows; r++) {
      for (const col of cls.cols) {
        seats.push({
          flightId,
          seatNumber: `${cls.startRow + r}${col}`,
          cabinClass: cls.cabin,
        });
      }
    }
  }
  await Seat.insertMany(seats, { session });
};
