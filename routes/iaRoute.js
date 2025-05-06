import { Router } from "express";
import { generateDescription } from "../controller/iaController.js";

const router = Router()

router.post("/generate", generateDescription);

export default router


