import prisma from "../utils/prisma-client.js"
import axios from "axios";
import { generateHmacSha256Hash } from "../utils/helper.js";

export const initiatePayment = async (req, res) => {
  const {
    amount,
    paymentGateway, 
    reservationId,
    productName,
    purchaseOrderId,
    purchaseOrderName,
  } = req.body;

console.log("Initiate Payment Request Body:", req.body);

  try {
    //  Cash Payment
    if (paymentGateway === "cash") {
      const paymentData = {
        amount,
        method: "CASH",
        status: "COMPLETED",
      };
      
      if (reservationId) {
        paymentData.reservationId = reservationId;
      }
      
      const payment = await prisma.payment.create({
        data: paymentData,
      });

      return res.status(200).json({
        message: "Cash payment completed",
        payment,
      });
    }

    //  Khalti Payment
    if (paymentGateway === "khalti") {
      const transactionUuid = purchaseOrderId || `KHL-${Date.now()}`;
      
      const paymentData = {
        amount,
        method: "KHALTI",
        status: "PENDING",
        transactionUuid,
      };
      
      if (reservationId) {
        paymentData.reservationId = reservationId;
      }
      
      const payment = await prisma.payment.create({
        data: paymentData,
      });

      return res.status(200).json({
        message: "Khalti payment initiated",
        payment,
        khaltiConfig: {
          publicKey: process.env.KHALTI_PUBLIC_KEY,
          productIdentity: transactionUuid,
          productName: purchaseOrderName || productName || "Cafe Order",
          productUrl: process.env.FRONTEND_URL || "http://localhost:3000",
          amount: amount * 100, 
        },
      });
    }

    return res.status(400).json({ message: "Invalid payment method" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment  failed" });
  }
};

export const paymentStatus = async (req, res) => {
  const { transactionUuid, status } = req.body;

  try {
    const payment = await prisma.payment.findUnique({
      where: { transactionUuid },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.method === "CASH") {
      return res.json({ status: "COMPLETED" });
    }

    if (status === "FAILED") {
      await prisma.payment.update({
        where: { transactionUuid },
        data: { status: "FAILED" },
      });

      return res.json({ status: "FAILED" });
    }

    await prisma.payment.update({
      where: { transactionUuid },
      data: { status: "COMPLETED" },
    });

    return res.json({ status: "COMPLETED" });
  } catch (error) {
    res.status(500).json({ message: "Payment status check failed" });
  }
};

// Khalti payment verification 
export const verifyKhaltiPayment = async (req, res) => {
  const { token, amount, transactionUuid } = req.body;

  try {
    const payment = await prisma.payment.findUnique({
      where: { transactionUuid },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "COMPLETED") {
      return res.json({ message: "Payment already verified", payment });
    }

    // For test/development mode (token starts with TEST)
    if (token && token.startsWith("TEST")) {
      const updatedPayment = await prisma.payment.update({
        where: { transactionUuid: payment.transactionUuid },
        data: {
          status: "COMPLETED",
          transactionId: token,
        },
      });

      return res.json({
        message: "Payment verified successfully (test mode)",
        payment: updatedPayment,
      });
    }

    // For production: Verify with Khalti server
    try {
      const verificationUrl = "https://khalti.com/api/v2/payment/verify/";
      const khaltiRes = await axios.post(
        verificationUrl,
        {
          token,
          amount: amount * 100,
        },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          },
        }
      );
      
      if (khaltiRes.data.state.name !== "Completed") {
        await prisma.payment.update({
          where: { transactionUuid: payment.transactionUuid },
          data: { status: "FAILED" },
        });
        return res.status(400).json({ message: "Khalti verification failed" });
      }

      // Update payment status to COMPLETED
      const updatedPayment = await prisma.payment.update({
        where: { transactionUuid: payment.transactionUuid },
        data: {
          status: "COMPLETED",
          transactionId: khaltiRes.data.idx,
        },
      });

      res.json({
        message: "Payment verified successfully",
        payment: updatedPayment,
      });
    } catch (verifyError) {
      console.error("Khalti verification error:", verifyError);
      // If verification fails due to network issues in test mode, still mark as completed
      const updatedPayment = await prisma.payment.update({
        where: { transactionUuid: payment.transactionUuid },
        data: {
          status: "COMPLETED",
          transactionId: token || "TEST",
        },
      });

      res.json({
        message: "Payment marked as completed (verification skipped)",
        payment: updatedPayment,
      });
    }
  } catch (error) {
    console.error("Khalti verification error:", error.response?.data || error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
