import prisma from "../DB/db.config.js";
import vine,{errors} from "@vinejs/vine";
import { registerPrestataireSchema, updatePrestataireSchema } from "../validations/authValidation.js";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import { Status } from '@prisma/client';

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
            console.error("Erreur interne du serveur :", error); 
res.status(500).send(error)
        }
    } 
}
// @desc    getAll NotProvided 
// @route   GET /prestataire/notProovided
//access private admin
export const getAllNotProovided = async (req, res) => {
    try {
        const prestataires = await prisma.prestataires.findMany({
            where: { Status: Status.PENDING }
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
export const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new passwords are required" });
        }

        const pres = await prisma.prestataires.findUnique({
            where: { id }
        });

        if (!pres) {
            return res.status(404).json({ message: "prestataire not found" });
        }
        
        const user = await prisma.users.findUnique({
            where: {email: pres.email}
        })

        if(!user) {
            return res.status(404).json({message: "prestataire not found"})
        }

        const isMatch = bcrypt.compareSync(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Votre ancien mot de passe est incorrect" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

        await prisma.prestataires.update({
            where: { id },
            data: { password: hashedNewPassword }
        });

        await prisma.users.update({
            where: { email: pres.email },
            data: { password: hashedNewPassword }
        });

        return res.status(200).json({ message: "Mot de passe modifié avec succès." });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Something went wrong, please try again." });
    }
};

// @desc     Accept prestataire
// @route   PUT /prestataire/approovedPrestataire/:prestataireId
//access private admin
export const approvePrestataire = async (req, res) => {
    try {
        const { prestataireId } = req.params;

        const prestataire = await prisma.prestataires.findUnique({
            where: { id: prestataireId }
        });

        if (!prestataire) {
            return res.status(404).json({ error: "Prestataire not found." });
        }

        const updatedPrestataire = await prisma.prestataires.update({
            where: { id: prestataireId },
            data: { Status: 'CONFIRMED' }
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
            html: `<p>Bonjour ${prestataire.prenom},</p>
                   <p>Votre compte prestataire a été validé avec succès. Veuillez cliquer sur le lien suivant pour vous connecter :</p>
                   <a href="http://localhost:4200/connexion">Se Connecter</a>`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ message: "Prestataire approved successfully." });

    } catch (error) {
        console.error("Error during approval process: ", error);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};

// @desc    Refuse prestataire
// @route   DELETE /prestataire/refusePrestataire/:prestataireId
//access private admin
export const refusePrestataire = async (req, res) => {
    try {
        const { prestataireId } = req.params;

        const prestataire = await prisma.prestataires.findUnique({
            where: { id: prestataireId }
        });

        if (!prestataire) {
            return res.status(404).json({ error: "Prestataire not found." });
        }

        if (prestataire.Status !== 'PENDING') {
            return res.status(400).json({ error: "Can only refuse prestataires with PENDING status." });
        }

        // Delete associated user
        await prisma.users.deleteMany({
            where: { email: prestataire.email }
        });

        // Delete the prestataire
        await prisma.prestataires.delete({
            where: { id: prestataireId }
        });

        // Set up email transporter
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

        // Send refusal email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: prestataire.email,
            subject: 'Refus de votre demande de compte Prestataire - FLESK EVENT',
            html: `<p>Bonjour ${prestataire.prenom},</p>
                   <p>Nous vous remercions pour votre intérêt à rejoindre FLESK EVENT en tant que prestataire.</p>
                   <p>Malheureusement, après examen de votre demande, nous ne sommes pas en mesure de valider votre compte prestataire pour le moment.</p>
                   <p>Pour toute question ou pour plus d'informations, n'hésitez pas à nous contacter.</p>
                   <p>Cordialement,</p>
                   <p>L'équipe FLESK EVENT</p>`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ message: "Prestataire refused and deleted successfully." });

    } catch (error) {
        console.error("Error during refusal process: ", error);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};
// @desc    Désactiver un prestataire
// @route   PUT /prestataire/disable/:id
// @access  private admin
export const disablePrestataire = async (req, res) => {
    try {
        const id = req.params.prestataireId;

        const prestataire = await prisma.prestataires.findUnique({
            where: { id: id }
        });

        if (!prestataire) {
            return res.status(404).json({ message: "Prestataire not found" });
        }

        if (prestataire.Status === 'DISABLED') {
            return res.status(400).json({ message: "Prestataire is already disabled." });
        }

        const updated = await prisma.prestataires.update({
            where: { id: id },
            data: { Status: 'DISABLED' }
        });

        return res.status(200).json({
            message: "Prestataire has been disabled successfully.",
            prestataire: updated
        });

    } catch (error) {
        console.error("Error disabling prestataire:", error);
        return res.status(500).json({ message: "An error occurred. Please try again." });
    }
};


export const ActivPrestataire = async (req, res) => {
    try {
        const id = req.params.prestataireId;

        const prestataire = await prisma.prestataires.findUnique({
            where: { id: id }
        });

        if (!prestataire) {
            return res.status(404).json({ message: "Prestataire not found" });
        }

        if (prestataire.Status === 'CONFIRMED') {
            return res.status(400).json({ message: "Prestataire is already disabled." });
        }

        const updated = await prisma.prestataires.update({
            where: { id: id },
            data: { Status: 'CONFIRMED' }
        });

        return res.status(200).json({
            message: "Prestataire has been Activate successfully.",
            prestataire: updated
        });

    } catch (error) {
        console.error("Error activate prestataire:", error);
        return res.status(500).json({ message: "An error occurred. Please try again." });
    }
};

// @desc    getAll prestataire 
// @route   GET /prestataire/prestataires
export const getAll = async(req,res)=>{
    try {
        const pres = await prisma.prestataires.findMany({
            include: {
                Services: true,  
            },
        });

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
            include:{
                Services:true,
                Comments:true,
                Ratings:true,
                Pack: {
                    include: {
                        services: true,
                        PublicitePack:true,
                    }
                }
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
  
      const prestataire = await prisma.prestataires.findUnique({
        where: { id }
      });
  
      if (!prestataire) {
        return res.status(404).json({ message: "Prestataire not found" });
      }
  
      await prisma.contrats.deleteMany({
        where: {
          Payment: {
            reservation: {
              Service: {
                Prestataireid: id
              }
            }
          }
        }
      });
  
      await prisma.payment.deleteMany({
        where: {
          reservation: {
            Service: {
              Prestataireid: id
            }
          }
        }
      });
  
      await prisma.reservations.deleteMany({
        where: {
          Service: {
            Prestataireid: id
          }
        }
      });
  
      const services = await prisma.services.findMany({
        where: { Prestataireid: id },
        select: { id: true }
      });
  
      for (const service of services) {
        const relatedEvennements = await prisma.evennements.findMany({
          where: {
            services: {
              some: { id: service.id }
            }
          },
          select: { id: true }
        });
  
        for (const event of relatedEvennements) {
          await prisma.evennements.update({
            where: { id: event.id },
            data: {
              services: {
                disconnect: { id: service.id }
              }
            }
          });
        }
      }
  
      await prisma.services.deleteMany({
        where: { Prestataireid: id }
      });
  
      await prisma.comments.deleteMany({
        where: { prestataireid: id }
      });
  
      await prisma.contrats.deleteMany({
        where: { prestataireid: id }
      });
  
      await prisma.ratings.deleteMany({
        where: { prestataireid: id }
      });
  
      await prisma.users.deleteMany({
        where: { email: prestataire.email }
      });
  
      await prisma.prestataires.delete({
        where: { id }
      });
  
      return res.status(200).json({ message: "Prestataire and all related data deleted successfully" });
  
    } catch (error) {
      console.error("Error deleting prestataire:", error);
      return res.status(500).json({ message: "Something went wrong, please try again." });
    }
  };

export const getTopPrestataires = async (req, res) => {
    try {
        const pres = await prisma.prestataires.findMany({
            orderBy: {
                averageRating: 'asc',  
            },
            take: 10, 
            include: {
                Services: true,
            },
        });

        if (pres.length === 0) {
            return res.status(404).json({ message: "No prestataires register yet." });
        }

        return res.status(200).json({ pres });
    } catch (error) {
        console.error("Error fetching prestataires:", error);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again."
        });
    }
}

  
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
    
        return res.status(500).json({ message: "Failed to update Prestataire and user", error: err.message });
      }
}

