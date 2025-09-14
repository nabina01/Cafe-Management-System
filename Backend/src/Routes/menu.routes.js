import { Router } from "express"
import {createMenuItem,getAllMenuItems,getMenuItemById,updateMenuItem,deleteMenuItem,} from "../Controllers/menu-controller.js"

const router = Router()

router.post("/", createMenuItem)
router.get("/", getAllMenuItems)
router.get("/:id", getMenuItemById)
router.put("/:id", updateMenuItem)
router.delete("/:id", deleteMenuItem)

export default router
