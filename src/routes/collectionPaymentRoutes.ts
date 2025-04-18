import { Router } from "express";
import { CollectionPaymentService } from "../services/collectionPaymentService";
import { CollectionPaymentController } from "../controllers/collectionPaymentController";
import collectionPaymentRepository from "../repositories/collectionPaymentRepository";
import walletRepository from "../repositories/walletRepository";

const collectionPaymentService = new CollectionPaymentService(collectionPaymentRepository,walletRepository);
const collectionPaymentController = new CollectionPaymentController(collectionPaymentService);

const router = Router();

router.post("/initiate-payment",collectionPaymentController.initiatePayment.bind(collectionPaymentController));
router.post("/verify-payment",collectionPaymentController.verifyPayment.bind(collectionPaymentController));
router.get("/:paymentId",collectionPaymentController.getPaymentData.bind(collectionPaymentController));

export default router;