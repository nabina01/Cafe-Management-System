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
        orderPaymentType: orderPaymentType || "CASH",
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

//update order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      paymentStatus,
      orderPaymentType,
      customerName,
      items,
      totalAmount,
      servedAt
    } = req.body;

    const data = {};

    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (orderPaymentType) data.orderPaymentType = orderPaymentType;
    if (customerName) data.customerName = customerName;
    if (items) data.items = items;
    if (totalAmount) data.totalAmount = totalAmount;
    if (servedAt) data.servedAt = new Date(servedAt);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(id) }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data
    });

    return res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update order",
      error: error.message
    });
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
