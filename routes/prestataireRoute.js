import { Router } from "express";
import { deletePrestataire, getAll, getById, register, updateById } from "../controller/prestataireController.js";
import { approovedPrestataire, getAllNotProovided } from "../controller/prestataireController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";
import { uploadP,upload } from "../middleware/uploadFile.js";

const router = Router()

router.post("/auth/register",uploadP, register)
router.get("/notProovided",verifyToken,roleBasedAccess(["admin"]),getAllNotProovided)
router.put("/approovedPrestataire/:prestataireId",verifyToken,roleBasedAccess(["admin"]),approovedPrestataire)
router.put("/update/:id",verifyToken,roleBasedAccess(["prestataire"]),upload.single("pdProfile"),updateById)
router.get("/prestataires",verifyToken,getAll)
router.get("/getById/:id",verifyToken,getById)
router.delete("/deleteprestataire/:id",verifyToken,roleBasedAccess(["admin","prestataire"]),deletePrestataire)


export default router