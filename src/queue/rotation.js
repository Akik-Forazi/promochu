import fs from 'fs';
import path from 'path';

export class RotationQueue {
  constructor(config, database, transportPool, sendEmailFn) {
    this.config = config;
    this.database = database;
    this.transportPool = transportPool;
    this.sendEmail = sendEmailFn;
    this.currentSenderIndex = 0;
    this.running = false;
    this.timeoutId = null;
    this.processedCount = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    console.log('Starting rotation queue...');
    this.scheduleNext();
  }

  stop() {
    this.running = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    console.log('Rotation queue stopped');
  }

  scheduleNext() {
    if (!this.running) return;

    const unsentLeads = this.database.getUnsentLeads();
    
    if (unsentLeads.length === 0) {
      console.log('All leads processed. Queue complete.');
      this.stop();
      return;
    }

    const lead = unsentLeads[0];
    const sender = this.getNextSender();
    
    this.timeoutId = setTimeout(() => {
      this.processLead(lead, sender);
    }, this.config.delayMs);
  }

  getNextSender() {
    const accounts = this.transportPool.getAllAccounts();
    const sender = accounts[this.currentSenderIndex % accounts.length];
    this.currentSenderIndex = (this.currentSenderIndex + 1) % accounts.length;
    return sender;
  }

  async processLead(lead, sender) {
    if (!this.running) return;

    try {
      const transport = this.transportPool.getTransport(sender.email);
      if (!transport) {
        throw new Error(`No transport found for ${sender.email}`);
      }

      const result = await this.sendEmail(transport, lead, sender);
      
      this.database.markSent(lead.email, sender.email, {
        messageId: result.messageId,
        response: result.response
      });
      
      this.processedCount++;
      console.log(`[${this.processedCount}] Sent to ${lead.email} via ${sender.email}`);
      
    } catch (err) {
      console.error(`Failed to send to ${lead.email} via ${sender.email}:`, err.message);
      this.database.markSent(lead.email, sender.email, {
        error: err.message,
        failed: true
      });
    }

    if (this.running) {
      this.scheduleNext();
    }
  }

  getStatus() {
    const stats = this.database.getStats();
    return {
      running: this.running,
      currentSenderIndex: this.currentSenderIndex,
      processedCount: this.processedCount,
      ...stats
    };
  }
}

export function createRotationQueue(config, database, transportPool, sendEmailFn) {
  return new RotationQueue(config, database, transportPool, sendEmailFn);
}