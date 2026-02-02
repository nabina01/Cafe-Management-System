import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"

//  Create inventory item
export const createInventoryItem = async (req, res) => {
  try {
    const { name, category, currentStock, quality, supplier, minStock } = req.body;

    if (!name || !category || currentStock === undefined) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        currentStock: Number(currentStock),
        quality: quality || "Standard",
        supplier: supplier || null,
        minStock: minStock ? Number(minStock) : 5,
      },
    });

    successResponse(res, { message: "Item created successfully", item });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

//  Get all inventory items 
export const getAllInventoryItems = async (req, res) => {
  try {
    const { category } = req.query;

    const filters = {};
    if (category) filters.category = category;

    const items = await prisma.inventoryItem.findMany({
      where: filters,
    });
    successResponse(res, { data: items });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

//  Get single inventory item by ID
export const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id: Number(id) },
    });

    if (!item) return res.status(404).json({ message: "Item not found" });

    successResponse(res, item);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

//  Update inventory item
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, currentStock, quality, supplier, lastRestocked, expiryDate } = req.body;

    const updated = await prisma.inventoryItem.update({
      where: { id: Number(id) },
      data: {
        name,
        category,
        currentStock: currentStock !== undefined ? Number(currentStock) : undefined,
        quality,
        supplier,
        lastRestocked: lastRestocked ? new Date(lastRestocked) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
    });

    successResponse(res, { message: "Item updated successfully", updated });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

//  Update stock of inventory item
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; 

    const item = await prisma.inventoryItem.findUnique({
      where: { id: Number(id) },
    });

    if (!item) return res.status(404).json({ message: "Item not found" });

    let newStock =
      type === "add"
        ? item.currentStock + Number(quantity)
        : item.currentStock - Number(quantity);

    if (newStock < 0) newStock = 0;

    const updated = await prisma.inventoryItem.update({
      where: { id: Number(id) },
      data: { currentStock: newStock, lastRestocked: new Date() },
    });

    successResponse(res, { message: "Stock updated successfully", updated });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

//  Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany();

    const lowStockItems = items.filter((item) => item.currentStock < item.minStock);

    successResponse(res, { data: lowStockItems });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

//  Delete inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.inventoryItem.delete({
      where: { id: Number(id) },
    });

    successResponse(res, { message: "Item deleted successfully" });
  } catch (error) {
    errorResponse(res, error.message);
  }
};
