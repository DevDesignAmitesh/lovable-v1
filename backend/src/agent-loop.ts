import { type Response } from "express";
import { OpenAI } from "openai";
import { SYSTEM_INSTRUCTION } from "./prompt";
import { TOOL_IMPLEMENTATIONS, TOOLS } from "./tools";
import { prisma } from "./db";

const MAX_STEPS = 10;
const openai = new OpenAI();

export async function agentLoop(res: Response, input: string, projectId: string) {
  let steps = 0;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // res.write(`Connected to server\n\n`);

  let previousResponseId: string | undefined;
  let toolOutputs = [];

  await prisma.conversation.create({
    data: {
      contents: input,
      from: "USER",
      type: "TEXT_MESSAGE",
      projectId
    }
  });

  try {
    while (steps < MAX_STEPS) {
      let str = "";
      
      const stream = await openai.responses.create({
        model: "gpt-5.5",
        previous_response_id: previousResponseId,
        input:
          previousResponseId === undefined
            ? [
                {
                  role: "system",
                  content: SYSTEM_INSTRUCTION,
                },
                {
                  role: "user",
                  content: input,
                },
              ]
            : toolOutputs,
        tools: TOOLS,
        stream: true,
      });
  
      
      let toolCalls = [];
  
      for await (const event of stream) {        
        if (event.type === "response.created") {
          previousResponseId = event.response.id;
        } else if (event.type === "response.output_text.delta") {
          
          res.write(
            `data: ${JSON.stringify({
              type: "text",
              delta: event.delta,
            })}\n\n`
          );
          str += `${event.delta}`;
        } else if (event.type === "response.output_item.done") {
          if (event.item.type === "function_call") {
            await prisma.conversation.create({
              data: {
                // TODO: get the types of event.item
                contents: JSON.stringify(event.item),
                from: "ASSISTANT",
                type: "TOOL_CALL",
                projectId,
              }
            });
            toolCalls.push(event.item);
          }
        }
      }
  
      
      if (toolCalls.length === 0) {
        break;
      }
  
      toolOutputs = [];


      if (str !== "") {
        await prisma.conversation.create({
          data: {
            contents: str,
            from: "ASSISTANT",
            type: "TEXT_MESSAGE",
            projectId
          }
        });
      }
  
      for (const call of toolCalls) {
        const tool = TOOL_IMPLEMENTATIONS[call.name];
  
        console.log("call", call)
        
        try {
          const output = await tool(JSON.parse(call.arguments));
    
          
          toolOutputs.push({
            type: "function_call_output",
            call_id: call.call_id,
            output: JSON.stringify(output),
          });
        } catch (e) {
        }
      }
  
      steps++;
    }
    
  
    steps = 0;
    res.end();
  } catch (e) {
    res.end();
  }
};
