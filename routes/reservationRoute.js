import { Router } from "express";
import {createReservation,getAll,deleteReservation,countReservationByPrestataireId,cancelReservation,confirmReservation}  from "../controller/reservationController.js";

const router = Router()

router.post("/demande",createReservation)
router.get("/getall",getAll)
router.get("/countReservation/:Prestataireid",countReservationByPrestataireId)
router.put('/confirm/:reservationId/confirm', confirmReservation);
router.delete('/deleteById/:reservationId', deleteReservation);
router.put('/cancel/:reservationId', cancelReservation);

export default router