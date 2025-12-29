import express from "express"
import auth from "../middlewares/auth.js"
import isAdmin from "../middlewares/admin.js"
import { createUser, loginUser, updateUser, getUserById, getAllUsers, deleteUser, updateUserRole, logout, changePassword } from "../controllers/user-controller.js"

const router = express.Router()

// Public registration
router.post("/register", createUser) // public register (no role assignment)
router.post("/login", loginUser)     // login
router.post("/logout", logout)
router.post("/changepassword", changePassword)
router.put("/:id", updateUser)

// Admin-only user management
router.get("/", auth, isAdmin, getAllUsers)
router.get("/:id", auth, isAdmin, getUserById)
router.delete("/:id", auth, isAdmin, deleteUser)
router.put("/:id/role", auth, updateUserRole)

export default router
