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
            include: { Service: true }
          });
        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found" });
        }
       

        let prix = parseFloat(reservation.prix.replace(' DT', '')),
        amountInMillimes = Math.round(prix * 1000);

        const payment = await prisma.payment.create({
            data: {
              montant: amountInMillimes,
              reservationId: reservation.id
            }
        });

        const payload = {
            app_token: "ce704e65-5718-47c8-a720-3ff7aac01ee5",
            app_secret: process.env.FLOUCI_SECRET,
            amount: amountInMillimes,
            accept_card: "true",
            session_timeout_secs: 1200,
            success_link: "http://localhost:8000/success",
            fail_link: "http://localhost:8000/fail",
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
    } catch (error) {
        console.error("Payment initiation failed:", error);
        res.status(500).json({ error: "Payment initiation failed" });
    }
}

export async function verifyPayement(req,res){
    const id_payement = req.params.id_payment;
    if (!id_payement) {
        return res.status(400).json({ error: "Payment ID is required" });
    }
    try{
        const payment = await prisma.payment.findUnique({
            where: { id: id_payement }
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
            where: { id: id_payement },
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


