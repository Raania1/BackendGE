import { Router } from "express";
import  { createContract, getContractByPaymentId, downloadContract} from "../controller/contratController.js";
const router = Router();


router.post('/create', createContract);

router.get('/:paymentId', getContractByPaymentId);

router.get('/:paymentId/download', downloadContract);

export default router