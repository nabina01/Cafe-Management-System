import express from "express";
import auth from "../middlewares/auth.js";
import { createReservation, getAllReservations, getReservationById, updateReservation, deleteReservation, getReservationByUserId } from "../controllers/reservation-controller.js";

const router = express.Router();

router.get("/", getAllReservations)
router.get("/:id", getReservationById)

router.post("/", auth, createReservation)
router.put("/:id", auth, updateReservation)
router.delete("/:id", auth, deleteReservation)
router.get("/user/:userId", auth, getReservationByUserId)

export default router;
