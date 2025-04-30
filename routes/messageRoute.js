import express from 'express';
import {
  createMessage,
  updateMessageStatus,
  deleteMessage,
  replyToMessage,
  getAllMessages,
  getPublicMessages
} from '../controller/messageController.js';

const router = express.Router();

router.post('/create', createMessage);
router.post('/reply/:id', replyToMessage);
router.get('/getAll', getAllMessages);
router.get('/getAllPublic', getPublicMessages);
router.put('/update/:id', updateMessageStatus);
router.delete('/delete/:id', deleteMessage);

export default router;
