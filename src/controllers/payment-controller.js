import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export const createPayment = async (req, res) => {
  try {
    const { amount, method, type, reservationId, transactionId } = req.body

    if (!amount || !method || !type) {
      return errorResponse(res, "Amount, method, and type are required", 400)
    }

    const parsedAmount = parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return errorResponse(res, "Amount must be a positive number", 400)
    }

    // If method indicates an online/card payment and Stripe is available, create a PaymentIntent
    if (String(method).toUpperCase() === "CARD" || String(method).toUpperCase() === "ONLINE") {
      if (!stripe) return errorResponse(res, "Payment provider not configured", 500)

      const intent = await stripe.paymentIntents.create({
        amount: Math.round(parsedAmount * 100), // cents
        currency: process.env.DEFAULT_CURRENCY || 'usd',
        metadata: { reservationId: reservationId ? String(reservationId) : '' }
      })

      // create DB record linked to the PaymentIntent id (transactionId)
      const payment = await prisma.payment.create({
        data: {
          amount: parsedAmount,
          method,
          type,
          reservationId: reservationId ? Number(reservationId) : null,
          transactionId: intent.id,
          status: "PENDING"
        }
      })

      return successResponse(res, { message: "Payment intent created", data: { payment, clientSecret: intent.client_secret } })
    }

    const payment = await prisma.payment.create({
      data: {
        amount: parsedAmount,
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

// Create a payment intent explicitly (alternate entrypoint)
export const createStripePaymentIntent = async (req, res) => {
  try {
    if (!stripe) return errorResponse(res, "Payment provider not configured", 500)

    const { amount, currency = process.env.DEFAULT_CURRENCY || 'usd', reservationId } = req.body
    if (!amount) return errorResponse(res, "Amount is required", 400)

    const parsedAmount = parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return errorResponse(res, "Amount must be positive", 400)

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(parsedAmount * 100),
      currency,
      metadata: { reservationId: reservationId ? String(reservationId) : '' }
    })

    successResponse(res, { data: { clientSecret: intent.client_secret, id: intent.id } })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Stripe webhook handler - ensure express receives raw body for this route
export const stripeWebhook = async (req, res) => {
  try {
    if (!stripe) return res.status(200).send('no-stripe-configured')

    const sig = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    let event

    try {
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret)
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // handle relevant events
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object
      // update payment record by transactionId
      await prisma.payment.updateMany({ where: { transactionId: intent.id }, data: { status: 'COMPLETED' } })
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object
      await prisma.payment.updateMany({ where: { transactionId: intent.id }, data: { status: 'FAILED' } })
    }

    res.json({ received: true })
  } catch (error) {
    res.status(500).send(error.message)
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
      return errorResponse(res, "Payment not found", 404)
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
      return errorResponse(res, "Status is required", 400)
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
      return errorResponse(res, "No payment found for this reservation", 404)
    }

    successResponse(res, { data: payment })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
