import prisma from "../utils/prisma-client.js"
import { successResponse, errorResponse } from "../utils/json.js"
import { v4 as uuidv4 } from 'uuid'; //generate reservationId

// Create reservation
export const createReservation = async (req, res) => {
  try {
    const {customerName,email,phone,reservationTime,numberOfPeople,tableNumber,specialRequests,userId} = req.body
    if (!customerName || !reservationTime || !numberOfPeople) {
      return res.status(400).json({
        message: "customerName, reservationTime, and numberOfPeople are required"
      })
    }

    const newReservation = await prisma.reservation.create({
      data: {
        customerName,
        email,
        phone,
        reservationTime: new Date(reservationTime),
        numberOfPeople,
        tableNumber,
        specialRequests,
        status: "PENDING",
        reservationId: uuidv4(),
       userId: req.user.id,
      }
    })

    successResponse(res, { message: "Reservation created successfully", data: newReservation })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Get all reservations
export const getAllReservations = async (req, res) => {
  try {
    const { status, date } = req.query

    const filters = {}
    if (status) filters.status = status
    if (date) filters.reservationTime = new Date(date)

    const reservations = await prisma.reservation.findMany({
      where: filters,
      orderBy: { reservationTime: 'asc' }
    })

    successResponse(res, { data: reservations })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Get reservation by ID
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(id) }
    })

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }

    successResponse(res, { data: reservation })
  } catch (error) {
    errorResponse(res, error.message)
  }
}

// Update reservation
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ message: "No data provided to update" })
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: Number(id) },
      data: body
    })

    successResponse(res, { message: "Reservation updated successfully", data: updatedReservation })
  } catch (error) {
    errorResponse(res, error.message)
  }
};
  export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.reservation.delete({ where: { id: Number(id) } });
    successResponse(res, { message: "Reservation deleted successfully" });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getReservationByUserId = async (req, res) => {
  try {
    const { userId } = req.params
    const reservation = await prisma.reservation.findMany({
      where: { userId: Number(userId) }
    })
console.log("Reservation fetched for userId:", userId, reservation);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" })
    }

    successResponse(res, { data: reservation })
  } catch (error) {
    errorResponse(res, error.message)
  }
};




