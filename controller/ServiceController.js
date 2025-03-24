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

