import type { NextApiRequest, NextApiResponse } from "next";
import type { DefaultResponse } from "src/types/shared";

import Stripe from "stripe";
import { OrderStatus } from "@prisma/client";
import { buffer } from "micro";

import RouteHandler from "@Lib/RouteHandler";
import prisma from "@Lib/prisma";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-08-01",
  typescript: true,
});

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // generated ethereal user
    pass: process.env.EMAIL_PASS, // generated ethereal password
  },
});

async function ConfirmPayment(
  req: NextApiRequest,
  res: NextApiResponse<DefaultResponse>
) {
  const sig = req.headers["stripe-signature"];
  const reqBuffer = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      reqBuffer,
      sig ?? "",
      endpointSecret ?? ""
    );
  } catch (err) {
    if (err instanceof Error)
      res
        .status(400)
        .json({ error: true, message: `Webhook Error: ${err.message}` });
    return;
  }

  if (event.type == "checkout.session.completed") {
    const session = event.data.object;
    // @ts-ignore
    const { orderId, userId } = session.metadata;
    const { payment_status } = session as any;

    try {
      if (payment_status == "paid") {
        await prisma.order.update({
          where: { id: Number(orderId) },
          data: { status: OrderStatus.PAYMENT_RECEIVED },
        });

        const cart = await prisma.cart.findUnique({
          where: { userId: userId },
        });

        if (!cart) {
          return res.status(400).json({ success: false, message: "Cart not found" });
        }

        const orderLineItems = await prisma.orderLine.findMany({
          where: { orderId: Number(orderId) },
        });

        for await (const item of orderLineItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              salesCount: { increment: 1 },
              stockQty: { decrement: item.quantity },
            },
          });
          await prisma.cartItem.delete({
            where: {
              cartId_productId: { cartId: cart.id, productId: item.productId },
            },
          });
        }

        // Fetch user details for email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, firstName: true },
        });

        if (user) {
          // Send confirmation email
          await transporter.sendMail({
            from: `"Your Company" <${process.env.EMAIL_USER}>`, // sender address
            to: user.email, // list of receivers
            subject: "Order Confirmation", // Subject line
            text: `Hi ${user.firstName || ''}, your order #${orderId} has been successfully confirmed. Thank you for your purchase!`, // plain text body
            html: `<p>Hi ${user.firstName || ''},</p>
                   <p>Your order #${orderId} has been successfully confirmed.</p>
                   <p>Thank you for your purchase!</p>`, // html body
          });
        }

        return res.json({ success: true, message: "Payment confirmed and email sent" });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, message: "Error processing payment" });
    }
  }

  res.status(400).json({ success: false, message: "Unhandled event type" });
}

export default RouteHandler().post(ConfirmPayment);
