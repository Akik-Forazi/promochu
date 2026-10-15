import fs from 'fs';
import path from 'path';

export class Database {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.data = { leads: [], sent: [] };
    this.dirty = false;
    this.saveInterval = null;
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(content);
        if (!Array.isArray(this.data.leads)) this.data.leads = [];
        if (!Array.isArray(this.data.sent)) this.data.sent = [];
      }
    } catch (err) {
      console.error('Failed to load database, starting fresh:', err.message);
      this.data = { leads: [], sent: [] };
    }
    return this;
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
      this.dirty = false;
    } catch (err) {
      console.error('Failed to save database:', err.message);
    }
  }

  startAutoSave(intervalMs = 5000) {
    this.saveInterval = setInterval(() => {
      if (this.dirty) this.save();
    }, intervalMs);
    this.saveInterval.unref();
  }

  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    if (this.dirty) this.save();
  }

  loadLeads(leadsArray) {
    const existingEmails = new Set(this.data.leads.map(l => l.email.toLowerCase()));
    const newLeads = leadsArray
      .filter(l => l.email && !existingEmails.has(l.email.toLowerCase()))
      .map(l => ({
        email: l.email.toLowerCase(),
        firstName: l.firstName || '',
        lastName: l.lastName || '',
        company: l.company || '',
        customFields: l.customFields || {}
      }));
    
    this.data.leads.push(...newLeads);
    this.dirty = true;
    return newLeads.length;
  }

  getUnsentLeads() {
    const sentEmails = new Set(this.data.sent.map(s => s.email.toLowerCase()));
    return this.data.leads.filter(l => !sentEmails.has(l.email.toLowerCase()));
  }

  markSent(email, senderEmail, metadata = {}) {
    const record = {
      email: email.toLowerCase(),
      sender: senderEmail.toLowerCase(),
      timestamp: new Date().toISOString(),
      ...metadata
    };
    this.data.sent.push(record);
    this.dirty = true;
    return record;
  }

  isSent(email) {
    const sentEmails = new Set(this.data.sent.map(s => s.email.toLowerCase()));
    return sentEmails.has(email.toLowerCase());
  }

  getStats() {
    return {
      totalLeads: this.data.leads.length,
      sentCount: this.data.sent.length,
      remaining: this.getUnsentLeads().length,
      senders: [...new Set(this.data.sent.map(s => s.sender))]
    };
  }
}

export function createDatabase(filePath) {
  return new Database(filePath).load();
}