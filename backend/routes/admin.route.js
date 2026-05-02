import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import {
  getDashboardStats,
  getRevenueChart,
  getClassSplit,
  getAllFlights,
  createFlight,
  updateFlight,
  cancelFlight,
  deleteFlight,
  getAllBookings,
  exportBookingsCSV,
  getAllUsers,
  deactivateUser,
  getAirports,
  createAirport,
  getAirlines,
  createAirline,
} from "../controllers/admin.controller.js";

const router = Router();
router.use(protect, adminOnly); // every admin route requires auth + admin role

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/revenue-chart", getRevenueChart);
router.get("/class-split", getClassSplit);

// Flights
router.get("/flights", getAllFlights);
router.post("/flights", createFlight);
router.put("/flights/:id", updateFlight);
router.patch("/flights/:id/cancel", cancelFlight);
router.delete("/flights/:id", deleteFlight);

// Bookings
router.get("/bookings", getAllBookings);
router.get("/bookings/export", exportBookingsCSV);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/deactivate", deactivateUser);

// Master data
router.get("/airports", getAirports);
router.post("/airports", createAirport);
router.get("/airlines", getAirlines);
router.post("/airlines", createAirline);

export default router;
