import express from "express";
import { createCart, getAllCarts, getCartById, updateCart, deleteCart, } from "../Controllers/cart-controller.js";
const router = express.Router();

router.post("/",  createCart)
router.get("/",  getAllCarts)
router.get("/:id", getCartById)
router.put("/:id",  updateCart)
router.delete("/:id",  deleteCart)


export default router;
