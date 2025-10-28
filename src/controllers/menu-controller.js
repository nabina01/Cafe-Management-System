import prisma from "../utils/prisma-client.js"

//  Create menu item
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, available, image } = req.body

    if (!name || !price) {
      return errorResponse(res, "Name and price are required", 400)
    }

    const newItem = await prisma.menuItem.create({
      data: { name, description, price, available, image },
    })

    successResponse(res, { message: "Menu item created successfully", data: newItem })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

//  Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const { available } = req.query;

    const filters = {};
    if (available !== undefined) filters.available = available === 'true';

    const menuItems = await prisma.menuItem.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        available: true,
      },
    });

    successResponse(res, { data: menuItems });
  } catch (error) {
    errorResponse(res, error.message);
  }
};



//  Get menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        available: true,
      },
    });

    if (!item) return res.status(404).json({ message: "Menu item not found" });

    successResponse(res, item);
  } catch (error) {
    errorResponse(res, error.message);
  }
};


//  Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    const updatedItem = await prisma.menuItem.update({
      where: { id: Number(id) },
      data,
    })

    successResponse(res, { message: "Menu item updated successfully", data: updatedItem })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

//  Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.menuItem.delete({ where: { id: Number(id) } })

    successResponse(res, { message: "Menu item deleted successfully" })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
