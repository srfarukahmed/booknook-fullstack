import express from "express";
import { initializeDatabase } from "./database.js";
import { createApp } from "./app.js";

const app = express();
let initializing: ReturnType<typeof initializeDatabase> | undefined;

app.use(async (_request, response, next) => {
  try {
    initializing ??= initializeDatabase().catch((error) => {
      initializing = undefined;
      throw error;
    });
    await initializing;
    next();
  } catch {
    console.error("BookNook database initialization failed.");
    response.status(503).json({ message: "Database connection unavailable." });
  }
});

// Services preserve the incoming URL. Express removes this mount prefix before
// invoking the existing library app, leaving /books, /borrows, and /health intact.
app.use("/library-api", createApp());
export default app;
