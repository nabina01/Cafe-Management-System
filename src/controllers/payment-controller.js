import prisma from "../utils/prisma-client.js"
import axios from "axios";
import { generateHmacSha256Hash } from "../utils/helper.js";

export const initiatePayment = async (req, res) => {
  const {
    amount,
    paymentGateway, // "cash" | "esewa"
    reservationId,
    productName,
  } = req.body;

  try {
    // 💵 Cash Payment
    if (paymentGateway === "cash") {
      const payment = await prisma.payment.create({
        data: {
          amount,
          method: "CASH",
          status: "COMPLETED",
          reservationId,
        },
      });

      return res.status(200).json({
        message: "Cash payment completed",
        payment,
      });
    }

    // 🌐 ESEWA
    if (paymentGateway !== "esewa") {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const transactionUuid = `TXN-${Date.now()}`;

    await prisma.payment.create({
      data: {
        amount,
        method: "ESEWA",
        status: "PENDING",
        reservationId,
        transactionUuid,
      },
    });

    const paymentData = {
      amount,
      total_amount: amount,
      transaction_uuid: transactionUuid,
      product_code: process.env.ESEWA_MERCHANT_ID,
      success_url: process.env.SUCCESS_URL,
      failure_url: process.env.FAILURE_URL,
      tax_amount: "0",
      product_service_charge: "0",
      product_delivery_charge: "0",
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    const data = `total_amount=${paymentData.total_amount},transaction_uuid=${transactionUuid},product_code=${paymentData.product_code}`;
    const signature = generateHmacSha256Hash(data, process.env.ESEWA_SECRET);

    return res.json({
      url: `${process.env.ESEWA_PAYMENT_URL}?${new URLSearchParams({
        ...paymentData,
        signature,
      })}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment initiation failed" });
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
