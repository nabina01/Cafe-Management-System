import express from "express";
import {createInventoryItem,getAllInventoryItems,getInventoryItemById ,updateInventoryItem,updateStock,getLowStockItems,deleteInventoryItem,} from "../Controllers/inventory-controller.js";

const router = express.Router();

router.get("/",  getAllInventoryItems)
router.post("/",  createInventoryItem)
router.put("/:id", updateInventoryItem)
router.get("/:id",  getInventoryItemById)
router.put(":id",  updateStock)
router.get("/low-stock",  getLowStockItems)
router.delete("/:id",  deleteInventoryItem)


export default router;
