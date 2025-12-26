import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"
import { parseISO, startOfDay, endOfDay } from "date-fns"

// Sales Report
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const start = startDate ? parseISO(startDate) : new Date("2025-01-01")
    const end = endDate ? parseISO(endDate) : new Date()

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { totalAmount: true, orderPaymentType: true }
    })

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders ? totalSales / totalOrders : 0

    const paymentMethods = { CASH: 0, ESEWA: 0, KHALTI: 0 }
    orders.forEach(o => paymentMethods[o.orderPaymentType] = (paymentMethods[o.orderPaymentType] || 0) + 1)

    successResponse(res, {
      data: {
        totalSales,
        totalOrders,
        averageOrderValue,
        paymentMethods
      }
    })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Inventory Report
export const getInventoryReport = async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany()

    const totalItems = items.length
    const lowStockItems = items.filter(i => i.currentStock < 5)
    const expiringItems = items.filter(i => i.expiryDate && new Date(i.expiryDate) <= new Date())

    const categoryBreakdown = {}
    items.forEach(i => {
      categoryBreakdown[i.category] = (categoryBreakdown[i.category] || 0) + 1
    })

    successResponse(res, {
      data: {
        totalItems,
        lowStockItems,
        expiringItems,
        categoryBreakdown
      }
    })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Reservation Report
export const getReservationReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const start = startDate ? parseISO(startDate) : new Date("2025-01-01")
    const end = endDate ? parseISO(endDate) : new Date()

    const reservations = await prisma.reservation.findMany({
      where: { dateTime: { gte: start, lte: end } }
    })

    const totalReservations = reservations.length
    const confirmed = reservations.filter(r => r.status === "CONFIRMED").length
    const cancelled = reservations.filter(r => r.status === "CANCELLED").length
    const completed = reservations.filter(r => r.status === "COMPLETED").length
    const averagePartySize = reservations.length
      ? reservations.reduce((sum, r) => sum + (r.partySize || 1), 0) / reservations.length
      : 0

    successResponse(res, {
      data: {
        totalReservations,
        confirmed,
        cancelled,
        completed,
        averagePartySize
      }
    })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
