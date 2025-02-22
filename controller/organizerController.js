import prisma from "../DB/db.config.js";
import vine,{errors} from "@vinejs/vine";
import { registerOrganizerSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";

const DEFAULT_PROFILE_IMAGE = "https://th.bing.com/th/id/OIP.lvzPu-WOW4Iv7QyjP-IkrgHaHa?rs=1&pid=ImgDetMain";
// @desc    register organize 
// @route   POST /organizer/auth/register
export const register = async(req,res)=>{
    try {
        const body = req.body;
        const validator = vine.compile(registerOrganizerSchema)
        const organizer = await validator.validate(body)

        const findOrganizer = await prisma.organisateurs.findUnique({
            where:{
                email:organizer.email
            }
        })
        if(findOrganizer){
            return res.status(400).json({ errors: {
                email:"Email already taken. please use another one."
            } })
        }

        const salt = bcrypt.genSaltSync(10)
        organizer.password = bcrypt.hashSync(organizer.password, salt)

        const profileImageUrl = req.file ? req.file.path : DEFAULT_PROFILE_IMAGE;

        const organizerDB = await prisma.organisateurs.create({
            data:{
                ...organizer,
                pdProfile: profileImageUrl
            }
        })
        const user = await prisma.users.create({
            data:{
                email:organizer.email,
                password:organizer.password,
                role:"organizer"
            }
        })
        return res.json({status:200 , message:"Organizer created successfully", organizerDB})
        
    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return res.status(400).json({ errors: error.messages })
        }else{
            return res.status(500).json({status:500, message:"Something went wrong;Please try again."})
        }
    }
    
}
// @desc    getAll organize 
// @route   GET /organizer/organizers
//access private admin
export const getAll = async(req,res)=>{
    try {
        const organizers = await prisma.organisateurs.findMany();

        if(organizers.length === 0){
            return res.status (404).json({message: "No organizers register yet."})
        }

        return res.status(200).json({organizers})
    } catch (error) {
        console.error("Error fetching organizers:", error);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again."
        });
    }
    
}
