import { errorResponse } from "../utils/json.js"

const validatePayment = (req, res, next) => {
  const { amount, method, type, reservationId, transactionId } = req.body

  if (amount === undefined || method === undefined || type === undefined) {
    return errorResponse(res, "Amount, method, and type are required", 400)
  }

  const parsedAmount = parseFloat(amount)
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return errorResponse(res, "Amount must be a positive number", 400)
  }

  // allowed methods for payment
  const allowedMethods = ["CASH", "KHALTI"]
  const allowedTypes = ["FULL", "PARTIAL", "REFUND"]

  if (!allowedMethods.includes(String(method).toUpperCase())) {
    return errorResponse(res, `Method must be one of: ${allowedMethods.join(", ")}`, 400)
  }

  if (!allowedTypes.includes(String(type).toUpperCase())) {
    return errorResponse(res, `Type must be one of: ${allowedTypes.join(", ")}`, 400)
  }

  if (reservationId !== undefined && reservationId !== null && isNaN(Number(reservationId))) {
    return errorResponse(res, "reservationId must be a number", 400)
  }

  if (transactionId !== undefined && transactionId !== null && String(transactionId).length > 255) {
    return errorResponse(res, "transactionId is too long", 400)
  }

  req.body.amount = parsedAmount
  req.body.method = String(method).toUpperCase()
  req.body.type = String(type).toUpperCase()

  next()
}

export default validatePayment
