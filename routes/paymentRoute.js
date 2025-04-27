import { Router } from "express";
import { addPayment,verifyPayement } from "../controller/paymentController.js";

const router = Router()

router.post("/add", addPayment)
router.post("/verify/:id_payment", verifyPayement)

export default router