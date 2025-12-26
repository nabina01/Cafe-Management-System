import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { addHours } from "date-fns"

// Register new user
const ALLOWED_ROLES = ["USER", "STAFF", "ADMIN"]

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) return errorResponse(res, "All fields are required", 400)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return errorResponse(res, "Email already exists", 400)

    // Only allow setting non-USER roles when the requester is an admin
    let finalRole = "USER"
    if (role) {
      const upper = String(role).toUpperCase()
      if (!ALLOWED_ROLES.includes(upper)) return errorResponse(res, "Invalid role specified", 400)

      if (upper !== "USER") {
        // if request is not from an admin, forbid creating elevated roles
        if (!req.user || req.user.role !== "ADMIN") {
          return errorResponse(res, "Cannot assign elevated roles", 403)
        }
      }

      finalRole = upper
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: finalRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    successResponse(res, newUser, "User registered successfully")
  } catch (error) {
     errorResponse(res, error.message)
  }
}

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return errorResponse(res, "Email and password are required", 400)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return errorResponse(res, "Invalid credentials", 401)

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return errorResponse(res, "Invalid credentials", 401)

    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "15m" })

    // create refresh token and persist
    const refreshTokenValue = crypto.randomBytes(40).toString('hex')
    const refreshExpires = addHours(new Date(), Number(process.env.REFRESH_TOKEN_EXPIRES_HOURS || 24 * 7))
    await prisma.refreshToken.create({ data: { token: refreshTokenValue, userId: user.id, expiresAt: refreshExpires } })

    // Exclude password
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }

    successResponse(res, { user: safeUser, accessToken, refreshToken: refreshTokenValue }, "Login successful")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Refresh access token
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return errorResponse(res, "refreshToken is required", 400)

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } })
    if (!stored || stored.revoked) return errorResponse(res, "Invalid refresh token", 401)
    if (new Date() > stored.expiresAt) return errorResponse(res, "Refresh token expired", 401)

    // rotate: revoke old and issue new
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } })

    const newTokenValue = crypto.randomBytes(40).toString('hex')
    const refreshExpires = addHours(new Date(), Number(process.env.REFRESH_TOKEN_EXPIRES_HOURS || 24 * 7))
    await prisma.refreshToken.create({ data: { token: newTokenValue, userId: stored.userId, expiresAt: refreshExpires } })

    const accessToken = jwt.sign({ id: stored.user.id, role: stored.user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "15m" })

    successResponse(res, { accessToken, refreshToken: newTokenValue })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Logout (revoke refresh token)
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return errorResponse(res, "refreshToken is required", 400)

    await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } })
    successResponse(res, {}, "Logged out")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Request password reset - returns token (in prod send email)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return errorResponse(res, "Email is required", 400)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return errorResponse(res, "User not found", 404)

    const token = crypto.randomBytes(24).toString('hex')
    const expiresAt = addHours(new Date(), 1)
    await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } })

    // TODO: send `token` via email to user. For now we return it (dev only).
    successResponse(res, { token }, "Password reset token created (dev only)")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Confirm password reset
export const confirmPasswordReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) return errorResponse(res, "Token and newPassword are required", 400)

    const record = await prisma.passwordResetToken.findUnique({ where: { token }, include: { user: true } })
    if (!record) return errorResponse(res, "Invalid token", 400)
    if (record.used) return errorResponse(res, "Token already used", 400)
    if (new Date() > record.expiresAt) return errorResponse(res, "Token expired", 400)

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } })
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } })

    successResponse(res, {}, "Password reset successfully")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })
    if (!user) return errorResponse(res, "User not found", 404)

     successResponse(res, user)
  } catch (error) {
     errorResponse(res, error.message)
  }
}

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })
     successResponse(res, users)
  } catch (error) {
     errorResponse(res, error.message)
  }
}

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.user.delete({ where: { id: Number(id) } })
     successResponse(res, {}, "User deleted successfully")
  } catch (error) {
   errorResponse(res, error.message)
  }
}

// Update current user
export const updateCurrentUser = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const data = {}
    if (name) data.name = name
    if (email) data.email = email
    if (password) data.password = await bcrypt.hash(password, 10)

    const updatedUser = await prisma.user.update({
      where: { id: Number(req.user.id) },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    successResponse(res, updatedUser, "Profile updated successfully")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) return errorResponse(res, "Old and new password are required", 400)

    const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } })
    if (!user) return errorResponse(res, "User not found", 404)

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) return errorResponse(res, "Old password is incorrect", 400)

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } })

     successResponse(res, {}, "Password changed successfully")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Admin-only: update a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!role) return errorResponse(res, "Role is required", 400)

    const upper = String(role).toUpperCase()
    if (!ALLOWED_ROLES.includes(upper)) return errorResponse(res, "Invalid role", 400)

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: upper },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    successResponse(res, updated, "User role updated successfully")
  } catch (error) {
    errorResponse(res, error.message)
  }
}
