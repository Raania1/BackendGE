import { Router } from "express";
import {getAll,createReservation,getAllReservationPacksOnly,getPackReservationsByPrestataireId,getServiceReservationsByPrestataireId,countPaidReservations,countReservations,countReservationsByServiceId,getAllReservationServicesOnly,deleteReservation,countReservationByPrestataireId,cancelReservation,confirmReservation}  from "../controller/reservationController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";

const router = Router()

router.post("/demande",createReservation)
router.get("/getAllReservationServicesOnly",getAllReservationServicesOnly)
router.get("/getAllReservationPacksOnly",getAllReservationPacksOnly)
router.get("/countReservation/:Prestataireid",countReservationByPrestataireId)
router.get('/countReservationS/:serviceId', countReservationsByServiceId);
router.get('/countReservations/:organizerId', countReservations);
router.get('/countPaidReservations/:organizerId', countPaidReservations);
router.get('/getServiceReservationsByPrestataireId/:Prestataireid', getServiceReservationsByPrestataireId);
router.get('/getPackReservationsByPrestataireId/:Prestataireid', getPackReservationsByPrestataireId);
router.get("/getAll",verifyToken,roleBasedAccess(["admin"]),getAll)
router.put('/confirm/:reservationId/confirm', confirmReservation);
router.delete('/deleteById/:reservationId', deleteReservation);
router.put('/cancel/:reservationId', cancelReservation);

export default router