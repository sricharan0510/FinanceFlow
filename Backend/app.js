import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({
    path: './.env'
});

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());



import authRouter from "./routes/auth.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import reportRouter from "./routes/report.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";

app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/reports", reportRouter);
app.use("/api/subscriptions", subscriptionRouter);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT}`);
        });
        console.log(" MongoDB connected!");
    })
    .catch((err) => {
        console.log("MONGODB connection error: ", err);
        process.exit(1);
    });