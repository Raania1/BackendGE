import { Router } from "express";
import { addPayment,verifyPayement } from "../controller/paymentController.js";

const router = Router()

router.post("/add", addPayment)
router.post("/verify/:payment_id", verifyPayement);

export default router