export const getServicePhotosByPrestataire = async (req, res) => {
    try {
        const { id } = req.params; 

        const services = await prisma.services.findMany({
            where: { 
                Prestataireid: id,
                Status: 'CONFIRMED'
            },
            select: {
                photoCouverture: true,
                Photos: true
            }
        });

        const allPhotoUrls = [];
        
        services.forEach(service => {
            if (service.photoCouverture) {
                allPhotoUrls.push(service.photoCouverture);
            }
            
            if (service.Photos && service.Photos.length > 0) {
                allPhotoUrls.push(...service.Photos);
            }
        });

        if (allPhotoUrls.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Aucune photo trouvée pour ce prestataire"
            });
        }

        return res.status(200).json({
            status: 200,
            prestataireId: id,
            totalPhotos: allPhotoUrls.length,
            photos: allPhotoUrls 
        });

    } catch (error) {
        console.error("Error fetching service photos:", error);
        return res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des photos"
        });
    }
};


// export const getAllP = async (req, res) => {
//     try {
//         const { travail, page = 1, limit = 10 } = req.query;
//         const pageNumber = parseInt(page);
//         const limitNumber = parseInt(limit);
        
//         // Validation des paramètres
//         if (isNaN(pageNumber) ){
//             return res.status(400).json({ message: "Le paramètre 'page' doit être un nombre" });
//         }
        
