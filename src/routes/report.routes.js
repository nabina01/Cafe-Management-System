import express from "express"
import {getReports} from "../controllers/report-controller.js"
import  auth  from "../middlewares/auth.js"
import  isAdmin from "../middlewares/admin.js"

const router = express.Router()
router.get("/allreport",  getReports)

export default router
