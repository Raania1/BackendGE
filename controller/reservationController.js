import prisma from "../DB/db.config.js";
import nodemailer from 'nodemailer';

export const createReservation = async(req,res)=>{

    try {
      const { serviceid, organisateurid, dateDebut , demande,prix} = req.body;
  
      if (!serviceid || !organisateurid || !dateDebut) {
        return res.status(400).json({ error: 'serviceId, organizerId et date sont requis' });
      }

      const dateDebutObj = new Date(dateDebut);
      const now = new Date();
  
      if (dateDebutObj < now) {
        return res.status(400).json({ error: 'La date de début ne peut pas être dans le passé' });
      }

      const service = await prisma.services.findUnique({
        where: { id: serviceid },
        include: { Prestataire: true }, 
      });
      if (!service) {
        return res.status(404).json({ error: 'Service non trouvé' });
      }
  
      const organizer = await prisma.organisateurs.findUnique({
        where: { id: organisateurid },
      });
      if (!organizer) {
        return res.status(404).json({ error: 'Organisateur non trouvé' });
      }
  
      const existingReservation = await prisma.reservations.findFirst({
        where: {
          Service: {
            Prestataireid: service.Prestataireid, 
          },
          dateDebut: new Date(dateDebut), 
          Status: 'CONFIRMED', 
        },
      });
  
      if (existingReservation) {
        return res.status(409).json({
          error: 'Le prestataire est déjà réservé à cette heure avec une réservation confirmée',
        });
      }
  
      const reservation = await prisma.reservations.create({
        data: {
          serviceid,
          organisateurid,
          dateDebut: new Date(dateDebut), 
          Status: 'PENDING', 
          demande,
          prix
        },
      });
  
      return res.status(201).json({
        message: 'Demande de réservation créée avec succès',
        reservation,
      });
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }
export const confirmReservation = async (req, res) => {
    try {
      const { reservationId } = req.params
  
      if (!reservationId) {
        return res.status(400).json({ error: "reservationId est requis" })
      }
  
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: {
          Service: {
            include: { Prestataire: true },
          },
          Organisateur: true,
        },
      })
  
      if (!reservation) {
        return res.status(404).json({ error: "Réservation non trouvée" })
      }
  
      if (reservation.Status !== "PENDING") {
        return res.status(400).json({
          error: "La réservation ne peut être confirmée car elle n'est pas en attente",
        })
      }
  
      const conflictingReservation = await prisma.reservations.findFirst({
        where: {
          Service: {
            Prestataireid: reservation.Service.Prestataireid,
          },
          dateDebut: reservation.dateDebut,
          Status: "CONFIRMED",
          id: { not: reservationId },
        },
      })
  
      if (conflictingReservation) {
        return res.status(409).json({
          error: "Le prestataire est déjà réservé à cette heure avec une autre réservation confirmée",
        })
      }
  
      const updatedReservation = await prisma.reservations.update({
        where: { id: reservationId },
        data: {
          Status: "CONFIRMED",
          updatedAt: new Date(),
        },
      })
  
      const formatDate = (dateString) => {
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
        return new Date(dateString).toLocaleDateString("tn-TN", options)
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
        tls: {
          rejectUnauthorized: false, 
        },
      })
  
      const iconCheckUrl = "https://cdn-icons-png.flaticon.com/512/5290/5290058.png"
      const iconCalendarUrl = "https://cdn-icons-png.flaticon.com/512/747/747310.png"
      const iconUserUrl = "https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
      const iconInfoUrl = "https://cdn-icons-png.flaticon.com/512/1176/1176744.png"
      const iconStarUrl = "https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
      const iconPriceUrl = "https://cdn-icons-png.flaticon.com/512/2331/2331941.png"
      const logoUrl = "../middleware/FE1.png" 

      const mailOptions = {
        from: `"FLESK EVENT" <${process.env.EMAIL_USER}>`,
        to: reservation.Organisateur.email,
        subject: "Confirmation de votre réservation",
        html: `
          <div style="font-family: 'Montserrat', 'Arial', sans-serif; background-color: #f8f9fa; padding: 40px 0; margin: 0; color: #333;">
            <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- En-tête avec bannière -->
              <div style="; padding: 25px; text-align: center; color: 4CAF50; position: relative;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtcGFydHkiPjxwYXRoIGQ9Ik0xOC41IDUuNWEyLjUgMi41IDAgMCAwLTUgMGMwIDEuMDI1LjU5NSAxLjkxIDEuNDU2IDIuMzMtLjI2LjQzLS40NTYuOTEtLjQ1NiAxLjQyIDAgMS41NzUgMS4yOCAyLjg1IDIuODYgMi44NS4zNSAwIC42ODUtLjA2NSAxLS4xODUiLz48cGF0aCBkPSJNMTUuNSA5Ljc1YTMuNzUgMy43NSAwIDAgMC03LjUgMGMwIDEuNjQyLjg0NiAzLjA4IDIuMTI1IDMuOTItLjM0LjU2LS42MjUgMS4xODUtLjYyNSAxLjgzIDAgMiAxLjYyNSAzLjYyNSAzLjYyNSAzLjYyNXMzLjYyNS0xLjYyNSAzLjYyNS0zLjYyNWMwLS42NDUtLjI4NS0xLjI3LS42MjUtMS44M2E0LjI1IDQuMjUgMCAwIDAgMi4xMjUtMy45MiIvPjxwYXRoIGQ9Ik04LjUgNS41YTIuNSAyLjUgMCAwIDEgNSAwYzAgMS4wMjUtLjU5NSAxLjkxLTEuNDU2IDIuMzMuMjYuNDMuNDU2LjkxLjQ1NiAxLjQyIDAgMS41NzUtMS4yOCAyLjg1LTIuODYgMi44NS0uMzUgMC0uNjg1LS4wNjUtMS0uMTg1Ii8+PC9zdmc+Cg=='); background-repeat: repeat; opacity: 0.2;"></div>
                <div style="position: relative; z-index: 1;">
                  <div style="display: inline-block; background-color: white; border-radius: 50%; width: 50px; height: 50px; margin-bottom: 15px; position: relative;">
                    <img src="${iconCheckUrl}" alt="Confirmé" style="width: 30px; height: 30px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                  </div>
                  <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #4CAF50;">Réservation Confirmée</h1>
                  <p style="margin: 0; font-size: 16px; color: #4CAF50;">Votre événement est prêt à être mémorable !</p>
                </div>
              </div>
  
              <!-- Image du service -->
              <div style="width: 100%; height: 200px; overflow: hidden; position: relative;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 20px 15px 15px; color: white;">
                  <h2 style="margin: 0; font-size: 22px;">${reservation.Service.nom}</h2>
                  <div style="display: flex; align-items: center; margin-top: 5px;">
                    <img src="${iconStarUrl}" alt="Étoile" style="width: 16px; height: 16px; margin-right: 5px;">
                    <span>${reservation.Service.rating || "4.8"}</span>
                  </div>
                </div>
              </div>
              <!-- Contenu principal -->
              <div style="padding: 30px;">
                <!-- Message de bienvenue -->
                <div>
                  <p style="font-size: 17px; margin: 0 0 15px 0;">
                    Bonjour <strong>${reservation.Organisateur.prenom} ${reservation.Organisateur.nom}</strong>,
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; margin: 0;">
                    Nous sommes ravis de vous confirmer que votre réservation a été acceptée par <strong>${reservation.Service.Prestataire.prenom} ${reservation.Service.Prestataire.nom}</strong>. Tous les détails sont prêts et nous sommes impatients de contribuer à la réussite de votre événement.
                  </p>
                </div>
  
                <!-- Carte des détails de réservation -->
                <div style="background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    Détails de votre réservation
                  </h3>
  
                  <div style="display: flex; margin-bottom: 15px; align-items: flex-start;">
                    <img src="${iconCalendarUrl}" alt="Calendrier" style="width: 20px; height: 20px; margin-right: 15px; margin-top: 2px; flex-shrink: 0;">
                    <div>
                      <p style="margin: 0 0 5px 0; font-weight: 600;">Date et heure</p>
                      <p style="margin: 0; color: #555;">${formatDate(reservation.dateDebut)}</p>
                    </div>
                  </div>
  
                  <div style="display: flex; margin-bottom: 15px; align-items: flex-start;">
                    <img src="${iconUserUrl}" alt="Utilisateur" style="width: 20px; height: 20px; margin-right: 15px; margin-top: 2px; flex-shrink: 0;">
                    <div>
                      <p style="margin: 0 0 5px 0; font-weight: 600;">Prestataire</p>
                      <p style="margin: 0; color: #555;">${reservation.Service.Prestataire.prenom} ${reservation.Service.Prestataire.nom}</p>
                    </div>
                  </div>  
                  ${
                    reservation.prix
                      ? `
                  <div style="display: flex; align-items: flex-start;">
                    <img src="${iconPriceUrl}" alt="Information" style="width: 20px; height: 20px; margin-right: 15px; margin-top: 2px; flex-shrink: 0;">
                    <div>
                      <p style="margin: 0 0 5px 0; font-weight: 600;">Prix total</p>
                      <p style="margin: 0; color: #555;">${reservation.prix} </p>
                    </div>
                  </div>
                  `
                      : ""
                  }
                </div>
  
                <!-- QR Code et actions -->
                 <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; margin-top: 30px;">
                <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Réservation: ${reservation.Service.nom}`)}&dates=${new Date(reservation.dateDebut).toISOString().replace(/-|:|\.\d+/g, "")}/${new Date(reservation.dateFin || new Date(new Date(reservation.dateDebut).getTime() + 3600000)).toISOString().replace(/-|:|\.\d+/g, "")}&details=${encodeURIComponent(`Réservation confirmée pour le service ${reservation.Service.nom} avec ${reservation.Service.Prestataire.prenom} ${reservation.Service.Prestataire.nom}`)}" 
                  target="_blank" 
                  style="background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 15px; min-width: 140px;">
                  Payer
                </a>
                &nbsp; &nbsp; &nbsp; 
                <a href="mailto:${reservation.Service.Prestataire.email || "contact@fleskevent.com"}?subject=${encodeURIComponent(`Question sur ma réservation: ${reservation.Service.nom}`)}" 
                  style="background-color: #f8f9fa; border: 1px solid #ddd; color: #333; text-decoration: none; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 15px; min-width: 140px;">
                  Contacter le prestataire
                </a>
              </div>
                <br>
  
                <!-- Recommandations -->
                <div style="background-color: #fff8e1; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #ffe0b2;">
                  <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #e65100; display: flex; align-items: center;">
                    <img src="${iconInfoUrl}" alt="Information" style="width: 18px; height: 18px; margin-right: 8px;">
                    Conseils pour votre événement
                  </h3>
                  <ul style="margin: 0; padding-left: 25px; font-size: 14px; color: #555;">
                    <li style="margin-bottom: 8px;">Préparez vos questions à l'avance pour le prestataire</li>
                    <li>N'hésitez pas à nous contacter pour toute modification</li>
                  </ul>
                </div>
              </div>
  
              <!-- Pied de page -->
              <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
                <img src="${logoUrl}" alt="Logo FLESK EVENT" style="height: 40px; margin-bottom: 15px;">
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
                  Merci de votre confiance ! Pour toute question, notre équipe est à votre disposition.
                </p>
                <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                  <a href="https://fleskevent.com/aide" style="color: #666; text-decoration: none; font-size: 14px;">Aide</a>
                  <a href="https://fleskevent.com/conditions" style="color: #666; text-decoration: none; font-size: 14px;">Conditions</a>
                  <a href="https://fleskevent.com/contact" style="color: #666; text-decoration: none; font-size: 14px;">Contact</a>
                </div>
                <p style="margin: 0; font-size: 13px; color: #999;">
                  © ${new Date().getFullYear()} FLESK EVENT. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        `,
      }
  
      await transporter.sendMail(mailOptions)
  
      return res.status(200).json({
        message: "Réservation confirmée avec succès et email envoyé 🎉",
        reservation: updatedReservation,
      })
    } catch (error) {
      console.error("Erreur lors de la confirmation de la réservation:", error)
      return res.status(500).json({ error: "Erreur serveur" })
    }
  }
  export const getAll = async(req,res)=>{
    try {
        const reservations = await prisma.reservations.findMany({include: {
            Organisateur: true, 
            Service: {
              include: {
                Prestataire: true
              },
            },
            payment:true
        },})

        if(reservations.length === 0){
            return res.status (404).json({message: "No reservation found yet."})
        }

        return res.status(200).json({reservations})
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again."
        });
    }
    
}
export const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params

    if (!reservationId) {
      return res.status(400).json({ error: "reservationId est requis" })
    }

    const reservation = await prisma.reservations.findUnique({
      where: { id: reservationId },
      include: {
        Service: {
          include: { Prestataire: true },
        },
        Organisateur: true,
      },
    })

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" })
    }

    if (reservation.Status === "CANCELED") {
      return res.status(400).json({ error: "La réservation est déjà annulée" })
    }

    const canceledReservation = await prisma.reservations.update({
      where: { id: reservationId },
      data: {
        Status: "CANCELED",
        updatedAt: new Date(),
      },
    })

    const formatDate = (dateString) => {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
      return new Date(dateString).toLocaleDateString("tn-TN", options)
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, 
      },
    })

    const iconCancelUrl = "https://cdn-icons-png.flaticon.com/512/1828/1828843.png" 
    const iconCalendarUrl = "https://cdn-icons-png.flaticon.com/512/747/747310.png"
    const iconUserUrl = "https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
    const iconInfoUrl = "https://cdn-icons-png.flaticon.com/512/1176/1176744.png"
    const iconPriceUrl = "https://cdn-icons-png.flaticon.com/512/2331/2331941.png"
    const logoUrl = "../middelware/FE1.png" 

    const mailOptions = {
      from: `"FLESK EVENT" <${process.env.EMAIL_USER}>`,
      to: reservation.Organisateur.email,
      subject: "Annulation de votre réservation",
      html: `
        <div style="font-family: 'Montserrat', 'Arial', sans-serif; background-color: #f8f9fa; padding: 40px 0; margin: 0; color: #333;">
          <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
            <!-- En-tête avec bannière -->
            <div style="padding: 25px; text-align: center; color: #e53935; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtcGFydHkiPjxwYXRoIGQ9Ik0xOC41IDUuNWEyLjUgMi41IDAgMCAwLTUgMGMwIDEuMDI1LjU5NSAxLjkxIDEuNDU2IDIuMzMtLjI2LjQzLS40NTYuOTEtLjQ1NiAxLjQyIDAgMS41NzUgMS4yOCAyLjg1IDIuODYgMi44NS4zNSAwIC42ODUtLjA2NSAxLS4xODUiLz48cGF0aCBkPSJNMTUuNSA5Ljc1YTMuNzUgMy43NSAwIDAgMC03LjUgMGMwIDEuNjQyLjg0NiAzLjA4IDIuMTI1IDMuOTItLjM0LjU2LS42MjUgMS4xODUtLjYyNSAxLjgzIDAgMiAxLjYyNSAzLjYyNSAzLjYyNSAzLjYyNXMzLjYyNS0xLjYyNSAzLjYyNS0zLjYyNWMwLS42NDUtLjI4NS0xLjI3LS42MjUtMS44M2E0LjI1IDQuMjUgMCAwIDAgMi4xMjUtMy45MiIvPjxwYXRoIGQ9Ik04LjUgNS41YTIuNSAyLjUgMCAwIDEgNSAwYzAgMS4wMjUtLjU5NSAxLjkxLTEuNDU2IDIuMzMuMjYuNDMuNDU2LjkxLjQ1NiAxLjQyIDAgMS41NzUtMS4yOCAyLjg1LTIuODYgMi44NS0uMzUgMC0uNjg1LS4wNjUtMS0uMTg1Ii8+PC9zdmc+Cg=='); background-repeat: repeat; opacity: 0.2;"></div>
              <div style="position: relative; z-index: 1;">
                <div style="display: inline-block; background-color: white; border-radius: 50%; width: 50px; height: 50px; margin-bottom: 15px; position: relative;">
                  <img src="${iconCancelUrl}" alt="Annulé" style="width: 30px; height: 30px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                </div>
                <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #e53935;">Réservation Annulée</h1>
                <p style="margin: 0; font-size: 16px; color: #e53935;">Votre réservation a été annulée</p>
              </div>
            </div>

            <!-- Image du service -->
            <div style="width: 100%; height: 200px; overflow: hidden; position: relative; filter: grayscale(50%);">
