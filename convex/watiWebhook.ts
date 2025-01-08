import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from 'openai';
import { chatCompletion } from './service/openai';
import { callMockAPI } from './lib/mockapi';

import { trim_array, getUniqueId } from './lib/utils';
import get_weather from './lib/get_weather.json';
import get_availablity from './lib/get_availablity.json';
import get_events from './lib/get_events.json';
import get_event from './lib/get_event.json';
import search_hotel from './lib/search_hotel.json';
import get_hotel from './lib/get_hotel.json';
import reserve_hotel from './lib/reserve_hotel.json';
import get_reservation from './lib/get_reservation.json';
import { checkDoctorAvailability } from "./lib/mockconvex";

const WATI_API_URL = process.env.WATI_API_URL!;
const WATI_API_TOKEN = process.env.WATI_API_TOKEN!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!WATI_API_URL || !WATI_API_TOKEN || !OPENAI_API_KEY) {
  throw new Error("Missing required environment variables");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface Message {
  id: string;
  created_at: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
}

interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface WatiWebhookPayload {
  id: string;
  created?: string;
  whatsappMessageId: string;
  conversationId: string;
  ticketId: string;
  text: string;
  type: string;
  data: any;
  timestamp: string;
  owner: boolean;
  eventType: string;
  statusString: string;
  avatarUrl?: string | null;
  assignedId: string;
  operatorName: string;
  operatorEmail: string;
  waId: string;
  messageContact?: any;
  senderName?: string;
  listReply?: any;
  replyContextId?: any;
}

const OFFICE_HOURS = {
  open: 10,
  close: 17
};

class WhatsAppChatIntegration {
  private messageItems: Message[] = [];
  private MAX_LOOP_COUNT = 10;
  private phoneNumber: string;
  private conversationId1: string;

  private ctx: any;

  constructor(phoneNumber: string,conversationId1: string, ctx: any) {
    this.phoneNumber = phoneNumber;
    this.conversationId1 = conversationId1;
    this.ctx = ctx;
  }

  public async handleIncomingMessage(text: string): Promise<Message[]> {
    const newUserMessage: Message = {
      id: getUniqueId(),
      created_at: new Date().toISOString(),
      role: 'user',
      content: text
    };
    this.messageItems.push(newUserMessage);

    let result_tools: ToolCall[] = [];
    let isCompleted = false;
    let loopCount = 0;

    try {
      do {
        const result = result_tools.length > 0
          ? await this.processToolCalls(result_tools)
          : await this.processMessage(text);

        console.log(result);

        if (result.output?.content) {
          console.log(result.output.content);

          const newAssistantMessage: Message = {
            id: getUniqueId(),
            created_at: new Date().toISOString(),
            role: 'assistant',
            content: result.output.content
          };
          this.messageItems.push(newAssistantMessage);
        }

        if (result.output?.tool_calls) {
          loopCount++;
          
          if (loopCount >= this.MAX_LOOP_COUNT) {
            isCompleted = true;
          } else {
            result_tools = result.output.tool_calls;
          }
        } else {
          isCompleted = true;
        }

      } while (!isCompleted);

    } catch (error) {
      console.error('Error in handleIncomingMessage:', error);
    }

    return this.messageItems;
  }

  private async processToolCalls(tools: ToolCall[]): Promise<{ output: any }> {
    console.log('tool_calls', tools, new Date().toLocaleTimeString());

    let tools_output = [];

    for (let tool of tools) {
      let tool_args = JSON.parse(tool.function.arguments);

      const tool_output = checkDoctorAvailability(tool.function.name, tool_args);

      tools_output.push({
        tool_call_id: tool.id,
        role: 'tool' as const,
        name: tool.function.name,
        content: JSON.stringify(tool_output, null, 2)
      });
    }

    console.log('tools-api-output', tools_output);

    let context = await this.getContext();

    const messages = [
      { role: 'system', content: this.getSystemPrompt() },
      ...context,
      { role: 'assistant', content: null, tool_calls: tools },
      ...tools_output
    ];

    try {
      let result = await chatCompletion({
        temperature: 0.3,
        messages,
        tools: this.getTools()
      });

      console.log('chat-summary', result);

      return { output: result.message };
    } catch (error) {
      console.error('Error in processToolCalls:', error);
      return { output: null };
    }
  }

  private async processMessage(inquiry: string): Promise<{ output: any }> {
    console.log('user', inquiry, new Date().toLocaleTimeString());

    let context = await this.getContext();

    const messages = [
      { role: 'system', content: this.getSystemPrompt() },
      ...context,
      { role: 'user', content: inquiry }
    ];

    try {
      let result = await chatCompletion({
        temperature: 0.3,
        messages,
        tools: this.getTools()
      });

      console.log('function-calling', result);

      return { output: result.message };
    } catch (error) {
      console.error('Error in processMessage:', error);
      return { output: null };
    }
  }

  private async getContext(): Promise<{ role: string; content: string }[]> {
    try {
      console.log(`Fetching conversation context for phoneNumber: ${this.phoneNumber}`);
      const messages = await this.ctx.runQuery(internal.messages.getConversationMessages, { conversationId: this.conversationId1, limit: 5 });
      const context = messages.map((m: { direction: string; content: any; }) => ({
        role: m.direction === 'inbound' ? 'user' : 'assistant',
        content: m.content
      }));
      console.log(`Conversation context retrieved: ${JSON.stringify(context)}`);
      return [...context, ...this.messageItems];
    } catch (error) {
      console.error(`Error getting conversation context: ${error}`);
      return this.messageItems;
    }
  }

  private getSystemPrompt(): string {
    const today = new Date();
    return `You are a helpful personal assistant.\n\n` +
      `# Tools\n` +
      `You have the following tools that you can invoke based on the user inquiry.\n` +
      `- get_availability, when the user wants to know the appoitments given a doctor and date.\n` +

      `# User\n` +
      `If my full name is needed, please ask me for my full name.\n\n` +
      `# Language Support\n` +
      `Please reply in the language used by the user.\n\n` +
      `Today is ${today}`;
  }

  private getTools() {
    return [
      { type: 'function', function: get_availablity }
    ];
  }
}

async function sendMessage(phoneNumber: string, message: string) {
  console.log(`Attempting to send message to ${phoneNumber}: ${message}`);
  const url = `${WATI_API_URL}/api/v1/sendSessionMessage/${phoneNumber}?messageText=${encodeURIComponent(message)}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `${WATI_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send message: ${response.status}, ${errorText}`);
      throw new Error(`Failed to send message: ${response.status}, ${errorText}`);
    }

    console.log(`Message sent successfully to ${phoneNumber}`);
    return await response.json();
  } catch (error) {
    console.error(`Error in sendMessage: ${error}`);
    throw error;
  }
}

export const handleWatiWebhook = httpAction(async (ctx, request) => {
  try {
    const payload = await request.json() as WatiWebhookPayload;
    console.log("Incoming webhook payload:", JSON.stringify(payload));

    if (payload.eventType === "sessionMessageSent" && payload.owner === true) {
      console.log("Bot message received, ignoring");
      return new Response(JSON.stringify({ status: "success", message: "Bot message received, ignoring" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (payload.eventType !== "message" || (payload.type !== "interactive" && payload.type !== "text")) {
      console.log("Non-text or non-user message received, ignoring");
      return new Response(JSON.stringify({ status: "success", message: "Non-text or non-user message received, ignoring" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const phoneNumber = payload.waId;
    const userMessage = payload.text;

    console.log(`Processing incoming message from ${phoneNumber}: ${userMessage}`);

    await ctx.runMutation(internal.messages.createMessage, {
      phoneNumber,
      content: userMessage,
      direction: "inbound",
      timestamp: payload.timestamp,
      messageId: payload.id,
      conversationId: payload.conversationId
    });
    console.log("Incoming message persisted");

    const whatsAppIntegration = new WhatsAppChatIntegration(phoneNumber, payload.conversationId,ctx);
    const response = await whatsAppIntegration.handleIncomingMessage(userMessage);

    const lastAssistantMessage = response
      .filter(msg => msg.role === 'assistant')
      .pop();

    if (!lastAssistantMessage) {
      throw new Error('No assistant response generated');
    }

    await sendMessage(phoneNumber, lastAssistantMessage.content);
    console.log("Response sent successfully");

    await ctx.runMutation(internal.messages.createMessage, {
      phoneNumber,
      content: lastAssistantMessage.content,
      direction: "outbound",
      timestamp: Date.now().toString(),
      messageId: `response_${payload.id}`,
      conversationId: payload.conversationId
    });

    return new Response(JSON.stringify({ status: "success", message: "Message processed and replied" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in handleWatiWebhook:", error);
    return new Response(JSON.stringify({ status: "error", message: "Error processing message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
