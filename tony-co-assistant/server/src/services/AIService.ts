import OpenAI from 'openai';
import { IMessage } from '../models/Message';
import { ISummary } from '../models/Summary';

class AIService {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.systemPrompt = `You are Tony, an AI co-creation assistant focused on UX and design. 
    You have access to a UX-Repository and School Bench that contain knowledge about design patterns, 
    user research, and organizational methods. Use this knowledge to provide informed, contextual responses.
    
    Guidelines:
    1. Always maintain traceability to source materials
    2. Be specific and actionable in your suggestions
    3. Consider both UX-Repository and School Bench knowledge
    4. Provide reasoning for your suggestions
    5. Learn from interactions and feedback`;
  }

  async generateResponse(
    userMessage: string,
    context: {
      messages: IMessage[];
      summaries: ISummary[];
    }
  ): Promise<string> {
    try {
      // Prepare conversation history
      const conversationHistory = context.messages
        .slice(-5) // Get last 5 messages for context
        .map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

      // Prepare relevant summaries as context
      const relevantSummaries = context.summaries
        .map((summary) => `[${summary.type}] ${summary.title}: ${summary.summaryContent}`)
        .join('\n');

      const messages = [
        { role: 'system', content: this.systemPrompt },
        { role: 'system', content: `Relevant knowledge:\n${relevantSummaries}` },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateSummary(
    rawContent: string,
    type: 'ux-repository' | 'school-bench'
  ): Promise<string> {
    try {
      const prompt = `Generate a concise summary of the following ${type} content. 
      Focus on key insights and actionable points. 
      Maintain traceability to the source material.
      
      Content:
      ${rawContent}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      return response.choices[0].message.content || 'Failed to generate summary.';
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }
}

export default new AIService(); 