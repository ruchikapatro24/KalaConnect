'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating product listings using AI.
 *
 * - generateProductListing - A function that handles the product listing generation process.
 * - GenerateProductListingInput - The input type for the generateProductListing function.
 * - GenerateProductListingOutput - The return type for the generateProductListing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductListingInputSchema = z.object({
  productImage: z
    .string()
    .describe(
      "A product image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  culturalContextPrompt: z
    .string()
    .optional()
    .describe("Optional cultural context prompt for the AI."),
});
export type GenerateProductListingInput = z.infer<typeof GenerateProductListingInputSchema>;

const GenerateProductListingOutputSchema = z.object({
  title: z.string().describe('The generated title for the product listing.'),
  description: z.string().describe('The generated description for the product.'),
  hashtags: z.array(z.string()).describe('The generated hashtags for the product.'),
  culturalContext: z
    .string()
    .describe('The generated cultural context for the product.'),
});
export type GenerateProductListingOutput = z.infer<typeof GenerateProductListingOutputSchema>;

export async function generateProductListing(
  input: GenerateProductListingInput
): Promise<GenerateProductListingOutput> {
  return generateProductListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductListingPrompt',
  input: {schema: GenerateProductListingInputSchema},
  output: {schema: GenerateProductListingOutputSchema},
  prompt: `You are an expert in creating compelling product listings for an e-commerce platform that focuses on culturally relevant products from India.

  Given a product image and an optional cultural context, generate a title, description, hashtags, and cultural context that will resonate with Indian shoppers.

  Product Image: {{media url=productImage}}

  {{~#if culturalContextPrompt}}Cultural Context Prompt: {{{culturalContextPrompt}}}{{/if}}

  Instructions:
  1.  Title: Create a concise and catchy title that highlights the product's key features and cultural relevance.
  2.  Description: Write a detailed and engaging description that elaborates on the product's benefits, materials, craftsmanship, and cultural significance.  Mention any specific festivals, traditions, or regions it is associated with.
  3.  Hashtags: Generate a list of relevant hashtags that will increase the product's visibility on social media and within the e-commerce platform.
      Include hashtags related to the product category, cultural themes, festivals, and current trends.
  4.  Cultural Context: Explain the product's cultural background, its significance in Indian society, and any stories or traditions associated with it.

  Ensure that the generated content is appropriate for a wide audience and reflects the values and sensibilities of Indian culture.

  Output the title, description, hashtags, and cultural context in JSON format.
  Remember that the output **MUST** be a JSON object.
  The hashtags field must be an array of strings.
  Here's an example of what the output should look like:
  {
      "title": "Beautiful Handcrafted Saree for Diwali",
      "description": "This exquisite saree is handcrafted by skilled artisans from Rajasthan and is perfect for celebrating Diwali. Made from pure silk and adorned with intricate embroidery, it embodies the rich cultural heritage of India.",
      "hashtags": ["#Diwali", "#Saree", "#IndianFashion", "#Handmade", "#EthnicWear"],
      "culturalContext": "Sarees are a traditional Indian garment worn by women for centuries. They symbolize grace, elegance, and cultural identity."
  }`,
});

const generateProductListingFlow = ai.defineFlow(
  {
    name: 'generateProductListingFlow',
    inputSchema: GenerateProductListingInputSchema,
    outputSchema: GenerateProductListingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
