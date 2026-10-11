import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/database";
import postRoutes from "./routes/postRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  }),
);

app.use(express.json());
app.use("/api/posts", postRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Posts CRUD API is running!",
  });
});

async function startServer(): Promise<void> {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MySQL:", error);
    process.exit(1);
  }
}

startServer();
