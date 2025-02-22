import prisma from "../DB/db.config.js";
import vine,{errors} from "@vinejs/vine";
import { registerAdminSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";

// @desc    register Admin 
// @route   POST /admin/auth/register
export const register = async(req,res)=>{
    try {
        const body = req.body;
        const validator = vine.compile(registerAdminSchema)
        const admin = await validator.validate(body)

        const findadmin = await prisma.admins.findUnique({
            where:{
                email:admin.email
            }
        })
        if(findadmin){
            return res.status(400).json({ errors: {
                email:"Email already taken. please use another one."
            } })
        }

        const salt = bcrypt.genSaltSync(10)
        admin.password = bcrypt.hashSync(admin.password, salt)

        const adminDB = await prisma.admins.create({
            data:admin
        })
        const user = await prisma.users.create({
            data:{
                email:admin.email,
                password:admin.password,
                role:"admin"
            }
        })
        return res.json({status:200 , message:"Admin created successfully", adminDB})
        
    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return res.status(400).json({ errors: error.messages })
        }else{
            return res.status(500).json({status:500, message:"Something went wrong;Please try again."})
        }
    }
}
