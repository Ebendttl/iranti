import { memWalEngine, WalrusMemoryRecord } from './memwal';

export interface IrantiAgentResponse {
  recalledMemories: WalrusMemoryRecord[];
  memorySummary: string;
  suggestedWhatsAppReply: string;
  outstandingBalanceText: string | null;
  rawToolCallsPerformed: string[];
}

export class IrantiAgent {
  /**
   * Processes an incoming WhatsApp transcript or customer message using Ìrántí's memory rules
   */
  public async processCustomerInteraction(
    inputMessage: string,
    customerName: string,
    customerPhone: string
  ): Promise<IrantiAgentResponse> {
    const toolCalls: string[] = [];

    // Step 1: Call memwal_analyze on the input transcript/message
    toolCalls.push(`memwal_analyze("${inputMessage.substring(0, 40)}...")`);
    const analyzeRes = memWalEngine.memwal_analyze(inputMessage, customerName, customerPhone);

    // Step 2: Call memwal_recall for customer history
    toolCalls.push(`memwal_recall("${customerName} ${customerPhone}")`);
    const recalledMemories = memWalEngine.memwal_recall(`${customerName} ${customerPhone}`, 5);

    // Filter relevant memories for this specific customer
    const customerMems = recalledMemories.filter(m =>
      m.customerName.toLowerCase() === customerName.toLowerCase() ||
      m.customerPhone === customerPhone
    );

    // Extract key details: size, address, debt records
    let sizePref = '';
    let address = '';
    let latestDebt: { amount: number; date: string; fullText: string } | null = null;
    let orderHistory: string[] = [];

    for (const mem of customerMems) {
      const lower = mem.memoryText.toLowerCase();
      if (mem.category === 'preference' || lower.includes('size')) {
        const match = mem.memoryText.match(/size\s*\d{2}|size\s*\w+/i);
        if (match) sizePref = match[0];
      }
      if (mem.category === 'address' || lower.includes('deliver') || lower.includes('street')) {
        address = mem.memoryText.replace(`${customerName} (${customerPhone}):`, '').replace('Delivery address specified:', '').trim();
      }
      if (mem.category === 'debt_ledger' || lower.includes('owes') || lower.includes('owing')) {
        const debtVal = memWalEngine.extractDebtAmountFromText(mem.memoryText, mem.customerPhone);
        if (debtVal > 0 && !latestDebt) {
          latestDebt = {
            amount: debtVal,
            date: mem.createdAt.split('T')[0],
            fullText: mem.memoryText
          };
        }
      }
      if (mem.category === 'order_history') {
        orderHistory.push(mem.memoryText);
      }
    }

    // Determine outstanding balance text
    let outstandingBalanceText: string | null = null;
    if (latestDebt) {
      outstandingBalanceText = `Customer currently owes ₦${latestDebt.amount.toLocaleString()} (recorded ${latestDebt.date}).`;
    }

    // Build memory summary
    let memorySummary = `Recalled ${customerMems.length} memories for ${customerName} (${customerPhone}).`;
    if (sizePref) memorySummary += ` Preferred size: ${sizePref}.`;
    if (latestDebt) memorySummary += ` Outstanding balance: ₦${latestDebt.amount.toLocaleString()}.`;

    // Step 3: Draft culturally natural Lagos vendor WhatsApp reply
    let reply = `Hey ${customerName}! Good to hear from you again. `;

    if (sizePref) {
      reply += `Still looking for ${sizePref} in stock for you! `;
    } else {
      reply += `Let me check our fresh stock available right now. `;
    }

    if (address) {
      reply += `Are we still delivering to ${address}? `;
    }

    if (latestDebt) {
      reply += `Also just a quick reminder, dear — you still have a balance of ₦${latestDebt.amount.toLocaleString()} from last time. Want me to add it to this order so we clear it together? 😊`;
    } else {
      reply += `Let內 know what you'd like to lock down today so I pack it for you immediately!`;
    }

    return {
      recalledMemories: customerMems,
      memorySummary,
      suggestedWhatsAppReply: reply,
      outstandingBalanceText,
      rawToolCallsPerformed: toolCalls
    };
  }

  /**
   * Generates a direct payment reminder for an owing customer
   */
  public generateDebtReminder(customerName: string, customerPhone: string, amountNaira: string | number): string {
    const formattedAmount = typeof amountNaira === 'number' ? amountNaira.toLocaleString() : amountNaira;
    return `Hello ${customerName}! Hope your week is going well. Just following up gently on the balance of ₦${formattedAmount} for your previous order. Kindly let me know when you'll be transferring so we update your record. Thank you! 🙏`;
  }
}

export const irantiAgent = new IrantiAgent();
