import prisma from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { validateEvennement , EventUpdate} from "../validations/evennementValidation.js";

export const createEvent = async (req, res) => {
    try {
      const validator = vine.compile(validateEvennement);
      const validatedData = await validator.validate(req.body);
  
      if (validatedData.dateFin <= validatedData.dateDebut) {
        return res.status(400).json({ 
          error: "La date de fin doit être postérieure à la date de début" 
        });
      }
  
      const eventDB = await prisma.evennements.create({
        data: {
          nom: validatedData.nom,
          dateDebut: validatedData.dateDebut,
          dateFin: validatedData.dateFin,
          lieu: validatedData.lieu,
          organisateur: {
            connect: { id: validatedData.organisateurid }
          }
        }
      });
  
      return res.status(201).json({
        status: 201,
        message: "Événement créé avec succès",
        event: eventDB
      });
  
    } catch (error) {
      console.error("Erreur dans createEvent:", error);
      
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(422).json({ 
          error: "Erreur de validation",
          details: error.messages 
        });
      }
      
    }
  };
  export const addServiceToEvent = async (req, res) => {
    try {
        const { eventId, serviceId } = req.body;

        const [existingEvent, existingService] = await Promise.all([
            prisma.evennements.findUnique({ where: { id: eventId } }),
            prisma.services.findUnique({ where: { id: serviceId } })
        ]);

        if (!existingEvent || !existingService) {
            return res.status(404).json({ error: "Événement ou service non trouvé" });
        }

        const priceToAdd = existingService.promo && existingService.promo > 0 
            ? existingService.prix * (1 - existingService.promo / 100) 
            : existingService.prix; 

        const newBudgetTotale = existingEvent.budgetTotale + priceToAdd;

        await prisma.evennements.update({
            where: { id: eventId },
            data: {
                services: {
                    connect: { id: serviceId }
                },
                budgetTotale: newBudgetTotale, 
            }
        });

        return res.status(201).json({
            status: 201,
            message: "Service ajouté avec succès à l'événement",
            finalPrice: priceToAdd
        });

    } catch (error) {
        console.error("Erreur dans addServiceToEvent:", error);
        return res.status(500).json({
            status: 500,
            message: "Une erreur est survenue, veuillez réessayer."
        });
    }
};
export const removeServiceFromEvent = async (req, res) => {
    try {
        const { eventId, serviceId } = req.body;

        const [existingEvent, existingService] = await Promise.all([
            prisma.evennements.findUnique({ where: { id: eventId } }),
            prisma.services.findUnique({ where: { id: serviceId } })
        ]);

        if (!existingEvent || !existingService) {
            return res.status(404).json({ error: "Événement ou service non trouvé" });
        }
        const newBudgetTotale = existingEvent.budgetTotale - existingService.prix;

        await prisma.evennements.update({
            where: { id: eventId },
            data: {
                services: {
                    disconnect: { id: serviceId }
                },
                budgetTotale: newBudgetTotale, 
            }
        });

        return res.status(200).json({
            status: 200,
            message: "Service supprimé avec succès de l'événement"
        });

    } catch (error) {
        console.error("Erreur dans removeServiceFromEvent:", error);
        return res.status(500).json({
            status: 500,
            message: "Une erreur est survenue, veuillez réessayer."
        });
    }
};
export const getEventById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const event = await prisma.evennements.findUnique({
        where: {
          id: id},
          select:{
            id:true,
            nom:true,
            dateDebut :true,
            dateFin :true,
            lieu :true,
            budgetTotale:true,
            organisateur:true,
            services:true
        }
      });
  
      if (!event) {
        return res.status(404).json({ status: 404, message: "Event not found" });
      }
  
      return res.json({ status: 200, event });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Something went wrong; Please try again." });
    }
};
export const getAllEventsWithServices = async (req, res) => {
    try {
        const events = await prisma.evennements.findMany({
            include: {
                services: true,  
            },
        });

        if (!events || events.length === 0) {
            return res.status(404).json({
                error: "Aucun événement trouvé",
            });
        }

        return res.status(200).json({
            status: 200,
            events,  
        });

    } catch (error) {
        console.error("Erreur dans getAllEventsWithServices:", error);
        return res.status(500).json({
            status: 500,
            message: "Une erreur est survenue, veuillez réessayer.",
        });
    }
};
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;  

        const existingEvent = await prisma.evennements.findUnique({
            where: { id },  
        });

        if (!existingEvent) {
            return res.status(404).json({
                error: "Événement non trouvé",  
            });
        }

        await prisma.evennements.delete({
            where: { id },  
        });

        return res.status(200).json({
            status: 200,
            message: "Événement supprimé avec succès",  
        });

    } catch (error) {
        console.error("Erreur dans deleteEvent:", error);  
        return res.status(500).json({
            status: 500,
            message: "Une erreur est survenue, veuillez réessayer.",  
        });
    }
};
export const filterEvents = async (req, res) => {
    try {
        const { nom } = req.query; 

        let filters = {};

        if (nom) {
            filters.nom = { contains: nom, mode: 'insensitive' }; 
        }
      
        

        const events = await prisma.evennements.findMany({
            where: filters,
        });
        if (events.length ===0){
            return res.status(200).json({ message:"No event with this name" });

        }
        return res.status(200).json({ events });

    } catch (error) {
        console.error("Erreur lors du filtrage des evennements :", error);
        return res.status(500).json({ message: "Erreur serveur lors du filtrage des evennements." });
    }
};
export const updateEvent = async(req,res)=>{
    try {
        const {id} =req.params
        const validator = vine.compile(EventUpdate);
        const validateData = await validator.validate(req.body);
    
        const event = await prisma.evennements.findUnique({
            where:{id}
        })

        if(!event){
            return res.status(404).json({message:"Event not found"})
        }

        
        const updatedEvent = await prisma.evennements.update({
            where:{id},
            data:{
                ...validateData,
            }
        })

    
        return res.status(200).json({message:"Event updated successfully",updatedEvent});  

    } catch (err) {
        console.error("Error updating Event:", err);
    
        if (err instanceof errors.E_VALIDATION_ERROR) {
          return res.status(400).json({ errors: err.messages });
        }
    
        return res.status(500).json({ message: "Failed to update  Event", error: err.message });
      }
}

