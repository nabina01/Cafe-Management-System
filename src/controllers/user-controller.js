import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { addHours } from "date-fns"

// Register new user
const ALLOWED_ROLES = ["USER", "ADMIN"]

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body

    if (!name || !email || !password || !phoneNumber) return errorResponse(res, "All fields are required", 400)

    // Validate phone number - must be exactly 10 digits
    if (phoneNumber.length !== 10) {
      return errorResponse(res, "Wrong number - Phone number must be exactly 10 digits", 400)
    }

    // Check if phone number contains only digits
    if (!/^\d{10}$/.test(phoneNumber)) {
      return errorResponse(res, "Wrong number - Phone number must contain only digits", 400)
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return errorResponse(res, "Email already exists", 400)

    // Check if phone number already exists
    const existingPhone = await prisma.user.findFirst({ where: { phoneNumber } })
    if (existingPhone) return errorResponse(res, "Phone number already registered", 400)
    let finalRole = "USER"
    if (role) {
      const upper = String(role).toUpperCase()
      
      // Prevent ADMIN role assignment (only via seed.js)
      if (upper === "ADMIN") {
        return errorResponse(res, "ADMIN role can only be created via seed script", 403)
      }
      
      if (!ALLOWED_ROLES.includes(upper)) return errorResponse(res, "Invalid role specified", 400)

      if (upper !== "USER") {
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
    console.log("=== LOGIN REQUEST ===");
    const { email, password } = req.body;
    console.log("Email received:", email);
    console.log("Password received:", password ? "***" : "MISSING");
    
    if (!email || !password) {
      console.log("Missing email or password");
      return errorResponse(res, "Email and password are required", 400);
    }

    console.log("Searching for user with email:", email);
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

    if (!user) {
      console.log("User not found with email:", email);
      return errorResponse(res, "Invalid email or password", 400);
    }
    
    console.log("User found:", user.email, "Role:", user.role);

    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return errorResponse(res, "Invalid email or password", 400);
    }

    console.log("Generating JWT token...");
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

    console.log("Login successful for:", email);
    console.log("=== LOGIN SUCCESS ===");
    successResponse(res, { user: safeUser, accessToken }, "Login successful");
  } catch (error) {
    console.error("=== LOGIN ERROR ===");
    console.error("Error:", error);
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

// Get all users (Admin only) - excludes ADMIN users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: "ADMIN" // Exclude admin users (created via seed.js)
        }
      },
      select: { id: true, name: true, email: true, phoneNumber: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
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

// Delete user 
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { role: true, email: true }
    })
    
    if (!user) {
      return errorResponse(res, "User not found", 404)
    }
    
    if (user.role === "ADMIN") {
      return errorResponse(res, "Cannot delete ADMIN users", 403)
    }
    
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

    
    if (!role) return errorResponse(res, "Role is required", 400);
    const upper = String(role).toUpperCase();
    if (upper === "ADMIN") {
      return errorResponse(res, "ADMIN role can only be created via seed script", 403);
    }
    
    if (!ALLOWED_ROLES.includes(upper)) {
      return errorResponse(res, "Invalid role", 400);
    }
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { role: true }
    });
    
    if (existingUser?.role === "ADMIN") {
      return errorResponse(res, "Cannot modify ADMIN users", 403);
    }

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

    //  Hash and update only password field
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