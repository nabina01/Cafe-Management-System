import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"
import { parseISO, startOfHour, endOfHour } from "date-fns"

// Get Available Tables
export const getAvailableTables = async (req, res) => {
  try {
    const { capacity, date, time } = req.query
    if (!date || !time) return res.status(400).json({ message: "Date and time are required" })

    const start = startOfHour(parseISO(`${date}T${time}`))
    const end = endOfHour(parseISO(`${date}T${time}`))
    const reservedTables = await prisma.reservation.findMany({
      where: { 
        OR: [
          { status: "RESERVED" },
          { status: "CONFIRMED" }
        ],
        dateTime: { gte: start, lte: end }
      },
      select: { tableId: true }
    })
    const reservedIds = reservedTables.map(t => t.tableId)

    const availableTables = await prisma.table.findMany({
      where: {
        id: { notIn: reservedIds },
        ...(capacity ? { capacity: { gte: Number(capacity) } } : {})
      },
      orderBy: { tableNumber: "asc" }
    })

    successResponse(res, { data: availableTables })
  } catch (error) {
    errorResponse(res, error.message)
  }
};

// Update Table
export const updateTable = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const updatedTable = await prisma.table.update({ where: { id: Number(id) }, data })
    successResponse(res, { message: "Table updated successfully", data: updatedTable })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Delete Table
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.table.delete({ where: { id: Number(id) } })
    successResponse(res, { message: "Table deleted successfully" })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

