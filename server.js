import express from "express"
import "dotenv/config"
import organizerRoute from "./routes/organizerRoute.js"
import adminRoute from "./routes/adminRoute.js"
import prestataireRoute from "./routes/prestataireRoute.js"
import userRoute from "./routes/userRoute.js"
import serviceRoute from "./routes/serviceRoute.js"
import eventRoute from "./routes/eventRoute.js"
import reservationRoute from "./routes/reservationRoute.js"
import commentRoute from "./routes/commentRouter.js"
import paymentRoute from "./routes/paymentRoute.js"
import messageRoute from "./routes/messageRoute.js"


const app = express()
import cors from "cors"; 
const PORT =process.env.PORT || 8000

// *Middelware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors({
    origin: ["http://localhost:3000"], 
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    
  }));
  app.use(cors())
app.get("/",(req,res)=>{
    return res.json({message:"Hello it's running.."});
});
app.use("/user", userRoute)
app.use("/organizer", organizerRoute)
app.use("/prestataire", prestataireRoute)
app.use("/admin", adminRoute)
app.use("/service", serviceRoute)
app.use("/event", eventRoute)
app.use("/reservation", reservationRoute)
app.use("/comment", commentRoute)
app.use("/payment", paymentRoute)
app.use("/message", messageRoute)



app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));