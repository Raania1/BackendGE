import prisma from "../DB/db.config.js";
import vine,{errors} from "@vinejs/vine";
import { registerAdminSchema, updateAdminSchema } from "../validations/authValidation.js";
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
// @desc    updateById admin
// @route   PUT /admin/update/:id
//access private admin (still mofifier)
export const updateById = async(req,res)=>{
    try {
        const {id} =req.params;

        const validator = vine.compile(updateAdminSchema);
        const validateData = await validator.validate(req.body);

        const admin = await prisma.admins.findUnique({
            where:{id},
        })
        if(!admin){
            return res.status(404).json({message:"Admin not found"})
        }

        const updatedAdmin = await prisma.admins.update({
            where:{id},
            data: validateData,
        })
        if(validateData.email && validateData.email !== admin.email){
            await prisma.users.update({
                where:{email: admin.email},
                data:{email: validateData.email}
            })
        }

        return res.status(200).json({ updatedAdmin });
    } catch (err) {
        console.error("Error updating admin:", err);
    
        if (err instanceof errors.E_VALIDATION_ERROR) {
          return res.status(400).json({ errors: err.messages });
        }
    
        return res.status(500).json({ message: "Failed to update admin", error: err.message });
    } 
}
// @desc    getById admin 
// @route   GET /admin/getById/:id
export const getById = async(req,res)=>{
    try {
        const {id} = req.params
        const admin = await prisma.admins.findUnique({
            where:{id}
        })
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json({admin})
    } catch (error) {
        console.error("Error fetching admin:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
      }
}
// @desc    delete admin
// @route   delete /admin/deleteadmin/:id
//access private  admin
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
  
        const admin = await prisma.admins.findUnique({
            where: { id }
        });
  
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        await prisma.users.delete({
            where: { email:admin.email }
        })
        await prisma.admins.delete({
        where: { id }
    });
  
        return res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Error deleting admin:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
    }
  };
