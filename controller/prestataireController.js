import prisma from "../DB/db.config.js";
import vine,{errors} from "@vinejs/vine";
import { registerPrestataireSchema, updatePrestataireSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';

const DEFAULT_PROFILE_IMAGE = "https://th.bing.com/th/id/OIP.lvzPu-WOW4Iv7QyjP-IkrgHaHa?rs=1&pid=ImgDetMain";
// @desc    register prestataire 
// @route   POST /prestataire/auth/register
export const register = async(req,res)=>{
    try {
        
        const body = req.body;
        const validator = vine.compile(registerPrestataireSchema)
        const pres = await validator.validate(body)

        const findpres = await prisma.prestataires.findUnique({
            where:{
                email:pres.email
            }
        })
        if(findpres){
            return res.status(400).json({ errors: {
                email:"Email already taken. please use another one."
            } })
        }
        const salt = bcrypt.genSaltSync(10)
        pres.password = bcrypt.hashSync(pres.password, salt)

        const profileImageUrl = req.files.pdProfile ? req.files.pdProfile[0].path : DEFAULT_PROFILE_IMAGE;
        const fileUrls = req.files.fichierConfirmation ? req.files.fichierConfirmation.map(file => file.path) : [];

        const presDB = await prisma.prestataires.create({
            data:{
                ...pres,
                pdProfile: profileImageUrl,
                fichierConfirmation: fileUrls,
            }
        })
        const user = await prisma.users.create({
            data:{
                email:pres.email,
                password:pres.password,
                role:"prestataire"
            }
        })
        return res.json({status:200 , message:"Prestataire created successfully", presDB})
        
    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return res.status(400).json({ errors: error.messages })
        }else{
            return res.status(500).json({status:500, message:"Something went wrong;Please try again."})
        }
    } 
}
// @desc    getAll NotProvided 
// @route   GET /prestataire/notProovided
//access private admin
export const getAllNotProovided = async (req, res) => {
    try {
        const prestataires = await prisma.prestataires.findMany({
            where: { approoved: false }
        });

        if (prestataires.length === 0) {
            return res.status(404).json({ message: "No prestataire waiting for approval." });
        }

        return res.status(200).json({ prestataires });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again."
        });
    }
};
// @desc     Accept prestataire
// @route   PUT /prestataire/approovedPrestataire/:prestataireId
//access private admin
export const approovedPrestataire = async (req, res) => {
    try {
        const { prestataireId } = req.params; 
        const { approoved } = req.body;

        const prestataire = await prisma.prestataires.findUnique({
            where: { id: prestataireId }
        });

        const updatedPrestataire = await prisma.prestataires.update({
            where: { id: prestataireId },
            data: { approoved }
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,  
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false,  
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,  
            to: prestataire.email,  
            subject: 'Validation du Compte Prestataire Pour FLESK EVENT',
            html: `<p>Bonjour,</p>
                   <p>Votre compte prestataire a été validé avec succès. Veuillez cliquer sur le lien suivant pour vous connecter :</p>
                   <a href="http://localhost:4200/connexion">Se Connecter</a>`
        };

        await transporter.sendMail(mailOptions);

        return res.json({message: "Prestataire approved successfully."});

    } catch (error) {
        console.error("Error during approval process: ", error);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};
// @desc    getAll prestataire 
// @route   GET /prestataire/prestataires
export const getAll = async(req,res)=>{
    try {
        const pres = await prisma.prestataires.findMany();

        if(pres.length === 0){
            return res.status (404).json({message: "No prestataires register yet."})
        }

        return res.status(200).json({pres})
    } catch (error) {
        console.error("Error fetching prestataires:", error);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again."
        });
    }
    
}
// @desc    getById prestataire 
// @route   GET /prestataire/getById/:id
export const getById = async(req,res)=>{
    try {
        const {id} = req.params
        const pres = await prisma.prestataires.findUnique({
            where:{id},
            select:{
                id: true,
                nom: true,
                prenom: true,
                email: true,
                travail:true,
                description:true,
                numTel:true,
                numCin:true,
                ville:true,
                adress:true,
                pdProfile: true,
                createdAt:true,
            }
        })
        if (!pres) {
            return res.status(404).json({ message: "Prestataire not found" });
        }
        return res.status(200).json({pres})
    } catch (error) {
        console.error("Error fetching prestataire:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
      }
}
// @desc    delete prestataire
// @route   delete /prestataire/deleteprestataire/:id
//access private prestataire admin
export const deletePrestataire = async (req, res) => {
    try {
        const { id } = req.params;
  
        const pres = await prisma.prestataires.findUnique({
            where: { id }
        });
  
        if (!pres) {
            return res.status(404).json({ message: "Prestataire not found" });
        }
        await prisma.users.delete({
            where: { email:pres.email }
        })
        await prisma.prestataires.delete({
        where: { id }
    });
  
        return res.status(200).json({ message: "Prestataire deleted successfully" });
    } catch (error) {
        console.error("Error deleting prestataire:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
    }
  };
// @desc    updateById prestataire
// @route   PUT /prestataire/update/:id
//access private prestataire (still mofifier)
export const updateById = async(req,res)=>{
    try {
        const {id} =req.params
        const validator = vine.compile(updatePrestataireSchema);
        const validateData = await validator.validate(req.body);
    
        const pres = await prisma.prestataires.findUnique({
            where:{id}
        })
        if(!pres){
            return res.status(404).json({message:"Prestataire not found"})
        }

        let profileImageUrl = pres.pdProfile;
        if(req.file){
            profileImageUrl = req.file.path;
        }
        
        const updatedPrestataire = await prisma.prestataires.update({
            where:{id},
            data:{
                ...validateData,
                pdProfile: profileImageUrl,            }
        })

        if(validateData.email && validateData.email !== pres.email){
            await prisma.users.update({
                where:{email: pres.email},
                data:{email: validateData.email}
            })
        }

        return res.status(200).json({message:"Prestataire updated successfully",updatedPrestataire});    
    } catch (err) {
        console.error("Error updating prestataire and user:", err);
    
        if (err instanceof errors.E_VALIDATION_ERROR) {
          return res.status(400).json({ errors: err.messages });
        }
    
        return res.status(500).json({ message: "Failed to update organizer and user", error: err.message });
      }
}


