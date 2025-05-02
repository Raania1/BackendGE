import { Router } from "express";
import { deleteAdmin,changePassword, getById, register, updateById } from "../controller/adminController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";
const router = Router()

router.post("/auth/register",register)
router.get("/getById/:id",verifyToken,roleBasedAccess(["admin"]),getById)
router.put("/update/:id",verifyToken,roleBasedAccess(["admin"]),updateById)
router.put("/changePass/:id", changePassword);
router.delete("/deleteadmin/:id",verifyToken,roleBasedAccess(["admin"]),deleteAdmin)

export default router