import express from "express"
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  getPaymentByReservation
} from "../controllers/payment-controller.js"

const router = express.Router()

router.post("/", createPayment)
router.get("/", getAllPayments)
router.get("/:id", getPaymentById)
router.put("/:id", updatePaymentStatus)
router.get("/reservation/:reservationId", getPaymentByReservation)

export default router