+              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 20px 15px 15px; color: white;">
                <h2 style="margin: 0; font-size: 22px;">${reservation.Service.nom}</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Annulé</p>
              </div>
            </div>

            <!-- Contenu principal -->
            <div style="padding: 30px;">
              <!-- Message de bienvenue -->
              <div style="margin-bottom: 25px;">
                <p style="font-size: 17px; margin: 0 0 15px 0;">
                  Bonjour <strong >${reservation.Organisateur.prenom} ${reservation.Organisateur.nom}</strong>,
                </p>
                <p style="font-size: 16px; line-height: 1.6; margin: 0;">
                  Nous vous confirmons que votre réservation avec <strong style="text-transform: capitalize;">${reservation.Service.Prestataire.prenom} ${reservation.Service.Prestataire.nom}</strong> a été annulée. Si vous avez des questions n'hésitez pas a lui contacter à : ${reservation.Service.Prestataire.numTel}, ou par email ce dessous.

                </p>
              </div>

              <!-- Carte des détails de réservation -->
              <div style="background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                  Détails de la réservation annulée
                </h3>

                <div style="display: flex; margin-bottom: 15px; align-items: flex-start;">
                  <img src="${iconCalendarUrl}" alt="Calendrier" style="width: 20px; height: 20px; margin-right: 15px; margin-top: 2px; flex-shrink: 0;">
                  <div>
                    <p style="margin: 0 0 5px 0; font-weight: 600;">Date et heure</p>
                    <p style="margin: 0; color: #555;">${formatDate(reservation.dateDebut)}</p>
                  </div>
                </div>

                <div style="display: flex; margin-bottom: 15px; align-items: flex-start;">
                  <img src="${iconUserUrl}" alt="Utilisateur" style="width: 20px; height: 20px; margin-right: 15px; margin-top: 2px; flex-shrink: 0;">
                  <div>
                    <p style="margin: 0 0 5px 0; font-weight: 600;">Prestataire</p>
                    <p style="margin: 0; color: #555; text-transform: capitalize;">${reservation.Service.Prestataire.prenom} ${reservation.Service.Prestataire.nom}</p>
                  </div>
                </div>  
                ${
                  reservation.prix
                    ? `
                <div style="display: flex; align-items: flex-start;">
                  <img src="${iconPriceUrl}" alt="Prix" style="width: 20px; height: 20px; margin-right: 15px; margin-top: 2px; flex-shrink: 0;">
                  <div>
                    <p style="margin: 0 0 5px 0; font-weight: 600;">Prix total</p>
                    <p style="margin: 0; color: #555;">${reservation.prix} </p>
                  </div>
                </div>
                `
                    : ""
                }
              </div>

              <!-- Actions -->
                 <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; margin-top: 30px;">
                <a href="http://localhost:4200/servicesOr" 
                  target="_blank" 
                  style="background-color: #e53935; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 15px; min-width: 140px;">
                  Découvrir d'autres services
                </a>
