import fs from 'fs';

export function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

export function buildEmailContent(lead, config) {
  const data = {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    company: lead.company,
    ...lead.customFields
  };

  const subject = renderTemplate(config.subjectTemplate, data);
  
  return { subject, data };
}

export async function sendEmail(transport, lead, sender, config) {
  const { subject, data } = buildEmailContent(lead, config);
  
  const htmlPath = config.htmlTemplatePath;
  const textPath = config.textTemplatePath;
  
  let htmlContent = '';
  let textContent = '';
  
  try {
    if (fs.existsSync(htmlPath)) {
      htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      htmlContent = renderTemplate(htmlContent, data);
    }
  } catch (err) {
    console.warn('Could not load HTML template:', err.message);
  }
  
  try {
    if (fs.existsSync(textPath)) {
      textContent = fs.readFileSync(textPath, 'utf-8');
      textContent = renderTemplate(textContent, data);
    }
  } catch (err) {
    console.warn('Could not load text template:', err.message);
  }

  if (!htmlContent && !textContent) {
    htmlContent = `<p>Hi ${data.firstName || 'there'},</p><p>This is a test email from Promochu.</p>`;
    textContent = `Hi ${data.firstName || 'there'},\n\nThis is a test email from Promochu.`;
  }

  const mailOptions = {
    from: `"${config.fromName}" <${sender.email}>`,
    to: lead.email,
    subject,
    text: textContent,
    html: htmlContent
  };

  return transport.sendMail(mailOptions);
}