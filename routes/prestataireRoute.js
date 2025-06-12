import { Router } from "express";
import { deletePrestataire,getTopPrestataires,disablePrestataire,refusePrestataire,getAllP, changePassword,getAll,getServicePhotosByPrestataire, getById, register, updateById } from "../controller/prestataireController.js";
import { ActivPrestataire,approvePrestataire, getAllNotProovided } from "../controller/prestataireController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";
import { uploadP,upload } from "../middleware/uploadFile.js";

const router = Router()

router.post("/auth/register",uploadP, register)
router.get("/notProovided",verifyToken,roleBasedAccess(["admin"]),getAllNotProovided)
router.put("/approovedPrestataire/:prestataireId",verifyToken,roleBasedAccess(["admin"]),approvePrestataire)
router.put("/disablePrestataire/:prestataireId",verifyToken,roleBasedAccess(["admin"]),disablePrestataire)
router.put("/ActivPrestataire/:prestataireId",verifyToken,roleBasedAccess(["admin"]),ActivPrestataire)
router.delete("/refusePrestataire/:prestataireId",verifyToken,roleBasedAccess(["admin"]),refusePrestataire)
router.put("/update/:id",verifyToken,roleBasedAccess(["prestataire"]),upload.single("pdProfile"),updateById)
router.put("/changePass/:id", changePassword);
router.get("/prestataires",verifyToken,getAll);
router.get("/getById/:id",getById)
router.get('/:id/service-photos', getServicePhotosByPrestataire);
router.get('/presP', getAllP);
router.delete("/deleteprestataire/:id",verifyToken,roleBasedAccess(["admin","prestataire"]),deletePrestataire)
router.get('/getTopPrestataires',getTopPrestataires)
export default router