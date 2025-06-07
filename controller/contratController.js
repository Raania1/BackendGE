import prisma from "../DB/db.config.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractsDir = path.join(__dirname, '..', 'contracts');
if (!fs.existsSync(contractsDir)) {
  fs.mkdirSync(contractsDir, { recursive: true });
}

export const createContract = async (req, res) => {
    try {
      const { paymentId } = req.body;
  
      if (!paymentId) {
        return res.status(400).json({ error: 'Invalid paymentId' });
      }
  
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          reservation: {
            include: {
              Service: { include: { Prestataire: true } },
              Pack: { include: { Prestataire: true } },
              Organisateur: true,
            },
          },
        },
      });
  
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
  if ( payment.reservation.serviceid && !payment.reservation.packid){
     const { reservation } = payment;
      const { Service, Organisateur } = reservation;
      const { Prestataire } = Service;
  
      const contractId = payment.id;
      const filePath = path.join(contractsDir, `contract-${contractId}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
  
      // const prixString = reservation.prix;
      // if (!prixString || !prixString.endsWith(' DT')) {
      //   return res.status(400).json({ error: 'Invalid price format' });
      // }
      // const prix = parseFloat(prixString.replace(' DT', ''));
      // if (isNaN(prix)) {
      //   return res.status(400).json({ error: 'Price is not a valid number' });
      // }
      // const amountInMillimes = Math.round(prix * 1000);
      // if (amountInMillimes > Number.MAX_SAFE_INTEGER) {
      //   return res.status(400).json({ error: 'Price value too large' });
      // }
      let prix = parseFloat(reservation.prix.replace(/[^0-9.]/g, '')) || 0;
        if (isNaN(prix) || prix <= 0) {
            return res.status(400).json({ message: "Invalid price format for reservation" });
        }
        console.log('parsed prix:', prix);

        let amountInMillimes = Math.round(prix * 1000);
        console.log('amountInMillimes:', amountInMillimes);
      if (amountInMillimes > Number.MAX_SAFE_INTEGER) {
        return res.status(400).json({ error: 'Price value too large' });
      }
  
      doc.pipe(writeStream);
  
      const capitalize = (s) =>
        typeof s === 'string' && s.length > 0
          ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
          : s || '';
  
      const nomPrestataire = capitalize(Prestataire.nom);
      const prenomPrestataire = capitalize(Prestataire.prenom);
      const nomOrganisateur = capitalize(Organisateur.nom);
      const prenomOrganisateur = capitalize(Organisateur.prenom);
      const nomService = Service.nom.toUpperCase();
  
      const normalFontSize = 10;
      const titleFontSize = 16;
      const subtitleFontSize = 12;
  
      const logoPath = path.join(__dirname, 'FE1.png'); 
      if (fs.existsSync(logoPath)) {
        const logoWidth = 80;
        const logoHeight = 80;
        doc.image(logoPath, doc.options.margin, 20, {
          width: logoWidth,
          height: logoHeight,
        });
      } else {
        console.warn('Logo file not found:', logoPath);
      }

      doc.font('Helvetica-Bold').fontSize(18).text(`Contrat de Réservation de service ${Service.nom}`, { align: 'center' });
      doc.moveDown(2);
  
      doc.fontSize(normalFontSize).font('Helvetica').text(
        `Le présent contrat est conclu entre :\n\n` +
        `Le Prestataire, M./Mme ${nomPrestataire} ${prenomPrestataire}, exerçant en tant que prestataire de service "${nomService}", joignable par email à l’adresse ${Prestataire.email} et par téléphone au ${Prestataire.numTel}.\n` +
        `Et le client, M./Mme ${nomOrganisateur} ${prenomOrganisateur}, agissant en qualité d’organisateur d’événement, domicilié à ${Organisateur.adress} - ${Organisateur.ville}, joignable à l’adresse email ${Organisateur.email} et par téléphone au ${Organisateur.numTel}.`,
        { align: 'left' }
      );
      doc.moveDown(1);
  
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Détails du Service', { underline: true, align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
  
      doc.text(`Service Réservé : ${Service.nom}`, { align: 'left' });
      doc.text(`Date de Prestation : ${new Date(reservation.dateDebut).toLocaleDateString()}${reservation.dateFin ? ` au ${new Date(reservation.dateFin).toLocaleDateString()}` : ''}`, { align: 'left' });
      doc.moveDown(1);
  
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Conditions Financières', { underline: true, align: 'left' });
      doc.moveDown(0.5);
  
      const headers = ['Prix Total', 'Acompte Versé', 'Solde à Régler'];
      const values = [
        `${amountInMillimes} DT`,
        `${payment.montant} DT`,
        `${amountInMillimes - payment.montant} DT`
      ];
  
      const colWidth = (doc.page.width - doc.options.margin * 2) / 3;
      const rowHeight = 20;
      let startX = doc.x;
      let startY = doc.y;
  
      headers.forEach((header, i) => {
        doc.rect(startX + i * colWidth, startY, colWidth, rowHeight).stroke();
        doc.font('Helvetica-Bold').fontSize(10).text(header, startX + i * colWidth, startY + 5, {
          width: colWidth,
          align: 'center'
        });
      });
  
      const secondRowY = startY + rowHeight;
      values.forEach((value, i) => {
        doc.rect(startX + i * colWidth, secondRowY, colWidth, rowHeight).stroke();
        doc.font('Helvetica').fontSize(10).text(value, startX + i * colWidth, secondRowY + 5, {
          width: colWidth,
          align: 'center'
        });
      });
  
      doc.moveDown(1.5);
  
      doc.x = doc.options.margin || 50;
      const commissionRate = process.env.COMMISSION_RATE || 20;
      doc.fontSize(normalFontSize).font('Helvetica').text(
        `Modalités : Le solde doit être réglé au plus tard le jour de la prestation. ` +
        `FLESK EVENT prend une commission de ${commissionRate}% sur le montant versé en ligne au prestataire.`,
        { align: 'left' }
      );
      doc.moveDown(1);
  
      doc.x = doc.options.margin || 50;
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Engagements des Parties', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
  
      doc.text('Le Prestataire s\'engage à :');
      doc.list([
        'Fournir le service conformément aux termes du présent contrat.',
        'Respecter les délais et conditions convenus.'
      ], { bulletRadius: 2, indent: 10 });
      doc.moveDown();
  
      doc.text('Le Client s\'engage à :');
      doc.list([
        'Régler le montant convenu dans les délais impartis.',
        'Respecter les conditions d\'annulation mentionnées ci-dessous.'
      ], { bulletRadius: 2, indent: 10 });
      doc.moveDown(1);
  
      doc.x = doc.options.margin || 50;
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Conditions d\'Annulation', { underline: true, align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
  
      doc.text(
        'Le Client dispose d\'un délai de rétractation de 14 jours à compter de la signature du contrat. Passé ce délai, l\'acompte versé est non remboursable.',
        { align: 'left' }
      );
      doc.moveDown(1.5);
 
      doc.x = doc.options.margin || 50;
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Signature', { underline: true, align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
  
      doc.text(`Fait à ${Organisateur.ville}, le ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(0.25);
  
      const imageWidth = 200;
      const imageHeight = 100;
      const pageWidth = doc.page.width;
      const x = (pageWidth - imageWidth) / 2;
      const y = doc.y;
  
      const imagePath = path.join(__dirname, 'imaje (2).png');
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, x, y, {
          width: imageWidth,
          height: imageHeight
        });
      } else {
        console.warn('Image file not found:', imagePath);
        doc.text('Signature image not available', x, y, { align: 'center' });
      }
  
      doc.moveDown(2); 
      const qrCodeDataURL = await QRCode.toDataURL(paymentId);
      doc.fontSize(normalFontSize).font('Helvetica-Bold').text('QR Code du Paiement', {
        align: 'left',
      });
      doc.moveDown(0.5);
  
      const qrSize = 80;
      const qrX = doc.options.margin; 
      const bottomMargin = 100; 
      const pageHeight = doc.page.height;
      
      const qrY = pageHeight - qrSize - bottomMargin;
      doc.image(qrCodeDataURL, qrX, qrY, { width: qrSize });
  
      doc.end();
  
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', (err) => {
          console.error('Write stream error:', err);
          reject(err);
        });
      });
  
      const contract = await prisma.contrats.create({
        data: {
          content: `contracts/contract-${contractId}.pdf`,
          paymentId: payment.id,
          organisateurid: Organisateur.id,
          prestataireid: Prestataire.id,
        },
      });
  
      res.status(201).json({ message: 'Contract created successfully', contract });
  }
  if (!payment.reservation.serviceid && payment.reservation.packid){
    const { reservation } = payment;
      const { Pack, Organisateur } = reservation;
      const { Prestataire } = Pack;
  
      const contractId = payment.id;
      const filePath = path.join(contractsDir, `contract-${contractId}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
  
        let prix = parseFloat(reservation.prix.replace(/[^0-9.]/g, '')) || 0;
        if (isNaN(prix) || prix <= 0) {
            return res.status(400).json({ message: "Invalid price format for reservation" });
        }
        console.log('parsed prix:', prix);

        let amountInMillimes = Math.round(prix * 1000);
        console.log('amountInMillimes:', amountInMillimes);
      if (amountInMillimes > Number.MAX_SAFE_INTEGER) {
        return res.status(400).json({ error: 'Price value too large' });
      }
  
      doc.pipe(writeStream);
  
      const capitalize = (s) =>
        typeof s === 'string' && s.length > 0
          ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
          : s || '';
  
      const nomPrestataire = capitalize(Prestataire.nom);
      const prenomPrestataire = capitalize(Prestataire.prenom);
      const nomOrganisateur = capitalize(Organisateur.nom);
      const prenomOrganisateur = capitalize(Organisateur.prenom);
      const nomPack = Pack.title.toUpperCase();
  
      const normalFontSize = 10;
      const titleFontSize = 16;
      const subtitleFontSize = 12;
  
      const logoPath = path.join(__dirname, 'FE1.png'); 
      if (fs.existsSync(logoPath)) {
        const logoWidth = 80;
        const logoHeight = 80;
        doc.image(logoPath, doc.options.margin, 20, {
          width: logoWidth,
          height: logoHeight,
        });
      } else {
        console.warn('Logo file not found:', logoPath);
      }

      doc.font('Helvetica-Bold').fontSize(18).text(`Contrat de Réservation de ${Pack.title}`, { align: 'center' });
      doc.moveDown(2);
  
      doc.fontSize(normalFontSize).font('Helvetica').text(
        `Le présent contrat est conclu entre :\n\n` +
        `Le Prestataire, M./Mme ${nomPrestataire} ${prenomPrestataire}, exerçant en tant que prestataire de pack "${nomPack}", joignable par email à l’adresse ${Prestataire.email} et par téléphone au ${Prestataire.numTel}.\n` +
        `Et le client, M./Mme ${nomOrganisateur} ${prenomOrganisateur}, agissant en qualité d’organisateur d’événement, domicilié à ${Organisateur.adress} - ${Organisateur.ville}, joignable à l’adresse email ${Organisateur.email} et par téléphone au ${Organisateur.numTel}.`,
        { align: 'left' }
      );
      doc.moveDown(1);
  
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Détails du Pack', { underline: true, align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
  
      doc.text(`Pack Réservé : ${Pack.title}`, { align: 'left' });
      doc.text(`Période de Prestation : ${new Date(reservation.dateDebut).toLocaleDateString()}${reservation.dateFin ? ` au ${new Date(reservation.dateFin).toLocaleDateString()}` : ''}`, { align: 'left' });
      doc.moveDown(1);
  
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Conditions Financières', { underline: true, align: 'left' });
      doc.moveDown(0.5);
  
      const headers = ['Prix Total', 'Acompte Versé', 'Solde à Régler'];
      const values = [
        `${amountInMillimes} DT`,
        `${payment.montant} DT`,
        `${amountInMillimes - payment.montant} DT`
      ];
  
      const colWidth = (doc.page.width - doc.options.margin * 2) / 3;
      const rowHeight = 20;
      let startX = doc.x;
      let startY = doc.y;
  
      headers.forEach((header, i) => {
        doc.rect(startX + i * colWidth, startY, colWidth, rowHeight).stroke();
        doc.font('Helvetica-Bold').fontSize(10).text(header, startX + i * colWidth, startY + 5, {
          width: colWidth,
          align: 'center'
        });
      });
  
      const secondRowY = startY + rowHeight;
      values.forEach((value, i) => {
        doc.rect(startX + i * colWidth, secondRowY, colWidth, rowHeight).stroke();
        doc.font('Helvetica').fontSize(10).text(value, startX + i * colWidth, secondRowY + 5, {
          width: colWidth,
          align: 'center'
        });
      });
  
      doc.moveDown(1.5);
  
      doc.x = doc.options.margin || 50;
      const commissionRate = process.env.COMMISSION_RATE || 20;
      doc.fontSize(normalFontSize).font('Helvetica').text(
        `Modalités : Le solde doit être réglé au plus tard le jour de la prestation. ` +
        `FLESK EVENT prend une commission de ${commissionRate}% sur le montant versé en ligne au prestataire.`,
        { align: 'left' }
      );
      doc.moveDown(1);
  
      doc.x = doc.options.margin || 50;
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Engagements des Parties', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
  
      doc.text('Le Prestataire s\'engage à :');
      doc.list([
        'Fournir le pack conformément aux termes du présent contrat.',
        'Respecter les délais et conditions convenus.'
      ], { bulletRadius: 2, indent: 10 });
      doc.moveDown();
  
      doc.text('Le Client s\'engage à :');
      doc.list([
        'Régler le montant convenu dans les délais impartis.',
        'Respecter les conditions d\'annulation mentionnées ci-dessous.'
      ], { bulletRadius: 2, indent: 10 });
      doc.moveDown(1);
  
      doc.x = doc.options.margin || 50;
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Conditions d\'Annulation', { underline: true, align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
  
      doc.text(
        'Le Client dispose d\'un délai de rétractation de 14 jours à compter de la signature du contrat. Passé ce délai, l\'acompte versé est non remboursable.',
        { align: 'left' }
      );
      doc.moveDown(1.5);
 
      doc.x = doc.options.margin || 50;
      doc.fontSize(subtitleFontSize).font('Helvetica-Bold').text('Signature', { underline: true, align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(normalFontSize).font('Helvetica');
  
      doc.text(`Fait à ${Organisateur.ville}, le ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(0.25);
  
      const imageWidth = 200;
      const imageHeight = 100;
      const pageWidth = doc.page.width;
      const x = (pageWidth - imageWidth) / 2;
      const y = doc.y;
  
      const imagePath = path.join(__dirname, 'imaje (2).png');
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, x, y, {
          width: imageWidth,
          height: imageHeight
        });
      } else {
        console.warn('Image file not found:', imagePath);
        doc.text('Signature image not available', x, y, { align: 'center' });
      }
  
      doc.moveDown(2); 
      const qrCodeDataURL = await QRCode.toDataURL(paymentId);
      doc.fontSize(normalFontSize).font('Helvetica-Bold').text('QR Code du Paiement', {
        align: 'left',
      });
      doc.moveDown(0.5);
  
      const qrSize = 80;
      const qrX = doc.options.margin; 
      const bottomMargin = 100; 
      const pageHeight = doc.page.height;
      
      const qrY = pageHeight - qrSize - bottomMargin;
      doc.image(qrCodeDataURL, qrX, qrY, { width: qrSize });
  
      doc.end();
  
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', (err) => {
          console.error('Write stream error:', err);
          reject(err);
        });
      });
  
      const contract = await prisma.contrats.create({
        data: {
          content: `contracts/contract-${contractId}.pdf`,
          paymentId: payment.id,
          organisateurid: Organisateur.id,
          prestataireid: Prestataire.id,
        },
      });
  
      res.status(201).json({ message: 'Contract created successfully', contract });
  }
      
    } catch (error) {
      console.error('Error creating contract:', error.stack);
      res.status(500).json({ error: 'Failed to create contract', details: error.message });
    }
};

export const getContractByPaymentId = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const contract = await prisma.contrats.findUnique({
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

    const contract = await prisma.contrats.findUnique({
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