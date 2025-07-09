'use server';

/**
 * @fileOverview An AI agent that expands a seller's brief story into a compelling narrative.
 *
 * - expandSellerStory - A function that handles the expansion of the seller story.
 * - ExpandSellerStoryInput - The input type for the expandSellerStory function.
 * - ExpandSellerStoryOutput - The return type for the expandSellerStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandSellerStoryInputSchema = z.object({
  briefStory: z
    .string()
    .describe('A brief description of the seller brand, its origin, values, and local roots.'),
});
export type ExpandSellerStoryInput = z.infer<typeof ExpandSellerStoryInputSchema>;

const ExpandSellerStoryOutputSchema = z.object({
  expandedStory: z
    .string()
    .describe('A compelling narrative of the seller brand, expanded from the brief description.'),
});
export type ExpandSellerStoryOutput = z.infer<typeof ExpandSellerStoryOutputSchema>;

export async function expandSellerStory(input: ExpandSellerStoryInput): Promise<ExpandSellerStoryOutput> {
  return expandSellerStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expandSellerStoryPrompt',
  input: {schema: ExpandSellerStoryInputSchema},
  output: {schema: ExpandSellerStoryOutputSchema},
  prompt: `You are a skilled storyteller, adept at crafting compelling narratives that connect with customers.

  Expand the following brief description of a seller brand into a full, engaging story that highlights its origin, values, and local roots. The story should evoke a sense of connection and trust with potential customers.

  Brief Description: {{{briefStory}}}`,
});

const expandSellerStoryFlow = ai.defineFlow(
  {
    name: 'expandSellerStoryFlow',
    inputSchema: ExpandSellerStoryInputSchema,
    outputSchema: ExpandSellerStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