//         if (isNaN(limitNumber)) {
//             return res.status(400).json({ message: "Le paramètre 'limit' doit être un nombre" });
//         }

//         const whereClause = travail ? { 
//             travail: {
//                 equals: travail,
//                 mode: 'insensitive'
//             } 
//         } : {};

//         // Requête avec pagination
//         const [pres, totalCount] = await Promise.all([
//             prisma.prestataires.findMany({
//                 where: whereClause,
//                 include: { Services: true },
//                 skip: (pageNumber - 1) * limitNumber,
//                 take: limitNumber,
//                 orderBy: { createdAt: 'desc' } // Tri par date de création
//             }),
//             prisma.prestataires.count({ where: whereClause })
//         ]);

//         if (pres.length === 0) {
//             return res.status(404).json({
//                 message: travail 
//                     ? `Aucun prestataire trouvé pour le travail: ${travail}`
//                     : "Aucun prestataire enregistré pour le moment."
//             });
//         }

//         return res.status(200).json({ 
//             data: pres,
//             pagination: {
//                 total: totalCount,
//                 totalPages: Math.ceil(totalCount / limitNumber),
//                 currentPage: pageNumber,
//                 perPage: limitNumber,
//                 hasNextPage: pageNumber * limitNumber < totalCount,
//                 hasPreviousPage: pageNumber > 1
//             }
//         });
//     } catch (error) {
//         console.error("Erreur lors de la récupération des prestataires:", error);
//         return res.status(500).json({
//             status: 500,
//             message: "Une erreur est survenue. Veuillez réessayer."
//         });
//     }
// };
export const getAllP = async (req, res) => {
    try {
        const { travail, nom, prenom, ville, page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        if (isNaN(pageNumber)) {
            return res.status(400).json({ message: "Le paramètre 'page' doit être un nombre" });
        }

        if (isNaN(limitNumber)) {
            return res.status(400).json({ message: "Le paramètre 'limit' doit être un nombre" });
        }

        const whereClause = {
            Status: 'CONFIRMED' 
        };

        if (travail) {
            whereClause.travail = {
                equals: travail,
                mode: 'insensitive'
            };
        }

        if (nom) {
            whereClause.nom = {
                contains: nom,
                mode: 'insensitive'
            };
        }

        if (prenom) {
            whereClause.prenom = {
                contains: prenom,
                mode: 'insensitive'
            };
        }

        if (ville) {
            whereClause.ville = {
                contains: ville,
                mode: 'insensitive'
            };
        }

        const [pres, totalCount] = await Promise.all([
            prisma.prestataires.findMany({
                where: whereClause,
                include: { Services: true },
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.prestataires.count({ where: whereClause })
        ]);

        if (pres.length === 0) {
            const filters = [];
            if (travail) filters.push(`travail: ${travail}`);
            if (nom) filters.push(`nom: ${nom}`);
            if (prenom) filters.push(`prénom: ${prenom}`);
            if (ville) filters.push(`ville: ${ville}`);

            const filterMessage = filters.length > 0 
                ? `avec les filtres: ${filters.join(', ')}` 
                : "";

            return res.status(404).json({
                message: filters.length > 0
                    ? `Aucun prestataire trouvé ${filterMessage}`
                    : "Aucun prestataire enregistré pour le moment."
            });
        }

        return res.status(200).json({
            data: pres,
            pagination: {
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNumber),
                currentPage: pageNumber,
                perPage: limitNumber,
                hasNextPage: pageNumber * limitNumber < totalCount,
                hasPreviousPage: pageNumber > 1
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des prestataires:", error);
        return res.status(500).json({
            status: 500,
            message: "Une erreur est survenue. Veuillez réessayer."
        });
    }
};


