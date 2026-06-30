import { type Response } from "express";
import { OpenAI } from "openai";
import { SYSTEM_INSTRUCTION } from "./prompt";
import { TOOL_IMPLEMENTATIONS, TOOLS } from "./tools";
import { prisma } from "./db";
import { messageManager } from "./message.manager";

const MAX_STEPS = 10;
const openai = new OpenAI();

export async function agentLoop(res: Response, input: string, projectId: string) {
  let steps = 0;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  messageManager.add({
    content: `
    <USER_QUERY>
      ${input}
    <USER_QUERY>
    `,
    role: "user"
  });
  
  // await prisma.conversation.create({
  //   data: {
  //     contents: input,
  //     from: "USER",
  //     type: "TEXT_MESSAGE",
  //     projectId
  //   }
  // });

  
  try {
    loop1: 
    while (steps < MAX_STEPS) {
      let str: string | null = null;
      
      const stream = await openai.responses.create({
        model: "gpt-5.4-mini",
        input: [
          {
            role: "system",
            content: SYSTEM_INSTRUCTION,
          },
          ...messageManager.get()
        ],
        tools: TOOLS,
        stream: true,
        temperature: 0
      });
  
      
      let toolCalls = [];    
      let tool_getting_used: string | null = null;
        
      loop2:
      for await (const event of stream) {
        if (event.type === "response.output_item.added") {
          tool_getting_used = event.item.name;  
        } else if (event.type === "response.function_call_arguments.delta" && tool_getting_used !== null) {
        } else if (event.type === "response.output_text.delta") {
          str += event.delta;

          res.write(
            `data: ${JSON.stringify({
              type: "text",
              delta: event.delta,
            })}\n\n`
          );
        } else if (event.type === "response.output_item.done") {
          if (event.item.type === "function_call") {
            messageManager.add({
              content: `
              <TOOL_TO_USE>
                ${JSON.stringify(event.item)}
              <TOOL_TO_USE>
              `,
              role: "assistant"
            });
            // await prisma.conversation.create({
            //   data: {
            //     // TODO: get the types of event.item
            //     contents: JSON.stringify(event.item),
            //     from: "ASSISTANT",
            //     type: "TOOL_CALL",
            //     projectId,
            //   }
            // });
            toolCalls.push(event.item);
          }
        }
      }

      if (typeof str === "string") {
        messageManager.add({
          content: `
          <ASSISTANT_RESPONSE>
            ${str}
          <ASSISTANT_RESPONSE>
          `,
          role: "assistant"
        });
        // await prisma.conversation.create({
        //   data: {
        //     contents: str,
        //     from: "ASSISTANT",
        //     type: "TEXT_MESSAGE",
        //     projectId
        //   }
        // });
      }
      
      if (toolCalls.length === 0 && tool_getting_used !== "broadcast_tool_to_user_tool") {
        break loop1;
      }

      tool_getting_used = null;
  
      loop3: 
      for (const call of toolCalls) {
        try {
          const tool = TOOL_IMPLEMENTATIONS[call.name];
                  
          const output = await tool(JSON.parse(call.arguments ?? "{}"));

          messageManager.add({
            content: `
            <TOOL_RESPONSE>
              ${JSON.stringify(output)}
            <TOOL_RESPONSE>
            `,
            role: "user"
          });
          
          if (
            call.name === "broadcast_questions_to_user_tool" || 
            call.name === "broadcast_plan_to_user_tool"
          ) {
            break loop1;
          }
        } catch (e) {
          console.log("error", e);
        }
      }

      steps++;
    }    
  
    steps = 0;
    res.end();
  } catch (e) {
    console.log("error", e)
    res.end();
  }
};
