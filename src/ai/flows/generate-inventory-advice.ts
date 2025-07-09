
'use server';

/**
 * @fileOverview An AI agent that analyzes a seller's inventory and sales data to provide actionable advice.
 *
 * - generateInventoryAdvice - A function that handles the inventory analysis.
 * - GenerateInventoryAdviceInput - The input type for the generateInventoryAdvice function.
 * - GenerateInventoryAdviceOutput - The return type for the generateInventoryAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Product } from '@/lib/types';


// Define a Zod schema for the Product that matches what the AI needs
const ProductForAISchema = z.object({
  name: z.string(),
  stock: z.number(),
  price: z.number(),
  tags: z.array(z.string()).optional(),
  sales: z.array(z.object({
    month: z.string(),
    unitsSold: z.number(),
  })).optional(),
});


const GenerateInventoryAdviceInputSchema = z.object({
  products: z.array(ProductForAISchema),
});
export type GenerateInventoryAdviceInput = z.infer<typeof GenerateInventoryAdviceInputSchema>;

const GenerateInventoryAdviceOutputSchema = z.object({
  restockSuggestions: z.array(z.string()).describe('List of product names that should be restocked urgently based on high sales and low stock.'),
  slowMovers: z.array(z.string()).describe('List of product names that are selling poorly and have high stock.'),
  newProductIdeas: z.array(z.string()).describe('List of 2-3 new, related product ideas based on the seller\'s popular product tags and themes.'),
});
export type GenerateInventoryAdviceOutput = z.infer<typeof GenerateInventoryAdviceOutputSchema>;

// The exported function that calls the flow.
// We need to map the full Product type to the simpler ProductForAISchema
export async function generateInventoryAdvice(products: Product[]): Promise<GenerateInventoryAdviceOutput> {
  const aiInput: GenerateInventoryAdviceInput = {
    products: products.map(p => ({
        name: p.name,
        stock: p.stock,
        price: p.price,
        tags: p.tags,
        sales: p.sales,
    }))
  };
  return generateInventoryAdviceFlow(aiInput);
}

const prompt = ai.definePrompt({
  name: 'generateInventoryAdvicePrompt',
  input: {schema: GenerateInventoryAdviceInputSchema},
  output: {schema: GenerateInventoryAdviceOutputSchema},
  prompt: `You are an expert e-commerce analyst for KalaConnect, a marketplace for Indian handicrafts. Analyze the following JSON data for a seller's products. Each product includes its current stock level and sales data for the past few months.

Product Data:
{{{json products}}}

Your task is to provide actionable inventory advice. Based on sales trends and stock levels, identify:
1.  **Restock Suggestions**: Products that are selling well (e.g., high average monthly sales) and have low stock (e.g., less than 2 months of inventory at the current sales rate). These are urgent priorities.
2.  **Slow Movers**: Products that are not selling well (low average monthly sales) and have high stock. The seller might consider discounts or discontinuing them.
3.  **New Product Ideas**: Based on the seller's most popular product tags and themes (e.g., 'home-decor', 'pottery', 'Jaipur'), suggest 2-3 new, related product ideas they could introduce. Be creative and specific.

Provide the output as a valid JSON object with three keys: "restockSuggestions", "slowMovers", and "newProductIdeas", each containing an array of concise, actionable strings.
`,
});

const generateInventoryAdviceFlow = ai.defineFlow(
  {
    name: 'generateInventoryAdviceFlow',
    inputSchema: GenerateInventoryAdviceInputSchema,
    outputSchema: GenerateInventoryAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
