import prisma from "../DB/db.config.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractsDir = path.join(__dirname, '..', 'contracts');
if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
}

export const createContract = async (req, res) => {
    try {
      const { paymentId } = req.body;
  
      // Fetch payment with related reservation, service, and prestataire
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          reservation: {
            include: {
              Service: { include: { Prestataire: true } },
              Organisateur: true,
            },
          },
        },
      });
  
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
  
      const { reservation } = payment;
      const { Service, Organisateur } = reservation;
      const { Prestataire } = Service;
  
      // Generate PDF
      const contractId = payment.id;
      const filePath = path.join(contractsDir, `contract-${contractId}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      let prix = parseFloat(reservation.prix.replace(' DT', '')),
      amountInMillimes = Math.round(prix * 1000);
      doc.pipe(writeStream);
  
      // Configuration des polices
      const normalFontSize = 10;
      const titleFontSize = 16;
      const subtitleFontSize = 12;
      
      // Header
      doc.font('Helvetica-Bold').fontSize(18).text(`Contrat de Réservation d'un service`, { align: 'center' });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10).text('Contrat # ' + contractId, { align: 'center' });
      doc.moveDown(1);
      
      // Parties Involved
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Parties au Contrat', { underline: true });
      doc.moveDown(0.5);
      
      // Prestataire Section (Paragraph)
      doc.fontSize(normalFontSize).font('Helvetica').text(
        `Le prestataire de service, ${Prestataire.nom} ${Prestataire.prenom}, proposant le service "${Service.nom}", domicilié à ${Prestataire.adress}, joignable par email à ${Prestataire.email} et par téléphone au ${Prestataire.numTel}, ci-après dénommé "Le Prestataire".`
      );
      doc.moveDown(1);
      
      // Organisateur Section (Paragraph)
      doc.fontSize(normalFontSize).font('Helvetica').text(
        `Le client, ${Organisateur.nom} ${Organisateur.prenom}, résidant à ${Organisateur.adress}, ${Organisateur.ville}, joignable par email à ${Organisateur.email} et par téléphone au ${Organisateur.numTel}, ci-après dénommé "Le Client".`
      );
      doc.moveDown(1);
      
      // Service Details
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Détails du Service', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
      
      // Table-like structure for service details
      doc.text(`Service Réservé : ${Service.nom}`);
      doc.text(`Date de Prestation : ${new Date(reservation.dateDebut).toLocaleDateString()}${reservation.dateFin ? ` au ${new Date(reservation.dateFin).toLocaleDateString()}` : ''}`);
      doc.moveDown(1);
      
      // Financial Conditions
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Conditions Financières', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
      
      // Table-like structure for payment details
      doc.text(`Prix Total : ${amountInMillimes / 1000} DT`);
      doc.text(`Acompte Versé : ${payment.montant} DT`);
      doc.text(`Solde à Régler : ${(reservation.prix - payment.montant)} DT`);
      doc.text(`Modalités : Le solde doit être réglé au plus tard le jour de la prestation.`);
      doc.moveDown(1);
      
      // Engagements
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Engagements des Parties', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
      
      doc.text('Le Prestataire s\'engage à :');
      doc.list([
        'Fournir le service conformément aux termes du présent contrat.',
        'Respecter les délais et conditions convenus.',
        'Fournir tout matériel nécessaire, sauf disposition contraire.'
      ], { bulletRadius: 2, indent: 10 });
      doc.moveDown();
      
      doc.text('Le Client s\'engage à :');
      doc.list([
        'Régler le montant convenu dans les délais impartis.',
        'Fournir les informations nécessaires à l\'exécution du service.',
        'Respecter les conditions d\'annulation mentionnées ci-dessous.'
      ], { bulletRadius: 2, indent: 10 });
      doc.moveDown(1);
      
      // Cancellation Terms
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Conditions d\'Annulation', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
      
      doc.text('Le Client dispose d\'un délai de rétractation de 14 jours à compter de la signature du contrat. Passé ce délai, l\'acompte versé est non remboursable.');
      doc.moveDown(1);
      
      // Signatures
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Signatures', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
      
      doc.text(`Fait à ${Organisateur.ville}, le ${new Date().toLocaleDateString()}`);
      doc.moveDown(1);
      
      doc.text('Le Prestataire', { align: 'left', continued: true });
      doc.text('Le Client', { align: 'right' });
      doc.moveDown(0.5);
      doc.text('_________________________', { align: 'left', continued: true });
      doc.text('_________________________', { align: 'right' });
      
      // Footer
      doc.moveDown(1.5);
      doc.fontSize(8).font('Helvetica').text('Ce contrat est établi en deux exemplaires originaux, chacun ayant la même valeur juridique.', { align: 'center' });
      
      doc.end();
  
      // Wait for PDF to finish writing
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
  
      // Create contract in the database
      const contract = await prisma.contrats.create({
        data: {
          content: `contracts/contract-${contractId}.pdf`,
          paymentId: payment.id,
          organisateurid: Organisateur.id,
          prestataireid: Prestataire.id,
        },
      });
  
      res.status(201).json({ message: 'Contract created successfully', contract });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create contract' });
    }
};

export const getContractByPaymentId = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const contract = await prisma.contracts.findUnique({
      where: { paymentId },
      include: {
        Payment: true,
        Organisateur: true,
        Prestataire: true,
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.status(200).json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
};

export const downloadContract = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const contract = await prisma.contracts.findUnique({
      where: { paymentId },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const filePath = path.join(__dirname, '..', contract.content);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.download(filePath, `contract-${paymentId}.pdf`, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to download PDF' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process download' });
  }
};