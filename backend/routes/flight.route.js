import { Router } from "express";
import {
  searchFlights,
  getFlightById,
  getSeatMap,
} from "../controllers/flight.controller.js";

const router = Router();

router.get("/search", searchFlights);
router.get("/:id", getFlightById);
router.get("/:flightId/seats", getSeatMap);

export default router;
