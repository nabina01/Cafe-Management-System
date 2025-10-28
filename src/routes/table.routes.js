import express from "express"
import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  getAvailableTables
} from "../controllers/table-controller.js"

const router = express.Router()

router.post("/", createTable)
router.get("/", getAllTables)
router.get("/available", getAvailableTables)
router.get("/:id", getTableById)
router.put("/:id", updateTable)
router.delete("/:id", deleteTable)

export default router
