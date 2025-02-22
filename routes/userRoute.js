import { Router } from "express";
import {ForgetPassword, login}  from "../controller/userController.js";

const router = Router()

router.post("/auth/login",login)
router.post("/fogetpassword",ForgetPassword)
export default router