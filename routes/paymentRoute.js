import { Router } from "express";
import { verifyPayementPub,getPaymentPubById,getPaymentById,getAllPaymentPub,addPaymentPub,addPayment,verifyPayement,getPaymentByReservationId } from "../controller/paymentController.js";

const router = Router()

router.post("/add", addPayment)
router.get("getPaymentById/:paymentId",getPaymentById)
router.get("getPaymentPubById/:paymentId",getPaymentPubById)
router.post("/addPB", addPaymentPub)
router.post("/verify/:payment_id", verifyPayement);
router.post("/verifyPub/:payment_id", verifyPayementPub);
router.get('/all', getAllPaymentPub);
router.get("/getByIdreservation/:reservationId", getPaymentByReservationId);
export default router