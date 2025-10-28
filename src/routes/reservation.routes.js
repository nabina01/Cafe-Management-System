import express from "express";
import {createReservation,getAllReservations,getReservationById,updateReservation,deleteReservation} from "../Controllers/reservation-controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, createReservation)
router.get("/", auth, getAllReservations)
router.get("/:id", auth, getReservationById)
router.put("/:id", auth, updateReservation)
router.delete("/:id", auth, deleteReservation)

export default router;
