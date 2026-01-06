import express from "express"
import {getReports} from "../controllers/report-controller.js"
import  auth  from "../middlewares/auth.js"
import  isAdmin from "../middlewares/admin.js"

const router = express.Router()

// All report routes require admin authentication
router.use(auth, isAdmin);

router.get("/allreport",  getReports)


export default router
