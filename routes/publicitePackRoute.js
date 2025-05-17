import { Router } from "express";
import { deletePublicite,getAllPublicites,getAllPublicitesC,annulerPublicite,createPublicite,confirmerPublicite } from "../controller/publicitePack.js";

const router = Router()

router.post('/create', createPublicite);
router.put('/confirmer/:id', confirmerPublicite);
router.put('/annuler/:id', annulerPublicite);
router.get('/pubC', getAllPublicitesC);
router.get('/pubs', getAllPublicites);
router.delete('/delete/:id', deletePublicite);
export default router