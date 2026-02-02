import express from "express";
import router from "./src/routes/routes.js"
import cors from "cors";
import dotenv from "dotenv";
import esewaRoutes from "./src/routes/esewa.routes.js";
import khaltiRoutes from "./src/routes/khalti.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware must come BEFORE routes
app.use(cors());
app.use(express.json());

// Then register routes
app.use('/esewa', esewaRoutes);
app.use('/khalti', khaltiRoutes);
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Cafe Management System API is running...");
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app
