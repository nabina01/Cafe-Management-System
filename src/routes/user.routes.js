import express from "express"
import  auth  from "../Middlewares/auth.js"
import  isAdmin  from "../Middlewares/admin.js"
import { createUser, loginUser, getCurrentUser, getAllUsers, deleteUser } from "../Controllers/user-controller.js"

const router = express.Router()

// Public
router.post("/", createUser)         // register
router.post("/login", loginUser)     // login

// Protected (authenticated)
router.get("/me", auth, getCurrentUser)

// Admin only
router.get("/", auth, isAdmin, getAllUsers)
router.delete("/:id", auth, isAdmin, deleteUser)

export default router
