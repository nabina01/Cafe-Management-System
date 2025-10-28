import prisma from "../utils/prisma-client.js"
import { parseISO, endOfDay } from "date-fns"

// Search Orders
export const searchOrders = async (req, res) => {
  try {
    const { customerName, status, startDate, endDate } = req.query

    const where = {}
    if (customerName) where.customerName = { contains: customerName, mode: "insensitive" }
    if (status) where.status = status
    if (startDate || endDate) {
      where.createdAt = {
        gte: startDate ? parseISO(startDate) : undefined,
        lte: endDate ? endOfDay(parseISO(endDate)) : undefined
      }
    }

    const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" } })
    successResponse(res, { data: orders })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Search Menu Items
export const searchMenuItems = async (req, res) => {
  try {
    const { query, available } = req.query

    const where = {}
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ]
    }
    if (available === "true") where.isActive = true

    const items = await prisma.menuItem.findMany({ where, orderBy: { name: "asc" } })
    successResponse(res, { data: items })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Search Reservations
export const searchReservations = async (req, res) => {
  try {
    const { query, status } = req.query

    const where = {}
    if (query) {
      where.OR = [
        { customerName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } }
      ]
    }
    if (status) where.status = status

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { dateTime: "desc" }
    })

    successResponse(res, { data: reservations })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
