import express from "express"
import {updateTable,deleteTable,getAvailableTables} from "../controllers/table-controller.js"

const router = express.Router()

router.get("/available", getAvailableTables)
router.put("/:id", updateTable)
router.delete("/:id", deleteTable)

export default router
