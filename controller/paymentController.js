// import axios from "axios"
// export async function Add(req, res) {
//     const url = "https://developers.flouci.com/api/generate_payment"
//     const Payload = {
//         "app_token": "ce704e65-5718-47c8-a720-3ff7aac01ee5",
//         "app_secret": process.env.FLOUCI_SECRET,
//         "amount": req.body.amount,
//         "accept_card": "true",
//         "session_timeout_secs": 1200,
//         "success_link": "http://localhost:8000/success",
//         "fail_link": "http://localhost:8000/failed",
//         "developer_tracking_id": "b5dd4aac-875e-472b-9574-f54a345fa749",
//     }
//     await axios.post(url, Payload)
//         .then(result => {
//             res.send(result.data)
//         })
//         .catch(err => console.error(err))
// }
// export async function verify(req,res){
//     const id_payment = req.params.id_payment
//     await axios.get(`https://developers.flouci.com/api/verify_payment/${id_payment}`, 
//         {
//         headers : {
//             'Content-Type': 'application/json',
//             'apppublic': "ce704e65-5718-47c8-a720-3ff7aac01ee5",
//             'appsecret': process.env.FLOUCI_SECRET
//       }})
  
//     .then(result =>{
//         res.send(result.data)
//     })
//     .catch(err=>console.log(err))
// }
import prisma from "../DB/db.config.js";
import axios from "axios";
import { Status } from '@prisma/client';

export async function addPayment(req,res){
    const { reservationId } = req.body;
    try{
        const reservation = await prisma.reservations.findUnique({
            where: { id: reservationId },
            include: { Service: true ,Pack:true}
          });
        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }
        if(reservation.serviceid && !reservation.packid){

            
        let prix = parseFloat(reservation.prix.replace(/[^0-9.]/g, '')) || 0;
        if (isNaN(prix) || prix <= 0) {
            return res.status(400).json({ message: "Invalid price format for reservation" });
        }
        console.log('parsed prix:', prix);

        let amountInMillimes = Math.round(prix * 1000);
        console.log('amountInMillimes:', amountInMillimes);

        let twentyPercent = Math.round(amountInMillimes * 0.30);
        console.log('twentyPercent:', twentyPercent);

            const payment = await prisma.payment.create({
            data: {
              montant: twentyPercent,
              reservationId: reservation.id
            }
            });

            const payload = {
                app_token: "ce704e65-5718-47c8-a720-3ff7aac01ee5",
                app_secret: process.env.FLOUCI_SECRET,
                amount: twentyPercent,
                accept_card: "true",
                session_timeout_secs: 1200,
                success_link: `https://frontendge.onrender.com/success?payment_id=${payment.id}`,
                fail_link: "https://frontendge.onrender.com/fail",
                developer_tracking_id: "b5dd4aac-875e-472b-9574-f54a345fa749"
            };

            const response = await axios.post(
                "https://developers.flouci.com/api/generate_payment", 
                payload
            );
            await prisma.payment.update({
                where: { id: payment.id },
                data: { flouciId: response.data.result.payment_id }
            });
            res.json(response.data );

        }
       if (!reservation.serviceid && reservation.packid) {
        console.log('reservation.prix:', reservation.prix);

        let prix = parseFloat(reservation.prix.replace(/[^0-9.]/g, '')) || 0;
        if (isNaN(prix) || prix <= 0) {
            return res.status(400).json({ message: "Invalid price format for reservation" });
        }
        console.log('parsed prix:', prix);

        let amountInMillimes = Math.round(prix * 1000);
        console.log('amountInMillimes:', amountInMillimes);

        let twentyPercent = Math.round(amountInMillimes * 0.20);
        console.log('twentyPercent:', twentyPercent);

        const payment = await prisma.payment.create({
            data: {
                montant: twentyPercent,
                reservationId: reservation.id
            }
        });

        const payload = {
            app_token: "ce704e65-5718-47c8-a720-3ff7aac01ee5",
            app_secret: process.env.FLOUCI_SECRET,
            amount: twentyPercent,
            accept_card: "true",
            session_timeout_secs: 1200,
            success_link: `https://frontendge.onrender.com/success?payment_id=${payment.id}`,
            fail_link: "https://frontendge.onrender.com/fail",
            developer_tracking_id: "b5dd4aac-875e-472b-9574-f54a345fa749"
        };

        const response = await axios.post(
            "https://developers.flouci.com/api/generate_payment", 
            payload
        );
        await prisma.payment.update({
            where: { id: payment.id },
            data: { flouciId: response.data.result.payment_id }
        });
        res.json(response.data);
    }
      

    } catch (error) {
        console.error("Payment initiation failed:", error);
        res.status(500).json({ error: "Payment initiation failed" });
    }
}

