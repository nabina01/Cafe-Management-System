import express from "express"
import {
  getSalesReport,
  getInventoryReport,
  getReservationReport
} from "../controllers/report-controller.js"
import  auth  from "../middlewares/auth.js"
import  isAdmin from "../middlewares/admin.js"

const router = express.Router()

router.get("/sales", auth, isAdmin, getSalesReport)
router.get("/inventory", auth, isAdmin, getInventoryReport)
router.get("/reservations", auth, isAdmin, getReservationReport)

export default router
