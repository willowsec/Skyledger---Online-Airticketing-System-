import { Router } from "express";
import {
  searchFlights,
  getFlightById,
  getSeatMap,
} from "../controllers/flight.controller.js";

const router = Router();

router.get("/search", searchFlights);
router.get("/:flightId/seats", getSeatMap);
router.get("/:id", getFlightById);

export default router;
