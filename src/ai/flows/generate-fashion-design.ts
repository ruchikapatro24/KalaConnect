
'use server';
/**
 * @fileOverview An AI agent for creating innovative fashion designs.
 *
 * - generateFashionDesign - A function that handles the fashion design generation.
 * - GenerateFashionDesignInput - The input type for the generateFashionDesign function.
 * - GenerateFashionDesignOutput - The return type for the generateFashionDesign function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFashionDesignInputSchema = z.object({
  occasion: z.string().describe('e.g., Wedding, Casual, Formal, Festive'),
  style: z.string().describe('e.g., Modern, Traditional, Fusion, Minimalist'),
  colorPalette: z.string().describe('e.g., Pastel Pinks, Royal Blues, Earthy Tones'),
  userPrompt: z
    .string()
    .describe('Any other specific ideas or requirements from the user.'),
});
export type GenerateFashionDesignInput = z.infer<typeof GenerateFashionDesignInputSchema>;

const GenerateFashionDesignOutputSchema = z.object({
  designName: z.string().describe("A creative and evocative name for the outfit."),
  description: z.string().describe("A detailed description of the apparel, including silhouette, cut, and style, blending traditional Indian elements with contemporary fashion. This should be vivid enough to be used for image generation."),
  fabricSuggestions: z.array(z.string()).describe("A list of suitable fabrics and why they are a good choice."),
  designImageUri: z.string().describe("A data URI of the generated apparel design image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateFashionDesignOutput = z.infer<typeof GenerateFashionDesignOutputSchema>;


export async function generateFashionDesign(input: GenerateFashionDesignInput): Promise<GenerateFashionDesignOutput> {
  return generateFashionDesignFlow(input);
}


const designConceptPrompt = ai.definePrompt({
    name: 'designConceptPrompt',
    input: { schema: GenerateFashionDesignInputSchema },
    output: { schema: z.object({
        designName: z.string().describe("A creative and evocative name for the outfit."),
        description: z.string().describe("A detailed description of the apparel, including silhouette, cut, and style, blending traditional Indian elements with contemporary fashion. This should be vivid enough to be used as a prompt to generate an image of the design."),
        fabricSuggestions: z.array(z.string()).describe("A list of suitable fabrics and why they are a good choice."),
    })},
    prompt: `You are a visionary fashion designer for KalaConnect, an e-commerce platform specializing in blending traditional Indian craftsmanship with modern fashion. Your task is to create an innovative apparel design concept based on the user's preferences.

    User Preferences:
    - Occasion: {{{occasion}}}
    - Style: {{{style}}}
    - Color Palette: {{{colorPalette}}}
    - Specific Ideas: {{{userPrompt}}}

    Based on these preferences, generate the following:
    1.  **Design Name**: A creative and evocative name for the outfit.
    2.  **Description**: A detailed description of the apparel. Describe the silhouette, cut, style, and how it blends traditional Indian elements (like embroidery styles, prints, or drapes) with contemporary fashion trends. Be vivid and detailed.
    3.  **Fabric Suggestions**: A list of suitable fabrics, explaining why they are a good choice (e.g., "Banarasi Silk for a regal feel, paired with lightweight Georgette for a modern drape").
    `
});


const generateFashionDesignFlow = ai.defineFlow(
  {
    name: 'generateFashionDesignFlow',
    inputSchema: GenerateFashionDesignInputSchema,
    outputSchema: GenerateFashionDesignOutputSchema,
  },
  async (input) => {
    // 1. Generate the design concept (text)
    const { output: textOutput } = await designConceptPrompt(input);
    if (!textOutput) {
        throw new Error("Failed to generate design concept.");
    }

    // 2. Generate the image based on the description
    const imagePrompt = `A photorealistic image of a fashion design. ${textOutput.description}. The style is ${input.style}, for a ${input.occasion} occasion. The color palette is ${input.colorPalette}.`;
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
        throw new Error("Failed to generate design image.");
    }
    
    // 3. Combine and return the final output
    return {
        ...textOutput,
        designImageUri: media.url,
    };
  }
);
