import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"

// GET /api/activity-logs
export const getActivityLogs = async (req, res) => {
  try {
    const { limit = 50, userId, action } = req.query

    const where = {}
    if (userId) where.userId = Number(userId)
    if (action) where.action = action

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      include: { user: { select: { id: true, name: true, email: true } } }
    })

   return successResponse(res, logs, "Activity logs fetched successfully")
  } catch (error) {
    return errorResponse(res, error.message)
  }
}
