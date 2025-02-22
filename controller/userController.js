import jwt  from "jsonwebtoken";
import { loginSchema } from "../validations/authValidation.js";
import vine,{errors} from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import nodemailer from 'nodemailer';

// @desc    login user 
// @route   POST /user/auth/login
export const login = async(req,res)=>{
    try {
        const body = req.body
        const validator = vine.compile(loginSchema)
        const user = await validator.validate(body)

        const finduser = await prisma.users.findUnique({
            where:{
                email:user.email
            }
        })
        if(finduser){
            if(!bcrypt.compareSync(user.password, finduser.password)){
                return res.status(400).json({errors:{
                    email:"Invalid Credentials."
                }})
            }
            let Id;
            if(finduser.role === "organizer"){
                const organizer = await prisma.organisateurs.findUnique({
                    where:{email: finduser.email}
                });
                if (organizer) Id = organizer.id;
            }
            if(finduser.role === "admin"){
                const admin = await prisma.admins.findUnique({
                    where:{email: finduser.email}
                });
                if (admin) Id = admin.id;
            }
            if (finduser.role === "prestataire") {
                const prestataire = await prisma.prestataires.findUnique({
                    where: { email: finduser.email }
                });
            
                if (!prestataire) {
                    return res.status(400).json({ errors: { email: "Prestataire not found." } });
                }
            
                if (!prestataire.approoved) {
                    return res.status(403).json({ errors: { message: "Account not approved yet." } });
                }
            
                Id = prestataire.id;
            }
            
            const userData = {
                Id,
                email:finduser.email,
                role:finduser.role
            }
            const token = jwt.sign(userData, process.env.JWT_SECRET,{expiresIn:"356d"})

            return res.json({
                message: "Logged in",
                token,
                user:userData
            })
        }

        return res.status(400).json({errors:{
            email:"No user found with this email."
        }})
    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return res.status(400).json({ errors: error.messages })
        }else{
            return res.status(500).json({status:500, message:"Something went wrong,Please try again."})
        }
    }
}
// @desc    forgetPassword user 
// @route   POST /user/fogetpassword
export const ForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const finduser = await prisma.users.findUnique({
            where: {
                email: email
            }
        });

        if (!finduser) {
            return res.status(404).json({ status: "User not found" });
        }

        let Id;
        if (finduser.role === "organizer") {
            const organizer = await prisma.organisateurs.findUnique({
                where: { email: finduser.email }
            });
            if (organizer) Id = organizer.id;
        }

        if (finduser.role === "admin") {
            const admin = await prisma.admins.findUnique({
                where: { email: finduser.email }
            });
            if (admin) Id = admin.id;
        }

        if (finduser.role === "prestataire") {
            const prestataire = await prisma.prestataires.findUnique({
                where: { email: finduser.email }
            });
            if (prestataire) Id = prestataire.id;
        }

        const token = jwt.sign({ id: Id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: finduser.email, 
            subject: 'Réinitialisation de votre Mot de passe',
            html: `<p>Veuillez cliquer sur le lien suivant pour terminer le processus: <a href="${`http://localhost:3000/reset-password/${Id}/${token}`}">Réinitialiser mon mot de passe</a></p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ status: "Error sending email" });
            } else {
                return res.status(200).json({ status: "Success", message: "Email sent successfully" });
            }
        });

    } catch (error) {
        console.error("Error during forget password process: ", error);
        return res.status(500).json({ status: "Error", message: "Something went wrong. Please try again later." });
    }
};

// @desc    resetPassword user 
// @route   PUT /user/resetPassword
export const resetPassword = async(req,res)=>{
    
}
