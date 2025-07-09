
// src/ai/flows/conversational-product-search.ts
'use server';

/**
 * @fileOverview A conversational product search AI agent.
 *
 * - conversationalProductSearch - A function that handles the conversational product search process.
 * - ConversationalProductSearchInput - The input type for the conversationalProductSearch function.
 * - ConversationalProductSearchOutput - The return type for the conversationalProductSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { mockProducts } from '@/lib/mock-data';

const ConversationalProductSearchInputSchema = z.object({
  query: z.string().describe('The user query for product search.'),
});
export type ConversationalProductSearchInput = z.infer<typeof ConversationalProductSearchInputSchema>;

// Define the schema for a single product to be used in the array.
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
  sellerId: z.string(),
  tags: z.array(z.string()).optional(),
  culturalContext: z.string().optional(),
  aiGenerated: z.boolean().optional(),
  dataAiHint: z.string().optional(),
});


const ConversationalProductSearchOutputSchema = z.object({
  response: z.string().describe('The response to the user query.'),
  products: z.array(ProductSchema).describe('The products found based on the query.'),
});
export type ConversationalProductSearchOutput = z.infer<typeof ConversationalProductSearchOutputSchema>;

export async function conversationalProductSearch(input: ConversationalProductSearchInput): Promise<ConversationalProductSearchOutput> {
  return conversationalProductSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalProductSearchPrompt',
  input: {schema: ConversationalProductSearchInputSchema},
  output: {schema: ConversationalProductSearchOutputSchema},
  prompt: `You are a conversational assistant for an Indian e-commerce store called KalaConnect. Your goal is to help users find products from the store based on their query.

  You have access to the following list of products available in the store:
  ${JSON.stringify(mockProducts, null, 2)}

  Analyze the user's query: {{{query}}}

  Based on the query, identify relevant products from the list.
  
  Your response should be friendly and conversational. Mention the products you found that match the query.
  
  Return a JSON object with two fields:
  1. "response": A string containing your conversational reply to the user.
  2. "products": A JSON array of the FULL product objects that you found. If no products match, return an empty array.
  
  Example: if the query is "show me some home decor", you might find the "Blue Pottery Vase" and respond conversationally, including the full product object in the 'products' array.
  `,
});

const conversationalProductSearchFlow = ai.defineFlow(
  {
    name: 'conversationalProductSearchFlow',
    inputSchema: ConversationalProductSearchInputSchema,
    outputSchema: ConversationalProductSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