&nbsp; &nbsp;
                <a href="mailto:${reservation.Service.Prestataire.email || "contact@fleskevent.com"}?subject=${encodeURIComponent(`Question sur mon annulation: ${reservation.Service.nom}`)}" 
                  style="background-color: #f8f9fa; border: 1px solid #ddd; color: #333; text-decoration: none; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 15px; min-width: 140px;">
                  Contacter le prestataire
                </a>
              </div>
              <br>

            <!-- Pied de page -->
            <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
              <img src="${logoUrl}" alt="Logo FLESK EVENT" style="height: 40px; margin-bottom: 15px;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
                Merci de votre confiance ! Pour toute question, notre équipe est à votre disposition.
              </p>
              <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                <a href="https://fleskevent.com/aide" style="color: #666; text-decoration: underline; font-size: 14px;">Aide</a>&nbsp;
                <a href="https://fleskevent.com/conditions" style="color: #666; text-decoration: underline; font-size: 14px;">Conditions</a>&nbsp;
                <a href="https://fleskevent.com/contact" style="color: #666; text-decoration: underline; font-size: 14px;">Contact</a>&nbsp;
              </div>
              <p style="margin: 0; font-size: 13px; color: #999;">
                © ${new Date().getFullYear()} FLESK EVENT. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      message: "Réservation annulée avec succès et email envoyé",
      reservation: canceledReservation,
    })
  } catch (error) {
    console.error("Erreur lors de l'annulation de la réservation :", error)
    return res.status(500).json({ error: "Erreur serveur" })
  }
}

