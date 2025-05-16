import prisma from "../DB/db.config.js";
import nodemailer from 'nodemailer';

export const createPublicite = async (req, res) => {
  const { packid } = req.body;
  if (!packid){
    return res.status(404).json({ error: 'pack not found' });
  }
  const pack = await prisma.pack.findUnique({
    where: {
        id:packid
    }
  })
       const twentyFivePercentOfPrice = pack.price * 0.20;
        const amountInMillimes = Math.round(twentyFivePercentOfPrice * 1000); 
  try {
    const pub = await prisma.publicitePack.create({
      data: {
        prix: amountInMillimes,
        packid,
      },
    });
    res.status(201).json(pub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const confirmerPublicite = async (req, res) => {
  const { id } = req.params;

  try {
    const pub = await prisma.publicitePack.update({
      where: { id },
      data: {
        Status: 'CONFIRMED'
      },
    });

    res.status(200).json({ message: 'Publicité confirmée avec succès', pub });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const annulerPublicite = async (req, res) => {
  const { id } = req.params;

  try {
    const pub = await prisma.publicitePack.update({
      where: { id },
      data: {
        Status: 'CANCELED',
      },
    });

    res.status(200).json({ message: 'Publicité annulée avec succès', pub });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getAllPublicitesC = async (req, res) => {
  try {
    const pubs = await prisma.publicitePack.findMany({
      where: {
        Status: "CONFIRMED",
        paid: true
      },
      include: {
        Pack: {
          include: {
            Prestataire: true
          }
        }
      }
    });

    if (pubs.length === 0) {
      return res.status(200).json('aucune publicité pour le moment');
    }
    
    return res.status(200).json(pubs);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getAllPublicites = async (req, res) => {
  try {
    const pubs = await prisma.publicitePack.findMany({
      include: {
        Pack: {
          include: {
            Prestataire: true
          }
        }
      }
    });

    if (pubs.length === 0) {
      return res.status(200).json('aucune publicité pour le moment');
    }
    
    return res.status(200).json(pubs);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const markExpiredPublicites = async () => {
  try {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 30);
//expirationDate.setMinutes(expirationDate.getMinutes() - 1);

    const expiredPubs = await prisma.publicitePack.findMany({
      where: {
        Status: "CONFIRMED",
        paid: true,
        DatePublic: {
          lte: expirationDate,
          not: null,
        },
      },
      include: {
        Pack: {
          include: {
            Prestataire: true,
          },
        },
      },
    });

    for (const pub of expiredPubs) {
      await prisma.publicitePack.update({
        where: { id: pub.id },
        data: { Status: "TERMINEE" },
      });

      const prestataire = pub.Pack.Prestataire;

      const iconCheckUrl = "https://cdn-icons-png.flaticon.com/512/5290/5290058.png";
      const iconCalendarUrl = "https://cdn-icons-png.flaticon.com/512/747/747310.png";
      const iconUserUrl = "https://cdn-icons-png.flaticon.com/512/1077/1077063.png";
      const iconInfoUrl = "https://cdn-icons-png.flaticon.com/512/1176/1176744.png";
      const logoUrl = "https://fleskevent.com/logo.png";

      const mailOptions = {
        from: `"FLESK EVENT" <${process.env.EMAIL_USER}>`,
        to: prestataire.email,
        subject: "Expiration de votre publicité",
        html: `<!DOCTYPE html>
          <html lang="fr">
          <body style="font-family: 'Montserrat', Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0; color: #333;">
            <div style="max-width: 650px; margin: auto; background-color: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
              <div style="padding: 25px; text-align: center; color: #4CAF50; position: relative;">
                <div style="display: inline-block; background: #fff; border-radius: 50%; width: 50px; height: 50px;">
                  <img src="${iconCheckUrl}" alt="Expiré" style="width: 30px; height: 30px; margin-top: 10px;">
                </div>
                <h1 style="color: #e65100;">Publicité Expirée</h1>
                <p style="color: #e65100;">Votre publicité a atteint sa date d'expiration.</p>
              </div>

              <div style="height: 200px; background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7)); padding: 20px; color: white;">
                <h2>${pub.Pack.title}</h2>
              </div>

              <div style="padding: 30px;">
                <p>Bonjour <strong>${prestataire.prenom} ${prestataire.nom}</strong>,</p>
                <p>Nous vous informons que votre publicité <strong>${pub.Pack.title}</strong> a expiré et a été marquée comme terminée.</p>

                <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin-top: 20px;">
                  <h3>Détails de la publicité</h3>
                  <p><img src="${iconCalendarUrl}" width="16" style="vertical-align: middle;"> Date d'expiration : ${formatDate(pub.DatePublic)}</p>
                  <p><img src="${iconUserUrl}" width="16" style="vertical-align: middle;"> Pack : ${pub.Pack.title}</p>
                </div>

                <div style="margin-top: 30px;">
                  <a href="https://fleskevent.com/creer-publicite" style="background: #4CAF50; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Créer une nouvelle publicité</a>
                  <a href="mailto:contact@fleskevent.com?subject=${encodeURIComponent("Question sur mon annonce expirée: " + pub.Pack.title)}" 
                     style="margin-left: 15px; padding: 10px 20px; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #333;">
                     Contacter le support
                  </a>
                </div>

                <div style="background-color: #fff8e1; border: 1px solid #ffe0b2; border-radius: 12px; padding: 15px; margin-top: 30px;">
                  <h4><img src="${iconInfoUrl}" width="16" style="vertical-align: middle;"> Prochaines étapes :</h4>
                  <ul style="margin-left: 20px;">
                    <li>Créez une nouvelle publicité pour continuer à promouvoir vos services.</li>
                    <li>Contactez notre équipe pour toute question.</li>
                  </ul>
                </div>
              </div>

              <footer style="text-align: center; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #eee;">
                <img src="${logoUrl}" alt="FLESK EVENT" height="40" style="margin-bottom: 10px;"><br>
                <small style="color: #999;">© ${new Date().getFullYear()} FLESK EVENT. Tous droits réservés.</small>
              </footer>
            </div>
          </body>
          </html>`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email envoyé à ${prestataire.email} pour la publicité expirée ID ${pub.id}`);
    }

    console.log(`Total des publicités marquées comme expirées : ${expiredPubs.length}`);
    return expiredPubs.length;

  } catch (error) {
    console.error("Erreur lors du traitement des publicités expirées :", error);
    throw error;
  }
};




