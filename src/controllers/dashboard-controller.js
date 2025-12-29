import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"
import { startOfDay, endOfDay, parseISO } from "date-fns"

export const getDashboardStatus = async (req, res) => {
  try {
    const today = new Date();

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      totalReservations,
      todayReservations,
      lowStockItems,
      totalMenuItems,
      activeMenuItems
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: startOfDay(today), lte: endOfDay(today) } }
      }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startOfDay(today), lte: endOfDay(today) } }
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.reservation.count(),
      prisma.reservation.count({
        where: { createdAt: { gte: startOfDay(today), lte: endOfDay(today) } }
      }),
      prisma.inventoryItem.count({ where: { currentStock: { lt: 5 } } }), // fixed
      prisma.menuItem.count(),
      prisma.menuItem.count({ where: { available: true } }) // fixed
    ]);

    successResponse(res, {
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      pendingOrders,
      totalReservations,
      todayReservations,
      lowStockItems,
      totalMenuItems,
      activeMenuItems
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
};



export const getRevenueReport = async (req, res) => {
  try {
    const { period = "daily", startDate, endDate } = req.query
    const start = startDate ? parseISO(startDate) : new Date("2025-01-01")
    const end = endDate ? parseISO(endDate) : new Date()

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, totalAmount: true }
    })

    const grouped = {}

    for (const order of orders) {
      let key
      const date = new Date(order.createdAt)
      if (period === "weekly") {
        const week = Math.ceil(date.getDate() / 7)
        key = `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
      } else {
        key = date.toISOString().split("T")[0]
      }

      grouped[key] = (grouped[key] || 0) + order.totalAmount
    }

    const report = Object.entries(grouped).map(([date, revenue]) => ({
      date,
      revenue
    }))

    successResponse(res, { data: report })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

export const getPopularItems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await prisma.order.findMany({
      select: { items: true }
    });

    const itemCounts = {};

    orders.forEach(order => {
      const items = order.items || [];
      items.forEach(i => {
        const name = i.name || i.menuItemId;
        itemCounts[name] = (itemCounts[name] || 0) + (i.quantity || 1);
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, Number(limit))
      .map(([name, count]) => ({ name, orderCount: count }));

    successResponse(res, { data: popularItems });
  } catch (error) {
    errorResponse(res, error.message);
  }
};


export const getOrderTrends = async (req, res) => {
  try {
    const [pending, inProgress, completed, cancelled] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "IN_PROGRESS" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } })
    ])

    successResponse(res, {
      data: { pending, inProgress, completed, cancelled }
    })
  } catch (error) {
    errorResponse(res, error.message)
  }
}
