const express = require("express");
const app = express();
const database = require("./database");
const cors = require("cors");
const dotenv = require("dotenv");
const allRoutes  =require("./routes/routes");
dotenv.config();
const PORT = process.env.PORT || 4000;

database.connect();

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials:true,
    })
)


app.use("/api", allRoutes)



app.get("/", (req,res) =>{
    return res.json({
        success:true,
        message:"Your server is up and running"
    })
})


app.listen(PORT, ()=>{
    console.log(`App is running at ${PORT}`);
})