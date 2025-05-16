import { Router } from "express";
import { getAllPublicites,getAllPublicitesC,annulerPublicite,createPublicite,confirmerPublicite } from "../controller/publicitePack.js";

const router = Router()

router.post('/create', createPublicite);
router.put('/confirmer/:id', confirmerPublicite);
router.put('/annuler/:id', annulerPublicite);
router.get('/pubC', getAllPublicitesC);
router.get('/pubs', getAllPublicites);



export default router