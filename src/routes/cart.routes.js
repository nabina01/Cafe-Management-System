import express from "express";
import { createCart, getAllCarts, getCartById, updateCart, deleteCart, } from "../controllers/cart-controller.js";
import  auth from '../middlewares/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(auth);

router.post("/",  createCart)
router.get("/",  getAllCarts)
router.get("/:id", getCartById)
router.put("/:id",  updateCart)
router.delete("/:id",  deleteCart)


export default router;
