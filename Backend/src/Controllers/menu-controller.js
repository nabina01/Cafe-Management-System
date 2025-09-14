import prisma from '../Utils/prisma-schema.js'

//  Create menu item
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, available, image } = req.body

    if (!name || !price ) {
      return res.status(400).json({ message: "Nameand  price are required" })
    }

    const newItem = await prisma.menuItem.create({
      data: { name, description, price,  available,  image },
    })

    res.status(201).json({ message: "Menu item created successfully", data: newItem })
  } catch (error) {
    res.status(500).json({ message: error.message })
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

    res.status(200).json({ success: true, data: menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    const updatedItem = await prisma.menuItem.update({
      where: { id: Number(id) },
      data,
    })

    res.json({ message: "Menu item updated successfully", data: updatedItem })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ✅ Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.menuItem.delete({ where: { id: Number(id) } })

    res.json({ message: "Menu item deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
