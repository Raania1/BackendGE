import { Router } from "express";
import { addPayment,verifyPayement,getPaymentByReservationId } from "../controller/paymentController.js";

const router = Router()

router.post("/add", addPayment)
router.post("/verify/:payment_id", verifyPayement);
router.get("/getByIdreservation/:reservationId", getPaymentByReservationId);

export default router