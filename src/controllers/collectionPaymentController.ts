import { Request, Response } from "express";
import { ICollectionPaymentController } from "../interfaces/collectionPayment/ICollectionPaymentController";
import { ICollectionPaymentService } from "../interfaces/collectionPayment/ICollectionPaymentService";
import { HTTP_STATUS } from "../constants/httpStatus";
import { MESSAGES } from "../constants/messages";

export class CollectionPaymentController implements ICollectionPaymentController {
    constructor(private collectionPaymentService: ICollectionPaymentService) { };

    async initiatePayment(req: Request, res: Response): Promise<void> {
        try {

            const userId = req.headers['x-user-id'] as string;
            const { paymentMethod, collectionData } = req.body;

            console.log("collectionData :", collectionData);
            console.log("Payment Method:", paymentMethod);
            console.log("UserId:", userId);

            if (!collectionData || Object.keys(collectionData).length === 0 || !paymentMethod) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: MESSAGES.COLLECTION_DATA_REQUIRED,
                });
                return;
            }
            if (paymentMethod === "razorpay") {
                const { orderId } = await this.collectionPaymentService.processRazorpayPayment(userId, collectionData);
                res.status(HTTP_STATUS.OK).json({
                    success: true,
                    orderId,
                });

            } else if (paymentMethod === "wallet") {
                await this.collectionPaymentService.processWalletPayment(userId, collectionData);
                res.status(HTTP_STATUS.OK).json({
                    success: true,
                    message: MESSAGES.PAYMENT_SUCCESSFULL
                });
            }

        } catch (error: any) {

            if (error.status === HTTP_STATUS.BAD_REQUEST) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({ message: error.message });
            } else {
                console.error("Error during initiating payment:", error.message);
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
            }
        }
    }

    async verifyPayment(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.headers['x-user-id'];
            const razorpayVerificationData = req.body;

            console.log("userId :", userId);
            console.log("razorpayVerificationData :", razorpayVerificationData)

            // const response = await this.collectionPaymentService.verifyPayment(userId as string,razorpayVerificationData);
            const response = await this.collectionPaymentService.verifyPayment(userId as string, razorpayVerificationData);

            if (!response) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: MESSAGES.PAYMENT_FAILED
                });
            }

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGES.PAYMENT_SUCCESSFULL
            });

        } catch (error: any) {
            console.error("Error during verifying payment:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async getPaymentData(req: Request, res: Response): Promise<void> {
        try {
            const paymentId = req.params.paymentId;
            const paymentDetails = await this.collectionPaymentService.getPaymentData(paymentId);
            if (!paymentDetails) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: MESSAGES.PAYMENT_NOT_FOUND
                });
                return;
            }
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: paymentDetails
            });


        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}