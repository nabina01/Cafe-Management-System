import express from "express"
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  getPaymentByReservation,
  createStripePaymentIntent,
  stripeWebhook
} from "../controllers/payment-controller.js"
import auth from "../middlewares/auth.js"
import isAdmin from "../middlewares/admin.js"
import validatePayment from "../middlewares/validate-payment.js"

const router = express.Router()

router.post("/", auth, validatePayment, createPayment)

router.post("/intent", auth, createStripePaymentIntent)

router.post("/webhook", express.raw({ type: 'application/json' }), stripeWebhook)
router.get("/", getAllPayments)
router.get("/:id", getPaymentById)
router.put("/:id", auth, isAdmin, updatePaymentStatus)
router.get("/reservation/:reservationId", getPaymentByReservation)

export default router
