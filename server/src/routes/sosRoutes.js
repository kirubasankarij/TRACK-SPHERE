import express from 'express';
import { triggerSOS, getSOSHistory } from '../controllers/sosController.js';

const router = express.Router();

router.post('/trigger', triggerSOS);
router.get('/history', getSOSHistory);

export default router;
