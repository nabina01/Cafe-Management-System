import express from "express";
import {createInventoryItem,getAllInventoryItems,getInventoryItemById ,updateInventoryItem,updateStock,getLowStockItems,deleteInventoryItem,} from "../Controllers/inventory-controller.js";
import  auth  from "../middlewares/auth.js";
import  isAdmin  from "../middlewares/admin.js";
const router = express.Router();

router.get("/", auth, isAdmin, getAllInventoryItems)
router.post("/", auth, isAdmin, createInventoryItem)
router.put("/:id", auth, isAdmin, updateInventoryItem)
router.get("/:id", auth, isAdmin, getInventoryItemById)
router.put(":id", auth, isAdmin, updateStock)
router.get("/low-stock", auth, isAdmin, getLowStockItems)
router.delete("/:id", auth, isAdmin, deleteInventoryItem)


export default router;
