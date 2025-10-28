import prisma from "../utils/prisma-client.js"

export const createPayment = async (req, res) => {
  try {
    const { amount, method, type, reservationId, transactionId } = req.body

    if (!amount || !method || !type) {
      return res.status(400).json({ message: "Amount, method, and type are required" })
    }

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        method,
        type,
        reservationId: reservationId ? Number(reservationId) : null,
        transactionId: transactionId || null,
        status: "PENDING"
      }
    })

    successResponse(res, { message: "Payment created successfully", data: payment })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

export const getAllPayments = async (req, res) => {
  try {
    const { status, method, type } = req.query
    const filters = {}

    if (status) filters.status = status
    if (method) filters.method = method
    if (type) filters.type = type

    const payments = await prisma.payment.findMany({
      where: filters,
      orderBy: { createdAt: "desc" }
    })

    successResponse(res, { data: payments })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params

    const payment = await prisma.payment.findUnique({
      where: { id: Number(id) }
    })

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    successResponse(res, { data: payment })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const payment = await prisma.payment.update({
      where: { id: Number(id) },
      data: { status }
    })

    successResponse(res, { message: "Payment status updated successfully", data: payment })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

export const getPaymentByReservation = async (req, res) => {
  try {
    const { reservationId } = req.params

    const payment = await prisma.payment.findFirst({
      where: { reservationId: Number(reservationId) }
    })

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this reservation" })
    }

    successResponse(res, { data: payment })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
