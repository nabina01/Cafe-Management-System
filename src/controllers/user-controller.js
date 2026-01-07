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
    const { name, email, password, role, phoneNumber } = req.body

    if (!name || !email || !password || !phoneNumber) return errorResponse(res, "All fields are required", 400)

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
      data: { name, email, password: hashedPassword, role: finalRole, phoneNumber },
      select: { id: true, name: true, email: true, phoneNumber: true, role: true, createdAt: true }
    })

    successResponse(res, newUser, "User registered successfully")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, "Email and password are required", 400);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
        createdAt: true
      }
    });

    if (!user) return errorResponse(res, "Invalid email or password", 400);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, "Invalid email or password", 400);

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "15m" }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    successResponse(res, { user: safeUser, accessToken }, "Login successful");
  } catch (error) {
    errorResponse(res, error.message);
  }
};



// Logout 
export const logout = async (req, res) => {
  try {

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

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phoneNumber: true, role: true, createdAt: true }
    })
    successResponse(res, users)
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true, phoneNumber: true, role: true, createdAt: true }
    })
    if (!user) return errorResponse(res, "User not found", 404)
    successResponse(res, user)
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

//Update user by ID 
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    if (!data || Object.keys(data).length === 0) {
      return errorResponse(res, "No data provided to update", 400)
    }
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, name: true, email: true, phoneNumber: true, role: true, createdAt: true }
    })

    successResponse(res, updatedUser, "User updated successfully")
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Admin-only: update a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check role is provided
    if (!role) return errorResponse(res, "Role is required", 400);

    // Normalize + validate role
    const upper = String(role).toUpperCase();
    if (!ALLOWED_ROLES.includes(upper)) {
      return errorResponse(res, "Invalid role", 400);
    }

    // Update role
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: upper },
      select: { id: true, name: true, email: true, phoneNumber: true, role: true, createdAt: true }
    });

    successResponse(res, updated, "User role updated successfully");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return errorResponse(res, "Old and new password are required", 400);
    }

    const userId = req.user.id; // If schema id is Int, use Number(req.user.id)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse(res, "User not found", 404);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return errorResponse(res, "Old password is incorrect", 400);

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) return errorResponse(res, "New password cannot be same as old password", 400);

    // ✅ Hash and update only password field
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    successResponse(res, updatedUser, "Password changed successfully");

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};