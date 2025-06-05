// import { BadRequestException, Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { CreatePaymentIntentDto } from 'src/presentation/dtos/create-payment-intent.dto';
// import Stripe from 'stripe';

// @Injectable()
// export class PaymentService {
//   private stripe: Stripe;

//   constructor(private configService: ConfigService) {
//     this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY_TEST'), {
//       apiVersion: '2025-05-28.basil',
//     });
//   }

//   async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto) {
//     try {
//       const { amount, currency, description, customerId, metadata } =
//         createPaymentIntentDto;

//       const paymentIntent = await this.stripe.paymentIntents.create({
//         amount: Math.round(amount * 100), // Stripe erwartet Cents
//         currency: currency.toLowerCase(),
//         description,

//         customer: customerId,
//         metadata,
//         automatic_payment_methods: {
//           enabled: true,
//         },
//       });

//       return {
//         clientSecret: paymentIntent.client_secret,
//         paymentIntentId: paymentIntent.id,
//       };
//     } catch (error) {
//       console.error('Fehler beim Erstellen des Payment Intents:', error);
//       throw new BadRequestException(
//         `Payment Intent konnte nicht erstellt werden: ${error.message}`,
//       );
//     }
//   }
// }
