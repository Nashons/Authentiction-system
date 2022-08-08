const express = require("express");
const app = express();
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const userRoute = require("./route/user");
const authRoute = require("./route/auth");

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("connection successfull"))
.catch((err)=>{
    console.log(err);
});

app.use(express.json());

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);

app.listen(5001, ()=>{
    console.log("Backend server running")
})