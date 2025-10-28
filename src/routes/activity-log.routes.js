import express from "express"
import { getActivityLogs } from "../controllers/activity-log-controller.js"
import  auth  from "../Middleware/auth-middleware.js"
import  isAdmin  from "../Middleware/admin-middleware.js"

const router = express.Router()

router.get("/", auth, isAdmin, getActivityLogs)

export default router
