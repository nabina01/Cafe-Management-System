import { Router } from "express"
import {createMenuItem,getAllMenuItems,getMenuItemById,updateMenuItem,deleteMenuItem,} from "../Controllers/menu-controller.js"
import  auth  from "../middlewares/auth.js";
import  isAdmin  from "../middlewares/admin.js"

const router = Router()

router.get("/", getAllMenuItems)                    // public
router.get("/:id", getMenuItemById)               // public

router.post("/", auth, isAdmin, createMenuItem)   // admin
router.put("/:id", auth, isAdmin, updateMenuItem) // admin
router.delete("/:id", auth, isAdmin, deleteMenuItem) // admin


export default router
