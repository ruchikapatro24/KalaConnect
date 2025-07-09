'use server';

/**
 * @fileOverview An AI agent that provides a sales forecast and marketing advice for upcoming Indian festivals.
 *
 * - generateFestivalForecast - A function that handles the festival forecast generation.
 * - GenerateFestivalForecastInput - The input type for the generateFestivalForecast function.
 * - GenerateFestivalForecastOutput - The return type for the generateFestivalForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Product } from '@/lib/types';

// Schema for the product data the AI will analyze
const ProductForAISchema = z.object({
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
});

const GenerateFestivalForecastInputSchema = z.object({
  festivalName: z.string().describe('The name of the upcoming Indian festival (e.g., Diwali, Holi, Navratri).'),
  products: z.array(ProductForAISchema).describe('The list of products the seller currently offers.'),
});
export type GenerateFestivalForecastInput = z.infer<typeof GenerateFestivalForecastInputSchema>;

// Schema for the detailed new product idea
const NewProductIdeaSchema = z.object({
    name: z.string().describe("The name of the new product idea."),
    description: z.string().describe("A brief description of the new product, highlighting its festive appeal."),
    estimatedCostToMake: z.string().describe("An estimated cost to produce one unit of the product (e.g., '₹150-200')."),
    requiredMaterials: z.array(z.string()).describe("A list of raw materials needed to create the product."),
    productionTime: z.string().describe("An estimated time to produce one unit (e.g., '3-4 hours').")
});

const GenerateFestivalForecastOutputSchema = z.object({
  forecastSummary: z.string().describe("A brief summary of the festival's significance for e-commerce and what customers are typically looking for."),
  topProductSuggestions: z.array(z.string()).describe("A list of the seller's existing products that are most likely to sell well during this festival, with a brief reason for each."),
  marketingIdeas: z.array(z.string()).describe("A list of creative and catchy marketing slogans or campaign ideas tailored to the festival and the seller's products."),
  newProductIdeas: z.array(NewProductIdeaSchema).describe("A list of 2-3 new, related product ideas that the seller could introduce specifically for this festival, with a detailed analysis for each."),
  categorySalesForecast: z.array(z.object({
    category: z.string().describe("The product category."),
    salesBoost: z.number().describe("The predicted percentage increase in sales for this category during the festival.")
  })).describe("A sales forecast showing the potential percentage boost for different product categories.")
});
export type GenerateFestivalForecastOutput = z.infer<typeof GenerateFestivalForecastOutputSchema>;

// The exported function that calls the flow.
// This function maps the full Product[] type to the simpler ProductForAISchema for the AI.
export async function generateFestivalForecast(festivalName: string, products: Product[]): Promise<GenerateFestivalForecastOutput> {
  const aiInput: GenerateFestivalForecastInput = {
    festivalName,
    products: products.map(p => ({
        name: p.name,
        description: p.description,
        tags: p.tags,
    }))
  };
  return generateFestivalForecastFlow(aiInput);
}

const prompt = ai.definePrompt({
  name: 'generateFestivalForecastPrompt',
  input: {schema: GenerateFestivalForecastInputSchema},
  output: {schema: GenerateFestivalForecastOutputSchema},
  prompt: `You are an expert e-commerce strategist for KalaConnect, a marketplace specializing in Indian handicrafts and cultural products. Your task is to provide a sales forecast and marketing advice for a seller based on an upcoming festival.

Festival: {{{festivalName}}}

Seller's Products:
{{{json products}}}

Analyze the festival and the seller's product list to provide the following actionable insights:
1.  **Forecast Summary**: Briefly explain the shopping trends associated with the '{{{festivalName}}}' festival. What are customers looking for? What is the general mood?
2.  **Top Product Suggestions**: Identify which of the seller's existing products are a perfect fit for this festival. For each suggestion, provide a brief sentence explaining why (e.g., "*Blue Pottery Vase*: Excellent for Diwali home decor gifts.").
3.  **Marketing Ideas**: Generate catchy marketing slogans or social media campaign ideas that connect the seller's products to the spirit of '{{{festivalName}}}'.
4.  **New Product Ideas**: Based on the seller's product catalogue and the theme of '{{{festivalName}}}', suggest 2-3 innovative new products they could create. For each idea, provide a detailed analysis including: a creative name, a description, the estimated cost to make (as a string, e.g., "₹150-200"), a list of required materials, and the estimated production time per unit (e.g., "3-4 hours"). Be specific and realistic based on the seller's existing craft style.
5.  **Category Sales Forecast**: Based on the festival and the provided product list, predict the potential sales boost (as a percentage, just the number) for relevant product categories. The key for the percentage should be \`salesBoost\`. The categories should be derived from the product tags (e.g., 'home-decor', 'fashion', 'art'). Only include categories present in the seller's products. For example, for Diwali, 'home-decor' might see a 75% boost and 'spiritual' a 100% boost.

Provide the output as a valid JSON object.
`,
});

const generateFestivalForecastFlow = ai.defineFlow(
  {
    name: 'generateFestivalForecastFlow',
    inputSchema: GenerateFestivalForecastInputSchema,
    outputSchema: GenerateFestivalForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
