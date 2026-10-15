import nodemailer from 'nodemailer';

export class TransportPool {
  constructor(accounts) {
    this.transports = new Map();
    this.accounts = accounts;
    this.initialize();
  }

  initialize() {
    for (const account of this.accounts) {
      const transport = nodemailer.createTransport({
        host: account.host,
        port: account.port,
        secure: account.secure,
        auth: {
          user: account.email,
          pass: account.password
        },
        pool: true,
        maxConnections: 1,
        rateLimit: 1
      });

      transport.verify((err, success) => {
        if (err) {
          console.error(`Transport verification failed for ${account.email}:`, err.message);
        } else {
          console.log(`Transport ready for ${account.email}`);
        }
      });

      this.transports.set(account.email, transport);
    }
  }

  getTransport(email) {
    return this.transports.get(email.toLowerCase());
  }

  getAccount(email) {
    return this.accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  getAllAccounts() {
    return [...this.accounts];
  }

  async closeAll() {
    for (const [email, transport] of this.transports) {
      try {
        transport.close();
        console.log(`Closed transport for ${email}`);
      } catch (err) {
        console.error(`Error closing transport for ${email}:`, err.message);
      }
    }
    this.transports.clear();
  }

  size() {
    return this.transports.size;
  }
}

export function createTransportPool(accounts) {
  return new TransportPool(accounts);
}