import express from "express"
import {
  getDashboardStats,
  getRevenueReport,
  getPopularItems,
  getOrderTrends
} from "../controllers/dashboard-controller.js"
import  auth  from "../middlewares/auth.js"
import  isAdmin  from "../middlewares/admin.js"

const router = express.Router()

router.get("/stats", auth, isAdmin, getDashboardStats)
router.get("/revenue", auth, isAdmin, getRevenueReport)
router.get("/popular-items", auth, isAdmin, getPopularItems)
router.get("/order-trends", auth, isAdmin, getOrderTrends)


export default router
