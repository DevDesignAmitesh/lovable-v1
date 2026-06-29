import type { Message } from "./types";
import fs from "fs";

class MessageManager {
  private static instance: MessageManager;
  private messages: Message[]

  constructor() {
    this.messages = [];

    // this.messages = this.readBackupData().messages;
    // setInterval(this.backupData, 5 * 1000)
  }
  
  static getInstance(): MessageManager {
    if (!MessageManager.instance) MessageManager.instance = new MessageManager();
    return MessageManager.instance
  }

  private backupData = () => {
    fs.writeFileSync("./messages.json", JSON.stringify(this.messages));    
  }

  private readBackupData = () => {
    try {
      const messages = JSON.parse(fs.readFileSync("./messages.json").toString());    
      return { messages }
    } catch {
      return { messages: [] }
    }
  }
  
  add = (msg: Message) => {
    this.messages.push(msg)
  }

  get = () => {
    return this.messages;
  }
}

export const messageManager = MessageManager.getInstance();
