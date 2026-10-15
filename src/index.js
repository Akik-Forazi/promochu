import { loadConfig, validateConfig } from './config/envLoader.js';
import { createDatabase } from './db/database.js';
import { createTransportPool } from './transport/pool.js';
import { createRotationQueue } from './queue/rotation.js';
import { sendEmail } from './utils/email.js';
import fs from 'fs';
import path from 'path';

async function loadLeads(filePath) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Leads file not found: ${resolvedPath}`);
  }
  const content = fs.readFileSync(resolvedPath, 'utf-8');
  return JSON.parse(content);
}

async function main() {
  console.log('=== Promochu Email Automation ===');
  
  const config = loadConfig();
  validateConfig(config);
  
  console.log(`Loaded ${config.senderAccounts.length} sender account(s)`);
  console.log(`Rate: ${config.ratePerHour} emails/hour/account`);
  console.log(`Delay between sends: ${config.delayMs}ms`);
  
  const database = createDatabase(config.databasePath);
  
  const leads = await loadLeads(config.leadsPath);
  const loaded = database.loadLeads(leads);
  console.log(`Loaded ${loaded} new leads (${database.getStats().totalLeads} total)`);
  
  const transportPool = createTransportPool(config.senderAccounts);
  
  const queue = createRotationQueue(config, database, transportPool, sendEmail);
  
  const shutdown = () => {
    console.log('\nShutdown signal received...');
    queue.stop();
    transportPool.closeAll();
    database.stopAutoSave();
    console.log('Cleanup complete. Exiting.');
    process.exit(0);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  
  database.startAutoSave();
  queue.start();
  
  console.log('Queue started. Press Ctrl+C to stop gracefully.');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});