import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"

// Get  menu categories
export const getMenuCategories = async (req, res) => {
  try {
    const categories = await prisma.menuItem.findMany({
      distinct: ["category"],
      select: { category: true }
    })

    const categoryList = categories.map(c => c.category)
    successResponse(res, categoryList, "Menu categories fetched successfully")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Get  inventory categories
export const getInventoryCategories = async (req, res) => {
  try {
    const categories = await prisma.inventoryItem.findMany({
      distinct: ["category"],
      select: { category: true }
    })
    const categoryList = categories.map(c => c.category)
    successResponse(res, categoryList, "Inventory categories fetched successfully")
  } catch (error) {
    errorResponse(res, error.message)
  }
}
