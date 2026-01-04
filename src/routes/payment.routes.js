import express from "express";
import {initiatePayment,paymentStatus,} from "../controllers/payment-controller.js";

const router = express.Router();

router.post("/initiate-payment", initiatePayment);

router.post("/payment-status", paymentStatus);

export default router;