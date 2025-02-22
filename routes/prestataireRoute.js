import { Router } from "express";
import { register } from "../controller/prestataireController.js";
import { approovedPrestataire, getAllNotProovided } from "../controller/prestataireController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";
import { uploadP } from "../middleware/uploadFile.js";

const router = Router()

router.post("/auth/register",uploadP, register);
router.get("/notProovided",verifyToken,roleBasedAccess(["admin"]),getAllNotProovided)
router.put("/approovedPrestataire/:prestataireId",verifyToken,roleBasedAccess(["admin"]),approovedPrestataire)
export default router