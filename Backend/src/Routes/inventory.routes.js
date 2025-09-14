import express from "express";
import {createInventoryItem,getAllInventoryItems,getInventoryItemById,updateInventoryItem,updateStock,getLowStockItems,deleteInventoryItem,} from "../Controllers/inventory-controller.js";

const router = express.Router();

router.post("/", createInventoryItem);
router.get("/", getAllInventoryItems);
router.get("/:id", getInventoryItemById);
router.put("/:id", updateInventoryItem);
router.patch("/:id", updateStock);
router.get("/", getLowStockItems);
router.delete("/:id", deleteInventoryItem);

export default router;
