import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"

// Create order
export const createOrder = async (req, res) => {
  try {
    const { customerName, items, totalAmount, orderPaymentType, paymentStatus } = req.body

    console.log("=== CREATE ORDER ===")
    console.log("Customer:", customerName)
    console.log("Items:", JSON.stringify(items))
    console.log("Payment Type:", orderPaymentType)

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: "Customer name and items are required" })
    }

    // Check inventory availability before creating order
    const insufficientItems = []
    
    for (const item of items) {
      const menuItemName = item.name
      const quantity = item.quantity || 1

      const requiredItems = getInventoryItems(menuItemName)
      
      for (const required of requiredItems) {
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: { 
            name: {
              contains: required.name,
              mode: 'insensitive'
            }
          }
        })

        if (inventoryItem) {
          const totalRequired = required.quantity * quantity
          if (inventoryItem.currentStock < totalRequired) {
            insufficientItems.push(`${menuItemName} (${required.name}: Available ${inventoryItem.currentStock}, Required ${totalRequired})`)
          }
        }
        // If inventory item not found, allow the order (assume unlimited stock for missing items)
      }
    }

    if (insufficientItems.length > 0) {
      console.log("Insufficient inventory:", insufficientItems)
      return res.status(400).json({ 
        message: "Insufficient inventory", 
        insufficientItems 
      })
    }

    // Create order only - inventory will be deducted when payment is completed
    const newOrder = await prisma.order.create({
      data: {
        customerName,
        items, 
        totalAmount,
        status: "PENDING",
        paymentStatus: paymentStatus || "PENDING",
        orderPaymentType: orderPaymentType || "CASH",
      }
    })

    console.log("Order created:", newOrder.id)
    console.log("Note: Inventory will be deducted when payment is completed")

    // Deduct inventory if payment is completed
    if (paymentStatus === "COMPLETED") {
      console.log("Payment completed, deducting inventory...")
      await deductInventory(items)
    }

    successResponse(res, { message: "Order created successfully", data: newOrder })
  } catch (error) {
    console.error("Order creation error:", error)
    errorResponse(res, error.message)
  }
}

// Function to deduct inventory
async function deductInventory(items) {
  for (const item of items) {
    const menuItemName = item.name
    const quantity = item.quantity || 1

    const requiredItems = getInventoryItems(menuItemName)
    
    for (const required of requiredItems) {
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: { 
          name: {
            contains: required.name,
            mode: 'insensitive'
          }
        }
      })

      if (inventoryItem) {
        const totalDeduct = required.quantity * quantity
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            currentStock: {
              decrement: totalDeduct
            }
          }
        })
        console.log(`Deducted ${totalDeduct} ${required.name} for ${menuItemName}`)
      }
    }
  }
}
function getInventoryItems(menuItemName) {
  const mappings = {
    // Coffee items
    'Espresso': [{ name: 'Coffee Beans', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Americano': [{ name: 'Coffee Beans', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Cappuccino': [{ name: 'Coffee Beans', quantity: 1 }, { name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Latte': [{ name: 'Coffee Beans', quantity: 1 }, { name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Macchiato': [{ name: 'Coffee Beans', quantity: 1 }, { name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Iced Coffee': [{ name: 'Coffee Beans', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    
    // Tea items
    'Black Tea': [{ name: 'Tea', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Green Tea': [{ name: 'Tea', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Milk Tea': [{ name: 'Tea', quantity: 1 }, { name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Matka Chai': [{ name: 'Tea', quantity: 1 }, { name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Iced Lemon Tea': [{ name: 'Tea', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    
    // Milkshakes & Lassi
    'Chocolate Milkshake': [{ name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Strawberry Milkshake': [{ name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Vanilla Milkshake': [{ name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Mango Lassi': [{ name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Sweet Lassi': [{ name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    
    // Fresh Juices & Coolers
    'Lemonade': [{ name: 'Cups', quantity: 1 }],
    'Orange Pineapple Juice': [{ name: 'Cups', quantity: 1 }],
    'Mango Smoothie': [{ name: 'Milk', quantity: 1 }, { name: 'Cups', quantity: 1 }],
    'Strawberry Lemon Cooler': [{ name: 'Cups', quantity: 1 }],
    
    // Bakery & Desserts
    'Croissant': [{ name: 'Flour', quantity: 1 }],
    'Muffin': [{ name: 'Flour', quantity: 1 }],
    'Brownie': [{ name: 'Flour', quantity: 1 }],
    'Donut': [{ name: 'Flour', quantity: 1 }],
    'Cookie': [{ name: 'Flour', quantity: 1 }],
  }

  // Check exact match first
  if (mappings[menuItemName]) {
    return mappings[menuItemName]
  }

  // Check if menu item name contains any of the keys
  for (const [key, value] of Object.entries(mappings)) {
    if (menuItemName.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  // Default: just cups
  console.log(`No mapping found for: ${menuItemName}, using default cups`)
  return [{ name: 'Cups', quantity: 1 }]
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
      where: { id: Number(id) }  
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

    console.log("=== UPDATE ORDER ===")
    console.log("Order ID:", id)
    console.log("New Payment Status:", paymentStatus)

    const order = await prisma.order.findUnique({
      where: { id: Number(id) }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

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

    // If payment status is changing from PENDING to COMPLETED, deduct inventory
    if (paymentStatus === "COMPLETED" && order.paymentStatus !== "COMPLETED") {
      console.log("Payment completed - deducting inventory")
      
      await prisma.$transaction(async (tx) => {
        // Deduct inventory for each item
        const orderItems = order.items
        
        for (const item of orderItems) {
          const menuItemId = item.itemId || item.id
          const quantity = item.quantity || 1

          const menuItem = await tx.menuItem.findUnique({
            where: { id: menuItemId }
          })

          if (menuItem) {
            const inventoryItemName = getInventoryItemName(menuItem.name)
            
            const inventoryItem = await tx.inventoryItem.findFirst({
              where: { 
                name: {
                  contains: inventoryItemName,
                  mode: 'insensitive'
                }
              }
            })

            if (inventoryItem) {
              if (inventoryItem.currentStock >= quantity) {
                const newStock = inventoryItem.currentStock - quantity
                
                await tx.inventoryItem.update({
                  where: { id: inventoryItem.id },
                  data: {
                    currentStock: newStock
                  }
                })
                
                console.log(`Inventory updated: ${inventoryItem.name} - Deducted ${quantity}, New stock: ${newStock}`)
              } else {
                console.log(`Warning: Insufficient inventory for ${inventoryItem.name}. Current: ${inventoryItem.currentStock}, Required: ${quantity}`)
              }
            } else {
              console.log(`Warning: No inventory item found for ${menuItem.name}`)
            }
          }
        }

        // Update the order
        await tx.order.update({
          where: { id: Number(id) },
          data
        })
      })
      
      console.log("Inventory deduction completed")
    } else {
      // Just update the order without inventory changes
      await prisma.order.update({
        where: { id: Number(id) },
        data
      })
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: Number(id) }
    })

    console.log("Order updated successfully")

    return res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder
    });

  } catch (error) {
    console.error("Order update error:", error);
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
