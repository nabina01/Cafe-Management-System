import express from "express";
import {createInventoryItem,getAllInventoryItems,updateInventoryItem,deleteInventoryItem,} from "../Controllers/inventory-controller.js";
import  auth  from "../middlewares/auth.js";
import  isAdmin  from "../middlewares/admin.js";
const router = express.Router();

router.get("/", auth, isAdmin, getAllInventoryItems)
router.post("/", auth, isAdmin, createInventoryItem)
router.put("/:id", auth, isAdmin, updateInventoryItem)
router.delete("/:id", auth, isAdmin, deleteInventoryItem)


export default router;
