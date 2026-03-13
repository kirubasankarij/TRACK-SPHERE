import express from 'express';
import * as trackingController from '../controllers/trackingController.js';

const router = express.Router();

router.get('/:trackingNumber', trackingController.getTrackingInfo);
router.post('/update', trackingController.updateTracking);
router.post('/verify-delivery', trackingController.verifyDelivery);
router.post('/report-delay', trackingController.reportDelay);

export default router;
