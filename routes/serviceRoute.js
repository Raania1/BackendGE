import { Router } from "express";
import { createService,getServiceById ,getServices,getAllNotProovided,getServicesByTypeP,deleteService,approovedService,getAllServices,getAllServicesP,updateServiceWithoutPhotos,deletePhotoByIndex,addPhotosToService,updateServicePhotos,filterServices} from "../controller/ServiceController.js";
import { uploadS,upload } from "../middleware/uploadFile.js";

const router = Router()

router.post("/create",uploadS, createService)
router.post("/addPhotos/:serviceId", uploadS, addPhotosToService);  
router.get("/getById/:id",getServiceById)
router.get("/services",getAllServices)
router.get("/notProovided",getAllNotProovided)
router.get("/getServices",getServices)
// router.get("/filter", filterServices);
// router.get("/servicesP", getAllServicesP);
// router.get("/servicesByTypeP", getServicesByTypeP);
router.put("/approovedService/:serviceId",approovedService)
router.put("/updatewithoutPhotos/:id",upload.single("photoCouverture"),updateServiceWithoutPhotos)
router.put("/updateServicePhotos/:serviceId", uploadS, updateServicePhotos );  
router.delete("/deleteService/:id",deleteService)
router.delete("/deletePhoto/:serviceId/:photoIndex", deletePhotoByIndex);

export default router