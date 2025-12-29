import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"

// Create cart
export const createCart = async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "User ID and items are required" })
    }

    const newCart = await prisma.cart.create({
      data: {
        userId,
        items,        // store items as JSON array
        totalAmount
      }
    })

    successResponse(res, { message: "Cart created successfully", data: newCart })
  } catch (error) {
    console.error(error)
    errorResponse(res, error.message)
  }
}

// Get all carts
export const getAllCarts = async (req, res) => {
  try {
    const carts = await prisma.cart.findMany({
      orderBy: { createdAt: 'desc' }
    })

    successResponse(res, { data: carts })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Get cart by ID
export const getCartById = async (req, res) => {
  try {
    const { id } = req.params

    const cart = await prisma.cart.findUnique({
      where: { id: Number(id) }
    })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    successResponse(res, { data: cart })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Update cart
export const updateCart = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No data provided to update" })
    }

    const updatedCart = await prisma.cart.update({
      where: { id: Number(id) },
      data
    })

    successResponse(res, { message: "Cart updated successfully", data: updatedCart })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Delete cart
export const deleteCart = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.cart.delete({ where: { id: Number(id) } })

    successResponse(res, { message: "Cart deleted successfully" })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
