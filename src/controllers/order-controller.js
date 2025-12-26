import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"

// Create order
export const createOrder = async (req, res) => {
  try {
    const { customerName, items, totalAmount, orderPaymentType } = req.body

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: "Customer name and items are required" })
    }

    const newOrder = await prisma.order.create({
      data: {
        customerName,
        items, // directly store JSON array
        totalAmount,
        status: "PENDING",
        paymentStatus: "PENDING",
        orderPaymentType: orderPaymentType || "CASH"
      }
    })

    successResponse(res, { message: "Order created successfully", data: newOrder })
  } catch (error) {
    console.error(error)
    errorResponse(res, error.message)
  }
}

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' } 
    })

    successResponse(res, { data: orders })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) }  // just this
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    successResponse(res, { data: order });
  } catch (error) {
    errorResponse(res, error.message);
  }
};


// Update order 
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body; 

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data, 
    });

    successResponse(res, { message: "Order updated successfully", data: updatedOrder });
  } catch (error) {
    errorResponse(res, error.message);
  }
};


// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.order.delete({ where: { id: Number(id) } })

    successResponse(res, { message: "Order deleted successfully" })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
