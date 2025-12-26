import express from "express"
import auth from "../middlewares/auth.js"
import isAdmin from "../middlewares/admin.js"
import { createUser, loginUser, getCurrentUser, getAllUsers, deleteUser, updateUserRole, refreshAccessToken, logout, requestPasswordReset, confirmPasswordReset } from "../controllers/user-controller.js"

const router = express.Router()

// Public registration
router.post("/register", createUser) // public register (no role assignment)
router.post("/login", loginUser)     // login
router.post("/token", refreshAccessToken)
router.post("/logout", logout)
router.post("/password-reset/request", requestPasswordReset)
router.post("/password-reset/confirm", confirmPasswordReset)

// Protected (authenticated)
router.get("/currentuser", auth, getCurrentUser)

// Admin-only user management
router.post("/", auth, isAdmin, createUser) // create users with role (admin only)
router.get("/", auth, isAdmin, getAllUsers)
router.delete("/:id", auth, isAdmin, deleteUser)
router.put("/:id/role", auth, isAdmin, updateUserRole)

export default router