export const deleteReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;

    if (!reservationId) {
      return res.status(400).json({ error: 'reservationId est requis' });
    }

    const existingReservation = await prisma.reservations.findUnique({
      where: { id: reservationId },
      include: { payment: true } // Inclure le paiement associé
    });

    if (!existingReservation) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // D'abord supprimer le paiement s'il existe
    if (existingReservation.payment) {
      await prisma.payment.delete({
        where: { reservationId: reservationId }
      });
    }

    // Ensuite supprimer la réservation
    await prisma.reservations.delete({
      where: { id: reservationId },
    });

    return res.status(200).json({ message: 'Réservation et paiement associé supprimés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
export const countReservationByPrestataireId = async (req, res) => {
  try {
    const { Prestataireid } = req.params;

    if (!Prestataireid) {
      return res.status(400).json({ error: "Prestataire non trouvé" });
    }

    const count = await prisma.reservations.count({
      where: {
        Service: {
          Prestataireid: Prestataireid,
        },
      },
    });

    return res.status(200).json({ count });

  } catch (error) {
    console.error("Error fetching reservations:", error);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong. Please try again!",
    });
  }
};

export const countReservationsByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.status(400).json({ error: "ID de service requis" });
    }

    const count = await prisma.reservations.count({
      where: {
        serviceid: serviceId,
      },
    });

    return res.status(200).json({ count });

  } catch (error) {
    console.error("Erreur lors du comptage des réservations:", error);
    return res.status(500).json({
      status: 500,
      message: "Une erreur est survenue. Veuillez réessayer!",
    });
  }
};

export const countReservations = async (req, res) => {
  const { organizerId } = req.params;
  try {
    const count = await prisma.reservations.count({
      where: { organisateurid: organizerId },
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du comptage des réservations' });
  }
};

export const countPaidReservations = async (req, res) => {
  const { organizerId } = req.params;
  try {
    const count = await prisma.reservations.count({
      where: {
        organisateurid: organizerId,
        payment: {
          status: 'PAID',
        },
      },
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du comptage des réservations payées' });
  }
};