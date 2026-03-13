import express from 'express';
import * as shipmentController from '../controllers/shipmentController.js';

const router = express.Router();

router.get('/', shipmentController.getAllShipments);
router.post('/', shipmentController.createShipment);
router.get('/:id', shipmentController.getShipmentById);
router.put('/:id', shipmentController.updateShipment);
router.delete('/:id', shipmentController.deleteShipment);

export default router;
