import prisma from "../DB/db.config.js";

const DEFAULT_PROFILE_IMAGE = "https://th.bing.com/th/id/OIP.lvzPu-WOW4Iv7QyjP-IkrgHaHa?rs=1&pid=ImgDetMain";

export const createPack = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      promo,
      services,prestataireid
    } = req.body;

    const couvertureImgUrl = req.file ? req.file.path : DEFAULT_PROFILE_IMAGE;

    if (!title || !description || !price || !services || !prestataireid) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
    if (!Array.isArray(parsedServices) || parsedServices.length < 2) {
  return res.status(400).json({ message: 'Vous devez fournir au moins deux services.' });
}

    const newPack = await prisma.pack.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        promo: promo ? parseFloat(promo) : null,
        coverPhotoUrl: couvertureImgUrl, 
        prestataireid : prestataireid, 
        services: {
          create: parsedServices.map((service) => ({
            name: service.name,
            description: service.description
          }))
        }
      },
      include: {
        services: true
      }
    });

    return res.status(201).json(newPack);
  } catch (error) {
    console.error('Erreur création pack:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updatePack = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      promo
    } = req.body;

    const couvertureImgUrl = req.file ? req.file.path : undefined;

    const existingPack = await prisma.pack.findUnique({
      where: { id }
    });

    if (!existingPack) {
      return res.status(404).json({ message: 'Pack introuvable.' });
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (promo !== undefined) updateData.promo = parseFloat(promo);
    if (couvertureImgUrl !== undefined) updateData.coverPhotoUrl = couvertureImgUrl;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Aucune donnée à mettre à jour.' });
    }

    const updatedPack = await prisma.pack.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(updatedPack);

  } catch (error) {
    console.error('Erreur lors de la mise à jour du pack:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};
export const getPackById = async (req, res) => {
  try {
    const { id } = req.params;  
    const pack = await prisma.pack.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!pack) {
      return res.status(404).json({ message: 'Pack introuvable.' });
    }

    return res.status(200).json(pack);
  } catch (error) {
    console.error('Erreur lors de la récupération du pack:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};
export const deleteServiceFromPack = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const existingService = await prisma.packService.findUnique({
      where: { id: serviceId }
    });

    if (!existingService) {
      return res.status(404).json({ message: 'Service introuvable.' });
    }

    await prisma.packService.delete({
      where: { id: serviceId }
    });

    return res.status(200).json({ message: 'Service supprimé avec succès.' });

  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};
export const addServiceToPack = async (req, res) => {
  try {
    const { packId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Nom et description du service requis.' });
    }

    // Vérifier si le pack existe
    const existingPack = await prisma.pack.findUnique({
      where: { id: packId }
    });

    if (!existingPack) {
      return res.status(404).json({ message: 'Pack introuvable.' });
    }

    // Ajouter le service au pack
    const newService = await prisma.packService.create({
      data: {
        name,
        description,
        pack: {
          connect: { id: packId }
        }
      }
    });

    return res.status(201).json(newService);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du service au pack :', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

export const deletePackById = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le pack existe avec ses publicités et services
    const existingPack = await prisma.pack.findUnique({
      where: { id },
      include: {
        services: true,
        PublicitePack: {
          include: {
            PaymentPub: true
          }
        }
      }
    });

    if (!existingPack) {
      return res.status(404).json({ message: 'Pack introuvable.' });
    }

    // Supprimer les paiements liés aux publicités de ce pack
    for (const pub of existingPack.PublicitePack) {
      await prisma.paymentPub.deleteMany({
        where: { publiciteId: pub.id }
      });
    }

    // Supprimer les publicités liées au pack
    await prisma.publicitePack.deleteMany({
      where: { packid: id }
    });

    // Supprimer tous les services liés au pack
    await prisma.packService.deleteMany({
      where: { packId: id }
    });

    // Supprimer le pack
    await prisma.pack.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Pack, services, publicités et paiements supprimés avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du pack:', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

