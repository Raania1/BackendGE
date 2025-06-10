import { Router } from "express";
import  { createComment,getCommentById ,getAllComments,updateComment,deleteComment} from "../controller/commentController.js";
import { roleBasedAccess, verifyToken } from "../middleware/Authenticate.js";
const router = Router();

router.post('/create',verifyToken,roleBasedAccess(["admin","organizer"]),createComment);
router.get('/getById/:id', getCommentById);
router.get('/getAll', getAllComments);
router.put('/updateById/:id', updateComment);
router.delete('/DeleteById/:id', deleteComment);

export default router