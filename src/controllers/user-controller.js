import prisma from "../utils/prisma-client.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Register new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) return errorResponse(res, "All fields are required", 400)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return errorResponse(res, "Email already exists", 400)

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || "USER" },
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

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Exclude password
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }

    successResponse(res, { user: safeUser, token }, "Login successful")
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
