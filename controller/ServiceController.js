import prisma from "../DB/db.config.js";
import vine ,{errors} from "@vinejs/vine";
import {ServiceSchema,ServiceUpdate} from "../validations/serviceValidation.js"

export const createService = async(req,res)=>{
    try{
        const body = req.body;
        const validator = vine.compile(ServiceSchema)
        const service = await validator.validate(body)

        const couvertureImgUrl = req.files.photoCouverture ? req.files.photoCouverture[0].path : null;
        const photosUlrs = req.files.Photos ? req.files.Photos.map(file => file.path) : [];

        const serviceDB = await prisma.services.create({
            data:{
                ...service,
                photoCouverture : couvertureImgUrl,
                Photos : photosUlrs,
            }
        })
        return res.json({status:200, message:"Service created successfully",service: serviceDB})
    }catch(error){
        if (error instanceof errors.E_VALIDATION_ERROR) {
            console.log(req.files);

            return res.status(400).json({ errors: error.messages });
        }else{
            return res.status(500).json({status:500, message:"Something went wrong;Please try again."})
        }
    }
}
export const getAllNotProovided = async (req, res) => {
    try {
        const services = await prisma.services.findMany({
            where: { approoved: false }
        });

        if (services.length === 0) {
            return res.status(404).json({ message: "No service waiting for approval." });
        }

        return res.status(200).json({ services });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again."
        });
    }
};
export const approovedService = async (req, res) => {
    try {
        const { serviceId } = req.params; 
        const { approoved } = req.body;

        const service = await prisma.services.findUnique({
            where: { id: serviceId }
        });
        if (!service){
            return res.json({message: "Service not found."});

        }else{
            const updatedservice = await prisma.services.update({
                where: { id: serviceId },
                data: { approoved }
            });
            return res.json({message: "Service approved successfully.",updatedservice});

        }
    } catch (error) {
        console.error("Error during approval process: ", error);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};
export const getAllServices = async (req, res) => {
    try {
      const services = await prisma.services.findMany();
      return res.json({ status: 200, services });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Something went wrong; Please try again." });
    }
};
export const getServicesP = async (req, res) => {
  try {
    const services = await prisma.services.findMany({
      where: {
        approoved: true 
      }
    });      return res.json({ status: 200, services });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Something went wrong; Please try again." });
  }
};
export const getServiceById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const service = await prisma.services.findUnique({
        where: {
          id: id,
        }
      });
  
      if (!service) {
        return res.status(404).json({ status: 404, message: "Service not found" });
      }
  
      return res.json({ status: 200, service });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Something went wrong; Please try again." });
    }
};
export const deleteService = async (req, res) => {
    try {
      const { id } = req.params;
  
      const existingService = await prisma.services.findUnique({
        where: { id }
      });
  
      if (!existingService) {
        return res.status(404).json({ status: 404, message: "Service not found" });
      }
  
      await prisma.services.delete({
        where: { id }
      });
  
      return res.json({ status: 200, message: "Service deleted successfully" });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Something went wrong; Please try again." });
    }
};
export const updateServiceWithoutPhotos = async(req,res)=>{
    try {
        const {id} =req.params
        const validator = vine.compile(ServiceUpdate);
        const validateData = await validator.validate(req.body);
    
        const service = await prisma.services.findUnique({
            where:{id}
        })

        if(!service){
            return res.status(404).json({message:"Service not found"})
        }

        let ImageUrl = service.photoCouverture;
        if(req.file){
            ImageUrl = req.file.path;
        }
        
        const updatedService = await prisma.services.update({
            where:{id},
            data:{
                ...validateData,
                photoCouverture: ImageUrl,           
            }
        })

    
        return res.status(200).json({message:"Service updated successfully",updatedService});  

    } catch (err) {
        console.error("Error updating Service:", err);
    
        if (err instanceof errors.E_VALIDATION_ERROR) {
          return res.status(400).json({ errors: err.messages });
        }
    
        return res.status(500).json({ message: "Failed to update  Service", error: err.message });
      }
}
export const deletePhotoByIndex = async (req, res) => {
    try {
        const { serviceId, photoIndex } = req.params;  
        const index = parseInt(photoIndex);  

        const service = await prisma.services.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (!service.Photos || index < 0 || index >= service.Photos.length) {
            return res.status(400).json({ message: "Invalid photo index" });
        }

        const photoUrl = service.Photos[index];

        const updatedPhotos = [...service.Photos];
        updatedPhotos.splice(index, 1);  

        const updatedService = await prisma.services.update({
            where: { id: serviceId },
            data: {
                Photos: updatedPhotos
            }
        });

        return res.status(200).json({ message: "Photo deleted successfully", updatedService });

    } catch (error) {
        console.error("Error deleting photo from service:", error);
        return res.status(500).json({ message: "Failed to delete photo", error: error.message });
    }
};
export const addPhotosToService = async (req, res) => {
    try {
        const { serviceId } = req.params;  

        const service = await prisma.services.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const newPhotos = req.files.Photos ? req.files.Photos.map(file => file.path) : [];
        
        const totalPhotos = service.Photos.length + newPhotos.length;

        if (totalPhotos > 30) {
            return res.status(400).json({ message: "Cannot add more than 30 photos to a service." });
        }

        const updatedPhotos = [...service.Photos, ...newPhotos]; 

        const updatedService = await prisma.services.update({
            where: { id: serviceId },
            data: {
                Photos: updatedPhotos
            }
        });

        return res.status(200).json({ message: "Photos added successfully", updatedService });

    } catch (error) {
        console.error("Error adding photos to service:", error);
        return res.status(500).json({ message: "Failed to add photos", error: error.message });
    }
};
export const updateServicePhotos = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const service = await prisma.services.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const newPhotos = req.files.Photos ? req.files.Photos.map(file => file.path) : [];

        const totalPhotos = newPhotos.length;

        if (totalPhotos > 30) {
            return res.status(400).json({ message: "Cannot add more than 30 photos to a service." });
        }

        const deletedService = await prisma.services.update({
            where: { id: serviceId },
            data: {
                Photos: [] 
            }
        });

        const updatedService = await prisma.services.update({
            where: { id: serviceId },
            data: {
                Photos: newPhotos 
            }
        });

        return res.status(200).json({ message: "Service photos updated successfully", updatedService });

    } catch (error) {
        console.error("Error updating photos for service:", error);
        return res.status(500).json({ message: "Failed to update photos", error: error.message });
    }
};
export const filterServices = async (req, res) => {
  try {
      const { type, approoved } = req.query;

      let filters = {};

      if (type) {
          filters.type = { equals: type, mode: 'insensitive' };
      }
      
      if (approoved !== undefined) {
          filters.approoved = approoved === 'true';
      }

      const services = await prisma.services.findMany({
          where: filters,
          orderBy: { prix: 'asc' }
      });

      return res.status(200).json({ 
          success: true,
          count: services.length,
          data: services
      });

  } catch (error) {
      console.error("Erreur lors du filtrage des services :", error);
      return res.status(500).json({ 
          success: false,
          message: "Erreur serveur lors du filtrage des services.",
          error: error.message 
      });
  }
};
export const getAllServicesP = async (req, res) => {
    // try {
    //     const { page = '1', limit = '10' } = req.query; 
    //     const pageNumber = parseInt(page);
    //     const limitNumber = parseInt(limit);
    //     const MAX_LIMIT = 100;
        
    //     if (isNaN(pageNumber) || isNaN(limitNumber) || 
    //         pageNumber <= 0 || limitNumber <= 0 ||
    //         limitNumber > MAX_LIMIT) {
    //         return res.status(400).json({ 
    //             message: `Page must be a positive number and limit must be a positive number not exceeding ${MAX_LIMIT}.` 
    //         });
    //     }

    //     const [totalServices, services] = await Promise.all([
    //         prisma.services.count(),
    //         prisma.services.findMany({
    //             skip: (pageNumber - 1) * limitNumber, 
    //             take: limitNumber,
    //             orderBy: { createdAt: "desc" }
    //         })
    //     ]);

    //     return res.status(200).json({
    //         total: totalServices,
    //         totalPages: Math.ceil(totalServices / limitNumber),
    //         currentPage: pageNumber,
    //         services
    //     });

    // } catch (error) {
    //     console.error("Error fetching services:", error);
    //     return res.status(500).json({ 
    //         message: "Erreur lors de la récupération des services.", 
    //         error: error.message 
    //     });
    // }
};
export const getServicesByTypeP = async (req, res) => {
    // try {
    //     const { type, prixMin = 0, prixMax = 1000000 , page = 1, limit = 15 } = req.query; 

    //     if (!type) {
    //         return res.status(400).json({ message: "Le type est requis pour filtrer les services." });
    //     }

    //     const pageNumber = parseInt(page);
    //     const limitNumber = parseInt(limit);
    //     const minPrice = parseFloat(prixMin);
    //     const maxPrice = parseFloat(prixMax);

    //     if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
    //         return res.status(400).json({ message: "Page et limit doivent être des nombres positifs." });
    //     }
    //     if (isNaN(minPrice) || isNaN(maxPrice)) {
    //         return res.status(400).json({ message: "Les valeurs de prix doivent être des nombres valides." });
    //     }

    //     const totalServices = await prisma.services.count({
    //         where: {
    //             type: type, 
    //             prix: {
    //                 gte: minPrice,  // Prix minimum
    //                 lte: maxPrice,  // Prix maximum
    //             }
    //         }
    //     });

    //     const services = await prisma.services.findMany({
    //         where: {
    //             type: type, 
    //             prix: {
    //                 gte: minPrice,  // Prix minimum
    //                 lte: maxPrice,  // Prix maximum
    //             }
    //         },
    //         skip: (pageNumber - 1) * limitNumber, 
    //         take: limitNumber,
    //         orderBy: {
    //             createdAt: 'desc', 
    //         }
    //     });

    //     return res.status(200).json({
    //         total: totalServices, 
    //         totalPages: Math.ceil(totalServices / limitNumber), 
    //         currentPage: pageNumber,
    //         services 
    //     });

    // } catch (error) {
    //     console.error("Erreur lors de la récupération des services par type :", error);
    //     return res.status(500).json({ message: "Erreur lors de la récupération des services.", error: error.message });
    // }
};
export const getServices = async (req, res) => {
    try {
      const {
        type,
        minPrice  = 0,
        maxPrice = 10000,
        hasPromo = false,
        searchQuery = "",
        sortBy = "newest",
        page = 1,
        limit = 15,
      } = req.query
  
      const pageNumber = Number.parseInt(page)
      const limitNumber = Number.parseInt(limit)
      const MinPrice = Number.parseFloat(minPrice)
      const MaxPrice = Number.parseFloat(maxPrice)
      const showPromoOnly = hasPromo === "true" || hasPromo === true;  
      // Validation des paramètres
      if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
        return res.status(400).json({ message: "Page et limit doivent être des nombres positifs." })
      }
      if (isNaN(MinPrice) || isNaN(MaxPrice)) {
        return res.status(400).json({ message: "Les valeurs de prix doivent être des nombres valides." })
      }
  
      // Construction du filtre de base
      const whereClause = {
        prix: {
          gte: MinPrice,
          lte: MaxPrice,
        },
        approoved: true, // Assurez-vous que seuls les services approuvés sont affichés
      }
  
      // Ajouter le filtre de type si spécifié
      if (type && type !== "") {
        whereClause.type = type
      }
      // Ajouter le filtre de promotion si demandé
      if (showPromoOnly) {
        whereClause.promo = {
          gt: 0,
        }
      }
  
      // Ajouter la recherche textuelle si spécifiée
      if (searchQuery && searchQuery !== "") {
        whereClause.OR = [
          {
            nom: {
              contains: searchQuery,
              mode: "insensitive", // Recherche insensible à la casse
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        ]
      }
  
      // Déterminer l'ordre de tri
      let orderBy = {}
      switch (sortBy) {
        case "price-asc":
          orderBy = { prix: "asc" }
          break
        case "price-desc":
          orderBy = { prix: "desc" }
          break
        case "promo-desc":
          orderBy = { promo: "desc" }
          break
        case "newest":
        default:
          orderBy = { createdAt: "desc" }
          break
      }
  
      // Compter le nombre total de services correspondant aux critères
      const totalServices = await prisma.services.count({
        where: whereClause,
      })
  
      // Récupérer les services avec pagination
      const services = await prisma.services.findMany({
        where: whereClause,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: orderBy,
        include: {
          Prestataire: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
      })
  
      return res.status(200).json({
        total: totalServices,
        totalPages: Math.ceil(totalServices / limitNumber),
        currentPage: pageNumber,
        services,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des services:", error)
      return res.status(500).json({ message: "Erreur lors de la récupération des services.", error: error.message })
    }
  }
  
  




