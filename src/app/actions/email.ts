'use server';

import prisma from '@/lib/prisma';
import { sendEmail as sendGmail } from '@/lib/gmail';
import { revalidatePath } from 'next/cache';

export async function sendEmailAction(
  organizationId: string,
  to: string,
  subject: string,
  body: string,
  shouldRewrite: boolean,
  attachments: { name: string, mimeType: string, base64?: string, driveFileId?: string }[] = []
) {
  try {
    await sendGmail(organizationId, to, subject, body, shouldRewrite, attachments);
    revalidatePath('/emails');
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function getAttachmentAction(organizationId: string, messageId: string, attachmentId: string) {
  try {
    const { getEmailAttachment } = await import('@/lib/gmail');
    const attachment = await getEmailAttachment(organizationId, messageId, attachmentId);
    return { success: true, attachment };
  } catch (error) {
    console.error('Error fetching email attachment:', error);
    return { success: false, error: 'Failed to fetch email attachment' };
  }
}

export async function getEmailLogs(organizationId: string) {
  try {
    const logs = await prisma.emailLog.findMany({
      where: { organizationId },
      orderBy: { sentAt: 'desc' },
    });
    return { success: true, logs };
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return { success: false, error: 'Failed to fetch email logs' };
  }
}

import { getRecentEmails, rewriteEmailWithAI } from '@/lib/gmail';

export async function getInboxAction(
  organizationId: string, 
  pageToken?: string, 
  labelId: string = 'INBOX', 
  filter: 'all' | 'unread' | 'read' = 'all'
) {
  try {
    const { emails, nextPageToken } = await getRecentEmails(organizationId, 20, pageToken, labelId, filter);
    return { success: true, emails, nextPageToken };
  } catch (error) {
    console.error('Error fetching inbox:', error);
    return { success: false, error: 'Failed to fetch inbox' };
  }
}

export async function rewriteTextAction(text: string, type: 'subject' | 'body') {
  try {
    const prompt = type === 'subject' 
      ? `Rewrite this email subject to be catchy, professional, and concise (no quotes): ${text}` 
      : text; // the gmail library rewriteEmailWithAI handles the body prompt
    
    // We can reuse rewriteEmailWithAI for the body, but for subject we should maybe use it directly or just pass the subject prompt
    // We'll just pass the custom prompt to rewriteEmailWithAI for now, wait, rewriteEmailWithAI prefixes "Rewrite the following email..." 
    // Let's just use the body rewriter for both for now, or just let rewriteEmailWithAI handle it.
    // Actually, I'll update rewriteEmailWithAI to take an optional instruction. Let's just use it as is for body, and a simplified one for subject.
    const result = await rewriteEmailWithAI(prompt);
    return { success: true, text: result.replace(/^"|"$/g, '').trim() };
  } catch (error) {
    console.error('Error rewriting text:', error);
    return { success: false, error: 'Failed to rewrite text' };
  }
}

export async function getEmailDetailsAction(organizationId: string, messageId: string) {
  try {
    const { getEmailDetails } = await import('@/lib/gmail');
    const { body, attachments } = await getEmailDetails(organizationId, messageId);
    return { success: true, body, attachments };
  } catch (error) {
    console.error('Error fetching email details:', error);
    return { success: false, error: 'Failed to fetch email details' };
  }
}

export async function modifyEmailAction(organizationId: string, messageIds: string[], action: 'read' | 'unread' | 'important' | 'unimportant') {
  try {
    const { modifyEmailLabels } = await import('@/lib/gmail');
    const addLabelIds: string[] = [];
    const removeLabelIds: string[] = [];
    
    if (action === 'read') removeLabelIds.push('UNREAD');
    if (action === 'unread') addLabelIds.push('UNREAD');
    if (action === 'important') addLabelIds.push('IMPORTANT');
    if (action === 'unimportant') removeLabelIds.push('IMPORTANT');
    
    await modifyEmailLabels(organizationId, messageIds, addLabelIds, removeLabelIds);
    return { success: true };
  } catch (error) {
    console.error('Error modifying email labels:', error);
    return { success: false, error: 'Failed to update emails' };
  }
}

export async function trashEmailAction(organizationId: string, messageIds: string[]) {
  try {
    const { trashEmails } = await import('@/lib/gmail');
    await trashEmails(organizationId, messageIds);
    return { success: true };
  } catch (error) {
    console.error('Error trashing emails:', error);
    return { success: false, error: 'Failed to delete emails' };
  }
}