export async function verifyPayement(req,res){
    const payment_id = req.params.payment_id;
    if (!payment_id) {
        return res.status(400).json({ error: "Payment ID is required" });
    }
    try{
        const payment = await prisma.payment.findUnique({
            where: { id: payment_id }
        });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        const response = await axios.get(
            `https://developers.flouci.com/api/verify_payment/${payment.flouciId}`,
            {
                headers : {
                    'Content-Type': 'application/json',
                    'apppublic': "ce704e65-5718-47c8-a720-3ff7aac01ee5",
                    'appsecret': process.env.FLOUCI_SECRET
             }
            }
        );

        const status = response.data.success ? "PAID" : "FAILED";
        await prisma.payment.update({
            where: { id: payment_id },
            data: { status }
        });

        if (status === "PAID") {
            await prisma.reservations.update({
              where: { id: payment.reservationId },
              data: { Status: Status.PAID }
            });
        }

        res.json(response.data);    
    }catch (error) {
        console.error("Payment verification failed:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
}
export async function getPaymentByReservationId(req, res) {
    const { reservationId } = req.params;
  
    try {
      if (!reservationId) {
        return res.status(400).json({ error: "Reservation ID is required" });
      }
  
      const payment = await prisma.payment.findFirst({
        where: {
          reservationId: reservationId,
        },
      });
  
      if (!payment) {
        return res.status(404).json({ error: "Payment not found for this reservation" });
      }
  
      res.json({ payment });
    } catch (error) {
      console.error("Error fetching payment by reservation ID:", error);
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  }
 
  export async function getPaymentById(req, res) {
  const { paymentId } = req.params;

  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID is required" });
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Error fetching payment by ID:", error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
}


// paiment publicité 
 export async function addPaymentPub(req,res){
    const { pubId } = req.body;
    try{
         const pub = await prisma.publicitePack.findUnique({
            where: { id: pubId },
            include: { Pack: true }
        });

        if (!pub || !pub.Pack) {
            return res.status(404).json({ error: "Publicité or associated Pack not found" });
        }

        const twentyFivePercentOfPrice = pub.Pack.price * 0.20;
        const amountInMillimes = Math.round(twentyFivePercentOfPrice * 1000); 

        if (amountInMillimes < 1000) { 
            return res.status(400).json({ 
                error: "25% of the pack price is too small (minimum 1 TND)",
                calculated_amount: `${amountInMillimes/1000} TND`,
                original_price: `${pub.Pack.price} TND`
            });
        }
        const payment = await prisma.paymentPub.create({
            data: {
              montant: amountInMillimes,
              publiciteId: pub.id
            }
        });

        const payload = {
            app_token: "ce704e65-5718-47c8-a720-3ff7aac01ee5",
            app_secret: process.env.FLOUCI_SECRET,
            amount: amountInMillimes,
            accept_card: "true",
            session_timeout_secs: 1200,
            success_link: `https://frontendge.onrender.com/prestataire/successPr?payment_id=${payment.id}`,
            fail_link: "https://frontendge.onrender.com/prestataire/failPr",
            developer_tracking_id: "b5dd4aac-875e-472b-9574-f54a345fa749"
        };

        const response = await axios.post(
            "https://developers.flouci.com/api/generate_payment", 
            payload
        );
        await prisma.paymentPub.update({
            where: { id: payment.id },
            data: { flouciId: response.data.result.payment_id }
        });

        res.json(response.data );
    } catch (error) {
        console.error("Payment initiation failed:", error);
        res.status(500).json({ error: "Payment initiation failed" });
    }
} 

export async function verifyPayementPub(req,res){
    const payment_id = req.params.payment_id;
    if (!payment_id) {
        return res.status(400).json({ error: "Payment ID is required" });
    }
    try{
        const payment = await prisma.paymentPub.findUnique({
            where: { id: payment_id }
        });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        const response = await axios.get(
            `https://developers.flouci.com/api/verify_payment/${payment.flouciId}`,
            {
                headers : {
                    'Content-Type': 'application/json',
                    'apppublic': "ce704e65-5718-47c8-a720-3ff7aac01ee5",
                    'appsecret': process.env.FLOUCI_SECRET
             }
            }
        );

        const status = response.data.success ? "PAID" : "FAILED";
        await prisma.paymentPub.update({
            where: { id: payment_id },
            data: { Status: "PAID" }
        });

        if (status === "PAID") {
            await prisma.publicitePack.update({
              where: { id: payment.publiciteId },
              data: {
                paid: true,
                DatePublic: new Date(),
              },
            });
        }
        res.json(response.data);    
    }catch (error) {
        console.error("Payment verification failed:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
}
export async function getAllPaymentPub(req, res) {
    try {
        const payments = await prisma.paymentPub.findMany({
            include: {
                publicitePack: {
                    include: {
                        Pack: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const totalPaidAmount = payments
            .filter(payment => payment.Status === "PAID")
            .reduce((sum, payment) => sum + (payment.montant / 1000), 0); // convertir millimes en dinars

        res.status(200).json({ 
            payments,
            totalPaidAmount: totalPaidAmount
        });

    }  catch (error) {
    console.error("Error fetching all publicite payments:", error);

    res.status(500).json({ 
      error: "Failed to fetch publicite payments",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function getPaymentPubByPrestataireId(req, res) {
  const { prestataireId } = req.params;

  if (!prestataireId) {
    return res.status(400).json({ error: "Prestataire ID is required" });
  }

  try {
    const payments = await prisma.paymentPub.findMany({
      where: {
        publicitePack: {
          Pack: {
            prestataireId: prestataireId
          }
        }
      },
      include: {
        publicitePack: {
          include: { Pack: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ payments });
  } catch (error) {
    console.error("Error fetching publicite payments by prestataire ID:", error);
    res.status(500).json({ error: "Failed to fetch publicite payments" });
  }
}




