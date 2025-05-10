import { Router } from "express";
import {updateEvent,countEvents,filterEvents,deleteEvent,createEvent,addServiceToEvent,getAllEventsWithServices,getEventById,removeServiceFromEvent} from "../controller/eventController.js"
const router = Router()

router.post("/create", createEvent)
router.post("/addService", addServiceToEvent); 
router.post("/removeService", removeServiceFromEvent);
router.get("/getById/:id",getEventById)
router.get("/getAllEventsWithServices", getAllEventsWithServices);  
router.get("/countEvents/:organizerId", countEvents);  
router.get("/filter", filterEvents);
router.put("/update/:id",updateEvent)
router.delete("/delete/:id", deleteEvent);  

export default router