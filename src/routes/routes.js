import  Router  from "express";
import userRoutes from "../Routes/user.routes.js";
import inventoryRoutes from "../routes/inventory.routes.js";
import menuRoutes from "../routes/menu.routes.js";
import orderRoutes from "../Routes/order.routes.js";
import reservationRoutes from "../routes/reservation.routes.js";
import cartRoutes from "../routes/category.routes.js";
import paymentRoutes from "../Routes/payment.routes.js";
import dashboardRoutes from "../routes/dashborad.routes.js";
import reportRoutes from "../routes/report.routes.js";
import searchRoutes from "../Routes/search.routes.js";
import categoryRoutes from "../routes/category.routes.js";
import tableRoutes from "../routes/table.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);
router.use("/carts", cartRoutes);
router.use("/payments", paymentRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/tables", tableRoutes);
router.use("/reports", reportRoutes);
router.use("/search", searchRoutes);
router.use("/categories", categoryRoutes);
export default router;
