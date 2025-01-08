import { chatCompletion } from './service/openai'
import { callMockAPI } from './lib/mockapi'
import { trim_array, getUniqueId } from './lib/utils'
import get_weather from './lib/get_weather.json'
import get_events from './lib/get_events.json'
import get_event from './lib/get_event.json'
import search_hotel from './lib/search_hotel.json'
import get_hotel from './lib/get_hotel.json'
import reserve_hotel from './lib/reserve_hotel.json'
import get_reservation from './lib/get_reservation.json'
import { httpAction } from './_generated/server'

interface Message {
  id: string
  created_at: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls?: ToolCall[]
}

interface ToolCall {
  id: string
  function: {
    name: string
    arguments: string
  }
}

interface ChatCompletionResult {
  message: {
    content: string | null
    tool_calls?: ToolCall[]
  }
}

export class WhatsAppChatIntegration {
  private messageItems: Message[] = []
  private MAX_LOOP_COUNT = 10

  constructor() {}

  public async handleIncomingMessage1(text: string): Promise<Message[]> {
    const newUserMessage: Message = {
      id: getUniqueId(),
      created_at: new Date().toISOString(),
      role: 'user',
      content: text
    }
    this.messageItems.push(newUserMessage)

    let result_tools: ToolCall[] = []
    let isCompleted = false
    let loopCount = 0

    try {
      do {
        const result = result_tools.length > 0
          ? await this.processToolCalls(result_tools)
          : await this.processMessage(text)

        console.log(result)

        if (result.output?.content) {
          console.log(result.output.content)

          const newAssistantMessage: Message = {
            id: getUniqueId(),
            created_at: new Date().toISOString(),
            role: 'assistant',
            content: result.output.content
          }
          this.messageItems.push(newAssistantMessage)
        }

        if (result.output?.tool_calls) {
          loopCount++
          
          if (loopCount >= this.MAX_LOOP_COUNT) {
            isCompleted = true
          } else {
            result_tools = result.output.tool_calls
          }
        } else {
          isCompleted = true
        }

      } while (!isCompleted)

    } catch (error) {
      console.error('Error in handleIncomingMessage:', error)
    }

    return this.messageItems
  }

  private async processToolCalls(tools: ToolCall[]): Promise<{ output: ChatCompletionResult['message'] | null }> {
    console.log('tool_calls', tools, new Date().toLocaleTimeString())

    let tools_output = []

    for (let tool of tools) {
      let tool_args = JSON.parse(tool.function.arguments)

      const tool_output = callMockAPI(tool.function.name, tool_args)

      tools_output.push({
        tool_call_id: tool.id,
        role: 'tool' as const,
        name: tool.function.name,
        content: JSON.stringify(tool_output, null, 2)
      })
    }

    console.log('tools-api-output', tools_output)

    let context = this.getContext()

    const messages = [
      { role: 'system', content: this.getSystemPrompt() },
      ...context,
      { role: 'assistant', content: null, tool_calls: tools },
      ...tools_output
    ]

    try {
      let result = await chatCompletion({
        temperature: 0.3,
        messages,
        tools: this.getTools()
      })

      console.log('chat-summary', result)

      return { output: result.message }
    } catch (error) {
      console.error('Error in processToolCalls:', error)
      return { output: null }
    }
  }

  private async processMessage(inquiry: string): Promise<{ output: ChatCompletionResult['message'] | null }> {
    console.log('user', inquiry, new Date().toLocaleTimeString())

    let context = this.getContext()

    const messages = [
      { role: 'system', content: this.getSystemPrompt() },
      ...context,
      { role: 'user', content: inquiry }
    ]

    try {
      let result = await chatCompletion({
        temperature: 0.3,
        messages,
        tools: this.getTools()
      })

      console.log('function-calling', result)

      return { output: result.message }
    } catch (error) {
      console.error('Error in processMessage:', error)
      return { output: null }
    }
  }

  private getContext(): { role: string; content: string }[] {
    return trim_array(
      this.messageItems.map(item => ({
        role: item.role,
        content: item.content,
      })),
      20
    )
  }

  private getSystemPrompt(): string {
    const today = new Date()
    return `You are a helpful personal assistant.\n\n` +
      `# Tools\n` +
      `You have the following tools that you can invoke based on the user inquiry.\n` +
      `- get_weather, when the user wants to know the weather forecast given a location and date.\n` +
      `- get_events, when the user wants to know events happening in a given location and date.\n` +
      `- get_event, when the user wants to know more about a particular event.\n` +
      `- search_hotel, when the user wants to search for hotel based on given location.\n` +
      `- get_hotel, when the user wants to know more about a particular hotel.\n` +
      `- reserve_hotel, when the user wants to make room reservation for a particular hotel.\n` +
      `- get_reservation, when the user wants to get the details of their reservation.\n` +
      `When the user is making hotel reservation, be sure to guide the user to fill up all required information.\n` +
      `When you fill up some of the required information yourself, be sure to confirm to user before proceeding.\n` +
      `Aside from the listed functions above, answer all other inquiries by telling the user that it is out of scope of your ability.\n\n` +
      `# User\n` +
      `If my full name is needed, please ask me for my full name.\n\n` +
      `# Language Support\n` +
      `Please reply in the language used by the user.\n\n` +
      `Today is ${today}`
  }

  private getTools() {
    return [
      { type: 'function', function: get_weather },
      { type: 'function', function: get_events },
      { type: 'function', function: get_event },
      { type: 'function', function: search_hotel },
      { type: 'function', function: get_hotel },
      { type: 'function', function: reserve_hotel },
      { type: 'function', function: get_reservation },
    ]
  }
}

interface WatiWebhookPayload {
    waId: string
    text: string
  }
  
  interface WatiResponse {
    message: string
  }
  
export const handleWatiWebhook1 = httpAction(async (ctx, request) => {
    try {
      // Parse the incoming webhook payload
      const payload: WatiWebhookPayload = await request.json()
  
      if (!payload.waId || !payload.text) {
        return new Response('Invalid payload', { status: 400 })
      }
  
      // Initialize the WhatsAppChatIntegration
      const whatsAppIntegration = new WhatsAppChatIntegration()
  
      // Process the incoming message
      const response = await whatsAppIntegration.handleIncomingMessage1(payload.text)
  
      // Get the last message from the assistant
      const lastAssistantMessage = response
        .filter(msg => msg.role === 'assistant')
        .pop()
  
      if (!lastAssistantMessage) {
        throw new Error('No assistant response generated')
      }
  
      // Format the response for Wati
      const watiResponse: WatiResponse = {
        message: lastAssistantMessage.content
      }
  
      // Send the response back
      return new Response(JSON.stringify(watiResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Error processing Wati webhook:', error)
      return new Response('Internal server error', { status: 500 })
    }
  })
  
// Usage example:
// const whatsAppIntegration = new WhatsAppChatIntegration();
// const response = await whatsAppIntegration.handleIncomingMessage("What's the weather like today?");
// console.log(response);