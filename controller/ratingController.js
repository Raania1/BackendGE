import prisma from "../DB/db.config.js";

export const createRating = async(req,res) =>{
    
    try{
        const {organisateurid, prestataireid, rating} = req.body;
        
        if (!Number.isInteger(rating) || rating <1 || rating>5 ){
            return res.status(400).json({error: "Il faut le rating soit entre 1 et 5"});
        }

        const organisateur = await prisma.organisateurs.findUnique({
            where: {
                id: organisateurid
            }
        })
        const prestataire = await prisma.prestataires.findUnique({
            where:{id : prestataireid}
        })
        if (!organisateur || !prestataire){
            return res.status(404).json({error: "Organisateur or prestataire introuvé"})
        }

        const newRating = await prisma.ratings.upsert({
            where:{
                organisateurid_prestataireid: {organisateurid, prestataireid}
            },
            update: {rating},
            create: {organisateurid , prestataireid, rating},
        })

        const ratings = await prisma.ratings.findMany({
            where:{
                prestataireid: prestataireid
            }
        })
        const averageRating = ratings.reduce((sum, r)=> sum + r.rating, 0) / ratings.length || 0;
        await prisma.prestataires.update({
            where:{id:prestataireid},
            data:{averageRating: averageRating}
        })
        res.status(201).json(newRating);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Something went wrong, please try again." })
    }
}
export const getRatingByPrestataire = async (req,res)=>{
    try{
        const {prestataireid} = req.params;
        const ratings = await prisma.ratings.findMany({
            where:{prestataireid: prestataireid},
            include:{Organisateur:{select: {nom:true, prenom:true}}}
        })
        res.status(200).json(ratings);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Something went wrong, please try again."})
    }
}