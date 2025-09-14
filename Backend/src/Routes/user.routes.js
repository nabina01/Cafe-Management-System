import { Router } from "express";
import { createUser, getAllUsers,getUserById, updateUser, deleteUser,loginUser, logoutUser } from "../Controllers/User-controller.js";

const router = Router();

router.post("/", createUser);       
router.get("/", getAllUsers);  
router.get("/:id", getUserById);      
router.put("/:id", updateUser);      
router.delete("/:id", deleteUser); 
router.post("/login",  loginUser);
router.post("/logout",  logoutUser);

export default router;
