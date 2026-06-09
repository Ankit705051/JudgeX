import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import problemRouter from "./routes/problem.routes.js";

const app=express();


app.use(cors({
    origin:["http://localhost:3000"],
    credentials:true,
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


//routes
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/problem",problemRouter);

app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"Route not Found",
    })
});

export default app;