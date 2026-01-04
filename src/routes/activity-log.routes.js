import express from "express"
import { getActivityLogs } from "../controllers/activity-log-controller.js"


const router = express.Router()

router.get("/",  getActivityLogs)

export default router
