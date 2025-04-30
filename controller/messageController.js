import prisma from "../DB/db.config.js";
import nodemailer from 'nodemailer';

export const createMessage = async(req,res)=>{

  try {
    const { NomComplet, email, Sujet, Message } = req.body;

    if (!NomComplet || !email || !Sujet || !Message) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const newMessage = await prisma.messages.create({
      data: {
        NomComplet,
        email,
        Sujet,
        Message,
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Erreur lors de la création du message :", error);
    res.status(500).json({ error: "Erreur serveur lors de la création du message." });
  }
};

export const updateMessageStatus = async(req,res)=>{

    const { id } = req.params;
  
    try {
      const message = await prisma.messages.findUnique({ where: { id } });
      if (!message) {
        return res.status(404).json({ error: 'Message non trouvé.' });
      }
  
      const updatedMessage = await prisma.messages.update({
        where: { id },
        data: { Status: 'PUBLIC' },
      });
  
      res.status(200).json(updatedMessage);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du status :', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  };

export const deleteMessage = async(req,res)=>{

    const { id } = req.params;
  
    try {
      const existingMessage = await prisma.messages.findUnique({ where: { id } });
      if (!existingMessage) {
        return res.status(404).json({ error: 'Message non trouvé.' });
      }
  
      await prisma.messages.delete({ where: { id } });
  
      res.status(200).json({ message: 'Message supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression du message :', error);
      res.status(500).json({ error: 'Erreur serveur lors de la suppression.' });
    }
  };

export const getAllMessages = async (req, res) => {
    try {
      const messages = await prisma.messages.findMany({
        orderBy: {
          createdAt: 'desc', 
        },
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages :', error);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération.' });
    }
  };

export const getPublicMessages = async (req, res) => {
    try {
      const messages = await prisma.messages.findMany({
        where: { Status: 'PUBLIC' },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages PUBLIC :', error);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération.' });
    }
  };

export const replyToMessage = async(req,res)=>{

    const { id } = req.params;
    const { subject, body } = req.body;
  
    try {
      const message = await prisma.messages.findUnique({ where: { id } });
      if (!message) {
        return res.status(404).json({ error: 'Message non trouvé.' });
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

      const mailOptions = {
        from: `"FLESK EVENT" <${process.env.EMAIL_USER}>`,
        to: message.email,
        subject: subject || `Réponse à votre message: ${message.Sujet}`,
        html: `
        <div style="font-family: Arial, sans-serif; background-color: white; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 10px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            <p>Bonjour ${message.NomComplet},</p>
            <p> ${body}</p>
            <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter.</p>
            <br>
            <a href="mailto:contact@fleskevent.com" style="color: white; background-color: #eb6317; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Contacter le support</a>
            <p style="margin-top: 30px; font-size: 12px; color: #999;">© ${new Date().getFullYear()} FLESK EVENT</p>
          </div>
        </div>
      `,
      }
  
      await transporter.sendMail(mailOptions)

      res.status(200).json({ message: 'Email envoyé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de l’envoi de l’e-mail :', error);
      res.status(500).json({ error: 'Échec de l’envoi de l’e-mail.' });
    }
  };
