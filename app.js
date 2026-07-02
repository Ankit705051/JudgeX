import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import problemRouter from "./routes/problem.routes.js";
import TestCaseRouter from  "./routes/test.routes.js";
import submitCodeRouter  from "./routes/submission.routes.js";
import contestRouter from "./routes/contest.routes.js";
import  contestProblemRouter from "./routes/problemContest.routes.js";
import contestParticipantRouter from "./routes/contestParticipant.routes.js";
import contestSubmissionRouter from "./routes/contestSubmission.routes.js";
import discussionRouter from "./routes/discussion.routes.js";
const app=express();


app.use(cors({
    origin:["http://localhost:5173", "https://sprightly-kataifi-1a0126.netlify.app"],
    credentials:true,
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


//routes
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/problem",problemRouter);
app.use("/api/v1/testCase",TestCaseRouter);
app.use("/api/v1/submission",submitCodeRouter);
app.use("/api/v1/contest",contestRouter);
app.use("/api/v1/contestProblem",contestProblemRouter);
app.use("/api/v1/contestRegister",contestParticipantRouter);
app.use("/api/v1/contestSubmission",contestSubmissionRouter);
app.use("/api/v1/discussion",discussionRouter);

app.get("/",(req,res)=>{
    res.send("Hello World");
});


app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"Route not Found",
    })
});

export default app;