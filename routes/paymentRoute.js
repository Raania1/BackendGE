import { Router } from "express";
import { verifyPayementPub,getAllPaymentPub,addPaymentPub,addPayment,verifyPayement,getPaymentByReservationId } from "../controller/paymentController.js";

const router = Router()

router.post("/add", addPayment)
router.post("/addPB", addPaymentPub)
router.post("/verify/:payment_id", verifyPayement);
router.post("/verifyPub/:payment_id", verifyPayementPub);
router.get('/all', getAllPaymentPub);
router.get("/getByIdreservation/:reservationId", getPaymentByReservationId);

export default router