import  Router  from "express";
import userRoutes from "../Routes/user.routes.js";
import inventoryRoutes from "../routes/inventory.routes.js";
import menuRoutes from "../routes/menu.routes.js";
import orderRoutes from "../Routes/order.routes.js";
import reservationRoutes from "../Routes/reservation.routes.js";
import paymentRoutes from "../Routes/payment.routes.js";
import dashboardRoutes from "../Routes/dashborad.routes.js";
import reportRoutes from "../Routes/report.routes.js";
import searchRoutes from "../Routes/search.routes.js";
import categoryRoutes from "../Routes/category.routes.js";


const router = Router();

router.use("/users", userRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);
router.use("/payments", paymentRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/search", searchRoutes);
router.use("/categories", categoryRoutes);
export default router;
