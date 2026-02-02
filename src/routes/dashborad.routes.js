import express from "express"
import {getDashboardStatus,getRevenueReport,getPopularItems,getOrderTrends,  getDashboardCounts, getProfitLoss} from "../controllers/dashboard-controller.js"
import  auth  from "../middlewares/auth.js"
import  isAdmin  from "../middlewares/admin.js"

const router = express.Router()

router.get("/status", auth, isAdmin, getDashboardStatus)
router.get("/revenue", auth, isAdmin, getRevenueReport)
router.get("/popular-items", auth, isAdmin, getPopularItems)
router.get("/order-trends", auth, isAdmin, getOrderTrends)
router.get("/counts",   getDashboardCounts)
router.get("/profit-loss",   getProfitLoss)


export default router
