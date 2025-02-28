const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', async (req, res) => {
    try {
        const { amount, token } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method: token.id,
            confirmation_method: 'manual',  // 'manual' requires confirmation from the client side
            confirm: true,  // Automatically confirms the payment
        });

        res.status(200).json({
            success: true,
            paymentIntent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


module.exports = router;

