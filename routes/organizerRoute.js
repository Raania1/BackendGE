import { Router } from "express";
import  { register, getAll } from "../controller/organizerController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";
import { upload } from "../middleware/uploadFile.js";
const router = Router()

router.post("/auth/register",upload.single("pdProfile"),register)
router.get("/organizers",verifyToken,roleBasedAccess(["admin"]),getAll)

export default router