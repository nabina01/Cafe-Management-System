import { Router } from "express"
import {createMenuItem,getAllMenuItems,getMenuItemById,updateMenuItem,deleteMenuItem,} from "../Controllers/menu-controller.js"
import  auth  from "../middlewares/auth.js";
import  isAdmin  from "../middlewares/admin.js"

const router = Router()

// Public routes - anyone can view menu
router.get("/", getAllMenuItems)                   
router.get("/:id", getMenuItemById)               

// Admin only routes - only admins can manage menu
router.post("/", auth, isAdmin, createMenuItem)   
router.put("/:id", auth, isAdmin, updateMenuItem) 
router.delete("/:id", auth, isAdmin, deleteMenuItem) 


export default router
