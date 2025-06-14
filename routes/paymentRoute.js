import { Router } from "express";
import { verifyPayementPub,getReservationPaymentsByPrestataireId,getPublicitePaymentsByPrestataireId,getAllPaymentPub,addPaymentPub,addPayment,verifyPayement,getPaymentByReservationId } from "../controller/paymentController.js";

const router = Router()

router.post("/add", addPayment)
router.get('/reservations/:prestataireId', getReservationPaymentsByPrestataireId);
router.get('/publicites/:prestataireId', getPublicitePaymentsByPrestataireId);
router.post("/addPB", addPaymentPub)
router.post("/verify/:payment_id", verifyPayement);
router.post("/verifyPub/:payment_id", verifyPayementPub);
router.get('/all', getAllPaymentPub);
router.get("/getByIdreservation/:reservationId", getPaymentByReservationId);
export default router