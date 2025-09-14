import express from "express";
import {createReservation,getAllReservations,getReservationById,updateReservation} from "../Controllers/reservation-controller.js";

const router = express.Router();

router.post("/", createReservation);
router.get("/", getAllReservations);
router.get("/:id", getReservationById);
router.put("/:id", updateReservation);

export default router;
