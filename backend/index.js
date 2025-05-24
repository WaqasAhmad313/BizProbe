require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./src/db");

const userRoutes = require("./src/routes/userRoutes");
const businessRoutes = require("./src/routes/businessRoutes");
const dashBusinessRoutes = require("./src/routes/dashBusinessAndOutreachRoutes");
const templatesRoutes = require("./src/routes/dashTemplateRoutes");
const gmailAccountsRoutes = require("./src/routes/gmailAccountsRoutes");
const getMailDataRoute = require("./src/routes/mailRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
// Middleware
app.use(cors({ origin: corsOptions }));
app.use(express.json());

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running...");
});

// Use API Routes
app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/business", dashBusinessRoutes);
app.use("/api/dashtemp/", templatesRoutes);
app.use("/api/gmail/", gmailAccountsRoutes);
app.use("/api/maildata/", getMailDataRoute);

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
