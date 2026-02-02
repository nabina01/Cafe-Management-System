import express from "express"
import auth from "../middlewares/auth.js"
import isAdmin from "../middlewares/admin.js"
import { createUser, loginUser, updateUser, getUserById, getAllUsers, deleteUser, updateUserRole, logout, changePassword } from "../controllers/user-controller.js"

const router = express.Router()

// any user can access these routes
router.post("/register", createUser)
router.post("/login", loginUser)     
router.post("/logout", logout)
router.post("/changepassword", changePassword)
router.get("/me", auth, (req, res) => {
  const { id, name, email, role, createdAt } = req.user;
  res.json({ id, name, email, role, createdAt });
});
router.put("/:id", updateUser)

// Only admin can access the routes 
router.get("/", auth, isAdmin, getAllUsers)
router.get("/:id", auth, isAdmin, getUserById)
router.delete("/:id", auth, isAdmin, deleteUser)
router.put("/:id/role", auth, updateUserRole)

export default router