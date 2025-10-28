import express from "express";
import { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder, } from "../Controllers/order-controller.js";
import auth from "../middlewares/auth.js";
const router = express.Router();

router.post("/", auth, createOrder)
router.get("/", auth, getAllOrders)
router.get("/:id", auth, getOrderById)
router.put("/:id", auth, updateOrder)
router.delete("/:id", auth, deleteOrder)


export default router;
