'use server';
/**
 * @fileOverview An AI agent that analyzes customer reviews to provide sentiment analysis.
 *
 * - analyzeReviewSentiment - A function that handles the review sentiment analysis.
 * - AnalyzeReviewSentimentInput - The input type for the analyzeReviewSentiment function.
 * - AnalyzeReviewSentimentOutput - The return type for the analyzeReviewSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Product } from '@/lib/types';

const ReviewForAISchema = z.object({
  productName: z.string(),
  rating: z.number(),
  comment: z.string(),
});

const AnalyzeReviewSentimentInputSchema = z.object({
  reviews: z.array(ReviewForAISchema).describe('A list of customer reviews for various products.'),
});
export type AnalyzeReviewSentimentInput = z.infer<typeof AnalyzeReviewSentimentInputSchema>;


const AnalyzeReviewSentimentOutputSchema = z.object({
  overallSentiment: z.enum(['Positive', 'Negative', 'Neutral']).describe("The overall sentiment derived from all reviews."),
  sentimentScore: z.number().min(0).max(10).describe("A score from 0 (very negative) to 10 (very positive) representing the overall sentiment."),
  positiveKeywords: z.array(z.string()).describe("A list of keywords or themes frequently mentioned in positive reviews (e.g., 'beautiful design', 'great quality')."),
  negativeKeywords: z.array(z.string()).describe("A list of keywords or themes frequently mentioned in negative reviews (e.g., 'late delivery', 'color mismatch')."),
  actionableSuggestions: z.array(z.string()).describe("A list of 2-3 concrete, actionable suggestions for the seller to improve their products or service based on the feedback."),
});
export type AnalyzeReviewSentimentOutput = z.infer<typeof AnalyzeReviewSentimentOutputSchema>;

// The exported function that calls the flow.
// This function maps the full Product[] type to the simpler input for the AI.
export async function analyzeReviewSentiment(products: Product[]): Promise<AnalyzeReviewSentimentOutput> {
  const allReviews: z.infer<typeof ReviewForAISchema>[] = products.flatMap(p => 
    p.reviews?.map(r => ({
      productName: p.name,
      rating: r.rating,
      comment: r.comment,
    })) || []
  );

  if (allReviews.length === 0) {
    throw new Error("No reviews available to analyze.");
  }

  const aiInput: AnalyzeReviewSentimentInput = { reviews: allReviews };
  return analyzeReviewSentimentFlow(aiInput);
}

const prompt = ai.definePrompt({
  name: 'analyzeReviewSentimentPrompt',
  input: {schema: AnalyzeReviewSentimentInputSchema},
  output: {schema: AnalyzeReviewSentimentOutputSchema},
  prompt: `You are an expert customer experience analyst for KalaConnect, an e-commerce marketplace for Indian handicrafts. Your task is to analyze customer reviews for a seller and provide a detailed sentiment analysis.

Reviews Data:
{{{json reviews}}}

Based on the provided reviews, perform the following analysis:
1.  **Overall Sentiment**: Determine if the general sentiment is 'Positive', 'Negative', or 'Neutral'.
2.  **Sentiment Score**: Provide a score from 0 (extremely negative) to 10 (extremely positive). A score of 5 is neutral. Base this on the ratings and the tone of the comments.
3.  **Positive Keywords**: Identify and list the top 3-5 recurring positive themes or keywords. What do customers love? (e.g., "craftsmanship", "vibrant colors", "secure packaging").
4.  **Negative Keywords**: Identify and list the top 3-5 recurring negative themes or keywords. What are the common complaints? (e.g., "smaller than expected", "late delivery", "color difference").
5.  **Actionable Suggestions**: Based on the feedback, provide 2-3 concrete, actionable suggestions for the seller to improve their products, listings, or service. For example, if reviews mention size issues, suggest adding product dimensions to the description.

Provide the output as a valid JSON object.
`,
});

const analyzeReviewSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeReviewSentimentFlow',
    inputSchema: AnalyzeReviewSentimentInputSchema,
    outputSchema: AnalyzeReviewSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
