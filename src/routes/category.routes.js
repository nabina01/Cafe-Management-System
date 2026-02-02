import express from "express"
import {getMenuCategories,getInventoryCategories,} from "../controllers/category-controller.js"

const router = express.Router()

router.get("/menu/categories", getMenuCategories)
router.get("/inventory/categories", getInventoryCategories)
export default router
