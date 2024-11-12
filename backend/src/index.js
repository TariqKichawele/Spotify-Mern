import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import { initializeSocket } from "./lib/socket.js";
import cron from 'node-cron'
import fs from 'fs'

import userRoutes from "./routes/userRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import songRoutes from "./routes/songRoutes.js"
import albumRoutes from "./routes/albumRoutes.js"
import statsRoutes from "./routes/statRoutes.js"
import { connectDB } from "./lib/db.js"
import { createServer } from "http";

dotenv.config();
const PORT = process.env.PORT || 3000
const __dirname = path.resolve();
const app = express();

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }
));
app.use(express.json());
app.use(clerkMiddleware()); // Add auth to req obj => req.auth
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
}));

//cron jobs
const tempDir = path.join(process.cwd(), "tmp")
cron.schedule("0 * * * *", () => {
    if(fs.existsSync(tempDir)) {
        fs.readdir(tempDir, (err, files) => {
            if(err) {
                console.log("error", err);
                return;
            }
            for(const file of files) {
                fs.unlink(path.join(tempDir, file), (err) => {})
            }
        })
    }
})

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statsRoutes);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"))
    })
}

app.use((err, req, res, next) => {
    res.status(500).json({ message: process.env.NODE_ENV === "production" 
        ? "Internal Server Error" 
        : err.message 
    });
})

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
    connectDB();
})