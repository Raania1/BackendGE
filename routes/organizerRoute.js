import { Router } from "express";
import  { register, getAll,changePassword, updateById, getById, deleteOrganizer } from "../controller/organizerController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";
import { upload } from "../middleware/uploadFile.js";
const router = Router()

router.post("/auth/register",upload.single("pdProfile"),register)
router.get("/organizers",verifyToken,roleBasedAccess(["admin"]),getAll)
router.get("/getById/:id",verifyToken,getById)
router.put("/update/:id",verifyToken,roleBasedAccess(["organizer"]),upload.single("pdProfile"),updateById)
router.put("/changePass/:id", changePassword);
router.delete("/deleteorganizer/:id",verifyToken,roleBasedAccess(["admin","organizer"]),deleteOrganizer)

export default router