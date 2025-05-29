import { Router } from "express";
import {ForgetPassword, login, resetPassword}  from "../controller/userController.js";

const router = Router()

 router.post("/auth/login",login)
router.post("/fogetpassword",ForgetPassword)
router.post("/resetPassword/:id/:token",resetPassword)

export default router