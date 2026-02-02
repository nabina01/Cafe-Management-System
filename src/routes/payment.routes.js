import express from "express";
import {initiatePayment,paymentStatus,verifyKhaltiPayment,} from "../controllers/payment-controller.js";

const router = express.Router();

router.post("/initiate-payment", initiatePayment);
router.post("/payment-status", paymentStatus);
router.post("/verify-khalti", verifyKhaltiPayment);

export default router;