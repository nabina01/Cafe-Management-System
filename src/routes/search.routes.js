import express from "express"
import { searchOrders, searchMenuItems, searchReservations } from "../controllers/search-controller.js"

const router = express.Router()

router.get("/orders/search", searchOrders)
router.get("/menu/search", searchMenuItems)
router.get("/reservations/search", searchReservations)

export default router
