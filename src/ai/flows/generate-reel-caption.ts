'use server';

/**
 * @fileOverview AI flow to generate captions for shoppable reels.
 *
 * - generateReelCaption - A function that generates a reel caption.
 * - GenerateReelCaptionInput - The input type for the generateReelCaption function.
 * - GenerateReelCaptionOutput - The return type for the generateReelCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReelCaptionInputSchema = z.object({
  productDescription: z.string().describe('The description of the product(s) showcased in the reel.'),
  videoContentSummary: z.string().describe('A summary of the video content in the reel.'),
  brandName: z.string().describe('The name of the brand or seller.'),
  targetAudience: z
    .string()
    .optional()
    .describe('The target audience for the reel (e.g., teenagers, young adults, fashion enthusiasts).'),
});
export type GenerateReelCaptionInput = z.infer<typeof GenerateReelCaptionInputSchema>;

const GenerateReelCaptionOutputSchema = z.object({
  caption: z.string().describe('The generated caption for the reel.'),
});
export type GenerateReelCaptionOutput = z.infer<typeof GenerateReelCaptionOutputSchema>;

export async function generateReelCaption(input: GenerateReelCaptionInput): Promise<GenerateReelCaptionOutput> {
  return generateReelCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReelCaptionPrompt',
  input: {schema: GenerateReelCaptionInputSchema},
  output: {schema: GenerateReelCaptionOutputSchema},
  prompt: `You are an AI assistant that specializes in creating engaging captions for shoppable reels.

  Given the following information, generate a creative and engaging caption for the reel.

  Brand Name: {{brandName}}
  Product Description: {{productDescription}}
  Video Content Summary: {{videoContentSummary}}
  Target Audience (if available): {{targetAudience}}

  The caption should be concise, attention-grabbing, and encourage viewers to check out the products featured in the reel. Include relevant hashtags to increase visibility.
  `,
});

const generateReelCaptionFlow = ai.defineFlow(
  {
    name: 'generateReelCaptionFlow',
    inputSchema: GenerateReelCaptionInputSchema,
    outputSchema: GenerateReelCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
