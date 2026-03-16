'use server';
/**
 * @fileOverview An AI-powered messaging assistant to help service providers generate quick replies or draft responses.
 *
 * - aiMessagingAssistant - A function that generates suggested replies for messages.
 * - AIMessagingAssistantInput - The input type for the aiMessagingAssistant function.
 * - AIMessagingAssistantOutput - The return type for the aiMessagingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMessagingAssistantInputSchema = z.object({
  currentMessage: z
    .string()
    .describe(
      'The message from the client or admin that the service provider needs to respond to.'
    ),
  conversationHistory: z
    .array(
      z.object({
        sender: z.enum(['client', 'admin', 'provider']),
        text: z.string(),
      })
    )
    .optional()
    .describe('Optional: Previous messages in the conversation for context.'),
});
export type AIMessagingAssistantInput = z.infer<
  typeof AIMessagingAssistantInputSchema
>;

const AIMessagingAssistantOutputSchema = z.object({
  suggestedReply: z
    .string()
    .describe(
      'A concise suggested reply or draft response for the service provider.'
    ),
});
export type AIMessagingAssistantOutput = z.infer<
  typeof AIMessagingAssistantOutputSchema
>;

export async function aiMessagingAssistant(
  input: AIMessagingAssistantInput
): Promise<AIMessagingAssistantOutput> {
  return aiMessagingAssistantFlow(input);
}

const aiMessagingAssistantPrompt = ai.definePrompt({
  name: 'aiMessagingAssistantPrompt',
  input: {schema: AIMessagingAssistantInputSchema},
  output: {schema: AIMessagingAssistantOutputSchema},
  prompt: `You are an AI-powered messaging assistant designed to help a cleaning service provider respond efficiently to client and admin inquiries.

Your goal is to generate a concise, professional, and helpful suggested reply or draft response based on the current message and the conversation history.

If there is conversation history, use it to understand the context of the current message.

Conversation History:
{{#if conversationHistory}}
  {{#each conversationHistory}}
    {{{sender}}}: {{{text}}}
  {{/each}}
{{else}}
  No previous conversation history.
{{/if}}

Current Message from Client/Admin: {{{currentMessage}}}

Suggested Reply:`,
});

const aiMessagingAssistantFlow = ai.defineFlow(
  {
    name: 'aiMessagingAssistantFlow',
    inputSchema: AIMessagingAssistantInputSchema,
    outputSchema: AIMessagingAssistantOutputSchema,
  },
  async input => {
    const {output} = await aiMessagingAssistantPrompt(input);
    return output!;
  }
);
