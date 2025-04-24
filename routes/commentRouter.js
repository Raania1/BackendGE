import { Router } from "express";
import  { createComment,getCommentById ,getAllComments,updateComment,deleteComment} from "../controller/commentController.js";
const router = Router();

router.post('/create', createComment);
router.get('/getById/:id', getCommentById);
router.get('/getAll', getAllComments);
router.put('/updateById/:id', updateComment);
router.delete('/DeleteById/:id', deleteComment);

export default router