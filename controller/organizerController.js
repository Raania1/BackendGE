import prisma from "../DB/db.config.js";
import vine,{errors} from "@vinejs/vine";
import { registerOrganizerSchema, updateOrganizerSchema } from "../validations/authValidation.js";
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
export const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new passwords are required" });
        }

        const organizer = await prisma.organisateurs.findUnique({
            where: { id }
        });

        if (!organizer) {
            return res.status(404).json({ message: "organizer not found" });
        }
        
        const user = await prisma.users.findUnique({
            where: {email: organizer.email}
        })

        if(!user) {
            return res.status(404).json({message: "organizer not found"})
        }

        const isMatch = bcrypt.compareSync(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Votre ancien mot de passe est incorrect" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

        await prisma.organisateurs.update({
            where: { id },
            data: { password: hashedNewPassword }
        });

        await prisma.users.update({
            where: { email: organizer.email },
            data: { password: hashedNewPassword }
        });

        return res.status(200).json({ message: "Mot de passe modifié avec succès." });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
    }
};


// @desc    getAll organize 
// @route   GET /organizer/organizers
//access private admin
export const getAll = async(req,res)=>{
    try {
        const organizers = await prisma.organisateurs.findMany({include: {
            Evennements: true,  
            Reservations: true,
        },})

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
// @desc    updateById organizer
// @route   PUT /organizer/update/:id
//access private organizer (still mofifier)
export const updateById = async(req,res)=>{
    try {
        const {id} =req.params
        const validator = vine.compile(updateOrganizerSchema);
        const validateData = await validator.validate(req.body);
    
        const organizer = await prisma.organisateurs.findUnique({
            where:{id}
        })
        if(!organizer){
            return res.status(404).json({message:"Organisateur not found"})
        }

        let profileImageUrl = organizer.pdProfile;
        if(req.file){
            profileImageUrl = req.file.path;
        }

        const updatedOrganiser = await prisma.organisateurs.update({
            where:{id},
            data:{
                ...validateData,
                pdProfile: profileImageUrl,
            }
        })

        if(validateData.email && validateData.email !== organizer.email){
            await prisma.users.update({
                where:{email: organizer.email},
                data:{email: validateData.email}
            })
        }

        return res.status(200).json({message:"Organier updated successfully",updatedOrganiser});    
    } catch (err) {
        console.error("Error updating organizer and user:", err);
    
        if (err instanceof errors.E_VALIDATION_ERROR) {
          return res.status(400).json({ errors: err.messages });
        }
    
        return res.status(500).json({ message: "Failed to update organizer and user", error: err.message });
      }
}
// @desc    getById organizer 
// @route   GET /organizer/getById/:id
export const getById = async(req,res)=>{
    try {
        const {id} = req.params
        const organizer = await prisma.organisateurs.findUnique({
            where:{id},
            select:{
                id:true,
                nom:true,
                prenom :true,
                email :true,
                password :true,
                numTel:true,
                numCin:true,
                ville:true,
                adress :true,
                pdProfile :true,
                createdAt:true,
                Evennements:true,
                Reservations: true,
            }
        })
        if (!organizer) {
            return res.status(404).json({ message: "Organizer not found" });
        }
        return res.status(200).json({organizer})
    } catch (error) {
        console.error("Error fetching organizer:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
      }
}
// @desc    delete organizer
// @route   delete /organizer/deleteorganizer/:id
//access private organizer admin
export const deleteOrganizer = async (req, res) => {
    try {
        const { id } = req.params;
  
        const organizer = await prisma.organisateurs.findUnique({
            where: { id }
        });
  
        if (!organizer) {
            return res.status(404).json({ message: "Organizer not found" });
        }
        await prisma.users.delete({
            where: { email:organizer.email }
        })
        await prisma.organisateurs.delete({
        where: { id }
    });
  
        return res.status(200).json({ message: "Organizer deleted successfully" });
    } catch (error) {
        console.error("Error deleting organizer:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
    }
};
  
