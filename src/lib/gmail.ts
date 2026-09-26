import { google } from 'googleapis';
import prisma from './prisma';
import OpenAI from 'openai';

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || 'dummy_key_to_prevent_crash', 
});

export async function getGmailClient(organizationId: string) {
  const creds = await prisma.googleCredential.findUnique({
    where: { organizationId },
  });

  if (!creds) throw new Error("Google account not connected");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: creds.accessToken,
    refresh_token: creds.refreshToken,
    expiry_date: creds.expiryDate.getTime(),
  });

  // Automatically refresh the token if it's expired and save it back to the DB
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token || tokens.access_token) {
      await prisma.googleCredential.update({
        where: { organizationId },
        data: {
          accessToken: tokens.access_token || creds.accessToken,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          ...(tokens.expiry_date && { expiryDate: new Date(tokens.expiry_date) }),
        }
      });
    }
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function getSystemGmailClient(userId: string) {
  const creds = await prisma.googleCredential.findUnique({
    where: { userId },
  });

  if (!creds) throw new Error("Google account not connected");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: creds.accessToken,
    refresh_token: creds.refreshToken,
    expiry_date: creds.expiryDate.getTime(),
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token || tokens.access_token) {
      await prisma.googleCredential.update({
        where: { userId },
        data: {
          accessToken: tokens.access_token || creds.accessToken,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          ...(tokens.expiry_date && { expiryDate: new Date(tokens.expiry_date) }),
        }
      });
    }
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function rewriteEmailWithAI(draft: string) {
  const prompt = `Rewrite the following email to be more professional, polite, and concise:\n\n${draft}`;

  const response = await openai.chat.completions.create({
    model: "google/gemini-2.0-pro-exp-02-05:free", // OpenRouter free model
    messages: [
      { role: "system", content: "You are a professional assistant helping to rewrite emails." },
      { role: "user", content: prompt }
    ],
  });

  return response.choices[0].message.content || "";
}

export async function sendEmail(
  organizationId: string, 
  to: string, 
  subject: string, 
  textBody: string,
  shouldRewrite: boolean = false,
  attachments: { name: string, mimeType: string, base64?: string, driveFileId?: string }[] = []
) {
  const gmail = await getGmailClient(organizationId);

  let finalBody = textBody;
  if (shouldRewrite) {
    finalBody = await rewriteEmailWithAI(textBody);
  }

  // Resolve Drive attachments to base64
  for (const att of attachments) {
    if (att.driveFileId && !att.base64) {
      try {
        const drive = (await import('./drive')).getDriveClient;
        const driveClient = await drive(organizationId);
        const response = await driveClient.files.get(
          { fileId: att.driveFileId, alt: "media" },
          { responseType: "arraybuffer" }
        );
        att.base64 = Buffer.from(response.data as ArrayBuffer).toString('base64');
      } catch (e) {
        console.error("Failed to load drive attachment", att.name, e);
      }
    }
  }

  // Construct standard RFC 2822 email format
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const boundary = 'bna_boundary_' + Date.now().toString(16);
  
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    finalBody,
    '',
  ];

  for (const att of attachments) {
    if (!att.base64) continue; // skip failed ones
    // Strip the "data:mimeType;base64," prefix if it exists (from local uploads)
    const base64Data = att.base64.includes(',') ? att.base64.split(',')[1] : att.base64;
    
    messageParts.push(
      `--${boundary}`,
      `Content-Type: ${att.mimeType}; name="${att.name}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${att.name}"`,
      '',
      base64Data,
      ''
    );
  }
  
  messageParts.push(`--${boundary}--`, '');

  const message = messageParts.join('\n');
  
  // Gmail API requires base64url encoding
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  // Log the email in the database
  await prisma.emailLog.create({
    data: {
      organizationId,
      recipient: to,
      subject,
      body: finalBody,
    }
  });

  return res.data;
}

export async function sendSystemEmail(
  userId: string, 
  to: string, 
  subject: string, 
  textBody: string
) {
  const gmail = await getSystemGmailClient(userId);

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const boundary = 'bna_boundary_' + Date.now().toString(16);
  
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    textBody,
    '',
    `--${boundary}--`, 
    ''
  ];

  const message = messageParts.join('\n');
  
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });

  return res.data;
}
export async function getRecentEmails(
  organizationId: string, 
  maxResults = 20,
  pageToken?: string,
  labelId: string = 'INBOX',
  filter: 'all' | 'unread' | 'read' = 'all'
) {
  const gmail = await getGmailClient(organizationId);
  
  let q = '';
  if (filter === 'unread') q = 'is:unread';
  if (filter === 'read') q = 'is:read';

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: labelId === 'ALL' ? undefined : [labelId],
    pageToken,
    q: q || undefined
  });

  if (!res.data.messages) return { emails: [], nextPageToken: null };

  const emails = await Promise.all(
    res.data.messages.map(async (msg) => {
      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });
      const headers = fullMsg.data.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
      const labels = fullMsg.data.labelIds || [];
      
      return {
        id: msg.id!,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        date: getHeader('Date'),
        snippet: fullMsg.data.snippet || '',
        isUnread: labels.includes('UNREAD'),
        isImportant: labels.includes('IMPORTANT'),
      };
    })
  );

  return {
    emails,
    nextPageToken: res.data.nextPageToken || null
  };
}

export async function modifyEmailLabels(organizationId: string, messageIds: string[], addLabelIds: string[], removeLabelIds: string[]) {
  const gmail = await getGmailClient(organizationId);
  await gmail.users.messages.batchModify({
    userId: 'me',
    requestBody: {
      ids: messageIds,
      addLabelIds,
      removeLabelIds
    }
  });
}

export async function trashEmails(organizationId: string, messageIds: string[]) {
  const gmail = await getGmailClient(organizationId);
  for (const id of messageIds) {
    await gmail.users.messages.trash({ userId: 'me', id });
  }
}

export async function getEmailDetails(organizationId: string, messageId: string) {
  const gmail = await getGmailClient(organizationId);
  const fullMsg = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const attachments: { filename: string; mimeType: string; attachmentId: string }[] = [];

  const getBody = (payload: any): string => {
    if (payload.filename && payload.body && payload.body.attachmentId) {
       attachments.push({
         filename: payload.filename,
         mimeType: payload.mimeType,
         attachmentId: payload.body.attachmentId,
       });
    }

    if (payload.body && payload.body.data && !payload.filename) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    if (payload.parts) {
      let textBody = '';
      let htmlBody = '';
      for (const part of payload.parts) {
         if (part.filename && part.body && part.body.attachmentId) {
           attachments.push({
             filename: part.filename,
             mimeType: part.mimeType,
             attachmentId: part.body.attachmentId,
           });
         } else {
           const partBody = getBody(part);
           if (part.mimeType === 'text/html') htmlBody = partBody;
           else if (part.mimeType === 'text/plain') textBody = partBody;
           else if (!textBody && !htmlBody) textBody = partBody; // fallback for nested multipart
         }
      }
      return htmlBody || textBody;
    }
    return '';
  };

  const body = getBody(fullMsg.data.payload);
  return { body, attachments };
}

export async function getEmailAttachment(organizationId: string, messageId: string, attachmentId: string) {
  const gmail = await getGmailClient(organizationId);
  const response = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId: messageId,
    id: attachmentId,
  });
  return response.data;
}
