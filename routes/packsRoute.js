import { Router } from "express";
import  { deletePackById,addServiceToPack,deleteServiceFromPack,createPack,updatePack,getPackById} from "../controller/packsController.js";
import { upload } from "../middleware/uploadFile.js";
const router = Router()

router.post("/create",upload.single("coverPhotoUrl"),createPack)
router.put("/update/:id",upload.single("coverPhotoUrl"),updatePack)
router.get("/getById/:id",getPackById)
router.delete('/services/:serviceId', deleteServiceFromPack);
router.post('/servicesAdd/:packId', addServiceToPack);
router.delete('/delete/:id', deletePackById);


export default router