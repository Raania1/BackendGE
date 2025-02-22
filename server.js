import express from "express"
import "dotenv/config"
import organizerRoute from "./routes/organizerRoute.js"
import adminRoute from "./routes/adminRoute.js"
import prestataireRoute from "./routes/prestataireRoute.js"
import userRoute from "./routes/userRoute.js"
const app = express()
const PORT =process.env.PORT || 8000

// *Middelware
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get("/",(req,res)=>{
    return res.json({message:"Hello it's running.."});
});
app.use("/user", userRoute)
app.use("/organizer", organizerRoute)
app.use("/prestataire", prestataireRoute)
app.use("/admin", adminRoute)


app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));