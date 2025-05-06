import { Router } from "express";
import { createRating,getRatingByPrestataire } from "../controller/ratingController.js";

const router = Router()

router.post('/create', createRating);
router.get('/ratingPrestataire/:prestataireid', getRatingByPrestataire);

export default router