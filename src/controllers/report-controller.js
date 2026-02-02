import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"
import { parseISO } from "date-fns"

export const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const start = startDate ? parseISO(startDate) : new Date("2025-01-01")
    const end = endDate ? parseISO(endDate) : new Date()

    // Sales Report
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { totalAmount: true, orderPaymentType: true }
    })
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders ? totalSales / totalOrders : 0
    const paymentMethods = { CASH: 0, ESEWA: 0, KHALTI: 0 }
    orders.forEach(o => {
      paymentMethods[o.orderPaymentType] = (paymentMethods[o.orderPaymentType] || 0) + 1
    })

    // Inventory Report
    const items = await prisma.inventoryItem.findMany()
    const totalItems = items.length
    const lowStockItems = items.filter(i => i.currentStock < 5)
    const expiringItems = items.filter(i => i.expiryDate && new Date(i.expiryDate) <= new Date())
    const categoryBreakdown = {}
    items.forEach(i => {
      categoryBreakdown[i.category] = (categoryBreakdown[i.category] || 0) + 1
    })

    // Reservation Report
    const reservations = await prisma.reservation.findMany({
      where: { reservationTime: { gte: start, lte: end } }
    })
    const totalReservations = reservations.length
    const confirmed = reservations.filter(r => r.status === "CONFIRMED").length
    const cancelled = reservations.filter(r => r.status === "CANCELLED").length
    const completed = reservations.filter(r => r.status === "COMPLETED").length
    const averagePartySize = reservations.length
      ? reservations.reduce((sum, r) => sum + (r.numberOfPeople || 1), 0) / reservations.length
      : 0

    // All three reports
    const reports = {
      sales: { totalSales, totalOrders, averageOrderValue, paymentMethods },
      inventory: { totalItems, lowStockItems, expiringItems, categoryBreakdown },
      reservations: { totalReservations, confirmed, cancelled, completed, averagePartySize }
    }
    successResponse(res, { data: reports })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
