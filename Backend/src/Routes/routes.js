import  Router  from "express";
import userRoutes from "../Routes/user.routes.js";
import inventoryRoutes from "../Routes/inventory.routes.js";
import menuRoutes from "../Routes/menu.routes.js";
import orderRoutes from "../Routes/order.routes.js";
import reservationRoutes from "../Routes/reservation.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);


export default router;
