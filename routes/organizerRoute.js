import { Router } from "express";
import  { register,getServiceReservationsByOrganizerId, getAll,getPackReservationsByOrganizerId,changePassword, updateById, getById, deleteOrganizer } from "../controller/organizerController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";
import { upload } from "../middleware/uploadFile.js";
const router = Router()

router.post("/auth/register",upload.single("pdProfile"),register)
router.get("/organizers",verifyToken,roleBasedAccess(["admin"]),getAll)
router.get("/getById/:id",verifyToken,getById)
router.put("/update/:id",verifyToken,roleBasedAccess(["organizer"]),upload.single("pdProfile"),updateById)
router.put("/changePass/:id", changePassword);
router.delete("/deleteorganizer/:id",verifyToken,roleBasedAccess(["admin","organizer"]),deleteOrganizer)
router.get('/reservations/packs/:id', getPackReservationsByOrganizerId);
router.get('/reservations/services/:id', getServiceReservationsByOrganizerId);

export default router