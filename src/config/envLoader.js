export function parseSenderAccounts(envString) {
  if (!envString || typeof envString !== 'string') {
    throw new Error('SENDER_ACCOUNTS environment variable is required and must be a string');
  }

  const accounts = [];
  const pairs = envString.split(',');

  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;

    const [email, password] = trimmed.split(':');
    
    if (!email || !password) {
      throw new Error(`Invalid account format: "${trimmed}". Expected "email:password"`);
    }

    if (!email.includes('@')) {
      throw new Error(`Invalid email format: "${email}"`);
    }

    if (password.length !== 16) {
      throw new Error(`App password for ${email} must be 16 characters, got ${password.length}`);
    }

    accounts.push({
      email: email.toLowerCase(),
      password,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true
    });
  }

  if (accounts.length === 0) {
    throw new Error('No valid sender accounts parsed from SENDER_ACCOUNTS');
  }

  return accounts;
}

export function loadConfig() {
  const senderAccounts = parseSenderAccounts(process.env.SENDER_ACCOUNTS);
  
  const leadsPath = process.env.LEADS_FILE || './leads.json';
  const databasePath = process.env.DATABASE_FILE || './database.json';
  
  const ratePerHour = parseInt(process.env.RATE_PER_HOUR_PER_ACCOUNT || '30', 10);
  if (isNaN(ratePerHour) || ratePerHour <= 0) {
    throw new Error('RATE_PER_HOUR_PER_ACCOUNT must be a positive integer');
  }

  const fromName = process.env.FROM_NAME || 'Promochu Team';
  const subjectTemplate = process.env.SUBJECT_TEMPLATE || 'Special offer for {{firstName}}';
  const htmlTemplatePath = process.env.HTML_TEMPLATE_FILE || './templates/email.html';
  const textTemplatePath = process.env.TEXT_TEMPLATE_FILE || './templates/email.txt';

  return {
    senderAccounts,
    leadsPath,
    databasePath,
    ratePerHour,
    fromName,
    subjectTemplate,
    htmlTemplatePath,
    textTemplatePath,
    delayMs: calculateDelayMs(senderAccounts.length, ratePerHour)
  };
}

function calculateDelayMs(accountCount, ratePerHourPerAccount) {
  const totalEmailsPerHour = accountCount * ratePerHourPerAccount;
  const intervalMs = (60 * 60 * 1000) / totalEmailsPerHour;
  return Math.floor(intervalMs);
}

export function validateConfig(config) {
  const required = ['senderAccounts', 'leadsPath', 'databasePath', 'ratePerHour'];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required config: ${key}`);
    }
  }
  return true;
}