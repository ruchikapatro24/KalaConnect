
'use server';
/**
 * @fileOverview An AI agent for generating promotional video reel assets.
 *
 * - generatePromoReel - A function that generates a script and caption for a promo reel.
 * - GeneratePromoReelInput - The input type for the generatePromoReel function.
 * - GeneratePromoReelOutput - The return type for the generatePromoReel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromoReelInputSchema = z.object({
  productImage: z
    .string()
    .describe(
      "The product image as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productName: z.string().describe('The name of the product being promoted.'),
  productDescription: z
    .string()
    .describe('A brief description of the product.'),
});
export type GeneratePromoReelInput = z.infer<typeof GeneratePromoReelInputSchema>;

const GeneratePromoReelOutputSchema = z.object({
  caption: z
    .string()
    .describe(
      'A short, engaging caption for the Instagram/Facebook Reel, including relevant hashtags.'
    ),
  script: z
    .string()
    .describe(
      'A 5-10 second video script. Include scene descriptions (like "Close up on product," "Fast cuts of product in use") and text overlays/subtitles for each scene.'
    ),
});
export type GeneratePromoReelOutput = z.infer<typeof GeneratePromoReelOutputSchema>;

export async function generatePromoReel(
  input: GeneratePromoReelInput
): Promise<GeneratePromoReelOutput> {
  return generatePromoReelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromoReelPrompt',
  input: {schema: GeneratePromoReelInputSchema},
  output: {schema: GeneratePromoReelOutputSchema},
  prompt: `You are a creative social media marketing expert for KalaConnect, an e-commerce platform for Indian handicrafts. Your task is to generate assets for a short promotional video reel (5-10 seconds) for the following product.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
Product Image: {{media url=productImage}}

Based on the product, generate the following:

1.  **Script**: A concise script for a 5-10 second video. The script should be formatted with scene descriptions and corresponding text overlays (subtitles). For example:
    *   (Scene: Slow zoom on the product, showcasing details)
        Text: Handcrafted with passion.
    *   (Scene: Quick cuts showing the product from different angles)
        Text: Beauty in every detail.
    *   (Scene: Product displayed in a lifestyle setting)
        Text: Find yours at KalaConnect.

2.  **Caption**: An engaging and short caption for the reel. Include a call-to-action and relevant, popular hashtags.

Provide the output as a valid JSON object with two keys: "script" and "caption".`,
});

const generatePromoReelFlow = ai.defineFlow(
  {
    name: 'generatePromoReelFlow',
    inputSchema: GeneratePromoReelInputSchema,
    outputSchema: GeneratePromoReelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
