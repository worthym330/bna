'use client';

import { useState, useEffect } from 'react';
import { SendEmailForm } from '@/components/forms/SendEmailModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getInboxAction, modifyEmailAction, trashEmailAction } from '@/app/actions/email';
import { Mail, MailOpen, Star, Trash, StarOff, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface EmailLog {
  id: string;
  organizationId: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: Date;
}

export function EmailLogsClient({
  organizationId,
  logs,
  inbox = []
}: {
  organizationId: string;
  logs: EmailLog[];
  inbox?: any[];
}) {
  const [tab, setTab] = useState<'inbox' | 'important' | 'sent'>('inbox');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [openMsg, setOpenMsg] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [fullBody, setFullBody] = useState<string | null>(null);
  const [msgAttachments, setMsgAttachments] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // Pagination & selection
  const [emails, setEmails] = useState<any[]>(inbox);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    if (tab === 'sent') return;
    const fetchEmails = async () => {
      setLoadingTab(true);
      setSelectedIds([]);
      const label = tab === 'important' ? 'IMPORTANT' : 'INBOX';
      const res = await getInboxAction(organizationId, undefined, label, filter);
      if (res.success) {
        setEmails(res.emails || []);
        setNextPageToken(res.nextPageToken || null);
      }
      setLoadingTab(false);
    };
    fetchEmails();
  }, [tab, filter, organizationId]);

  const loadMore = async () => {
    if (!nextPageToken) return;
    setLoadingMore(true);
    const label = tab === 'important' ? 'IMPORTANT' : 'INBOX';
    const res = await getInboxAction(organizationId, nextPageToken, label, filter);
    if (res.success) {
      setEmails(prev => [...prev, ...(res.emails || [])]);
      setNextPageToken(res.nextPageToken || null);
    }
    setLoadingMore(false);
  };

  const handleBulkAction = async (action: 'read' | 'unread' | 'important' | 'unimportant' | 'delete') => {
    if (selectedIds.length === 0) return;
    const ids = [...selectedIds];
    setSelectedIds([]); // Optimistic clear

    try {
      if (action === 'delete') {
        setEmails(prev => prev.filter(e => !ids.includes(e.id)));
        await trashEmailAction(organizationId, ids);
        toast.success('Emails deleted');
      } else {
        setEmails(prev => prev.map(e => {
          if (ids.includes(e.id)) {
            if (action === 'read') return { ...e, isUnread: false };
            if (action === 'unread') return { ...e, isUnread: true };
            if (action === 'important') return { ...e, isImportant: true };
            if (action === 'unimportant') return { ...e, isImportant: false };
          }
          return e;
        }));
        await modifyEmailAction(organizationId, ids, action);
        toast.success('Emails updated');
      }
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(emails.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
          <p className="text-muted-foreground">Manage and track sent emails</p>
        </div>
        <Button onClick={() => { setIsComposing(true); setSelectedMsg(null); setFullBody(null); }}>
          Compose Email
        </Button>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        {/* Left Column - List */}
        <div className="w-1/3 flex flex-col border-r pr-6 shrink-0">
          <div className="flex gap-2 border-b mb-4 shrink-0">
            <Button
              variant={tab === 'inbox' ? 'secondary' : 'ghost'}
              onClick={() => { setTab('inbox'); setSelectedMsg(null); setFullBody(null); }}
              className="rounded-b-none"
            >
              Inbox
            </Button>
            <Button
              variant={tab === 'important' ? 'secondary' : 'ghost'}
              onClick={() => { setTab('important'); setSelectedMsg(null); setFullBody(null); }}
              className="rounded-b-none"
            >
              Important
            </Button>
            <Button
              variant={tab === 'sent' ? 'secondary' : 'ghost'}
              onClick={() => { setTab('sent'); setSelectedMsg(null); setFullBody(null); }}
              className="rounded-b-none"
            >
              Sent
            </Button>
          </div>

          {(tab === 'inbox' || tab === 'important') && (
            <div className="flex items-center gap-3 mb-4 p-2 bg-muted/40 rounded-lg shrink-0">
              <Checkbox
                checked={selectedIds.length > 0 && selectedIds.length === emails.length}
                onCheckedChange={toggleSelectAll}
                className="ml-1"
              />
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
                className="text-xs bg-transparent border-none focus:ring-0 cursor-pointer font-medium"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBulkAction('read')} title="Mark Read"><MailOpen className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBulkAction('unread')} title="Mark Unread"><Mail className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBulkAction('important')} title="Mark Important"><Star className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBulkAction('unimportant')} title="Remove Important"><StarOff className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBulkAction('delete')} title="Delete"><Trash className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-8">
            {loadingTab ? (
              <div className="text-center text-sm text-muted-foreground mt-10">Loading emails...</div>
            ) : (tab === 'inbox' || tab === 'important') ? (
              <>
                {emails.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="text-base font-medium">No emails found</div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {emails.map((msg: any) => (
                      <Card
                        key={msg.id}
                        className={`cursor-pointer transition-colors relative ${selectedMsg?.id === msg.id ? 'border-primary ring-1 ring-primary/20 bg-muted/50' : 'hover:bg-muted/30'} ${msg.isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        onClick={async () => {
                          setIsComposing(false);
                          setSelectedMsg(msg);
                          setMsgLoading(true);
                          setFullBody(null);
                          // Auto mark as read
                          if (msg.isUnread) {
                            handleBulkAction('read');
                          }
                          try {
                            const { getEmailDetailsAction } = await import('@/app/actions/email');
                            const res = await getEmailDetailsAction(organizationId, msg.id);
                            if (res.success) {
                              setFullBody(res.body || null);
                              setMsgAttachments(res.attachments || []);
                            } else {
                              setFullBody("Failed to load full body.");
                              setMsgAttachments([]);
                            }
                          } catch (e) {
                            setFullBody("Error loading email.");
                          } finally {
                            setMsgLoading(false);
                          }
                        }}
                      >
                        <CardHeader className="py-3 px-4">
                          <div className="flex gap-3">
                            <div className="pt-1 shrink-0" onClick={e => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedIds.includes(msg.id)}
                                onCheckedChange={(c) => {
                                  if (c) setSelectedIds(prev => [...prev, msg.id]);
                                  else setSelectedIds(prev => prev.filter(x => x !== msg.id));
                                }}
                              />
                            </div>
                            <div className="space-y-1 overflow-hidden flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {msg.isImportant && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                                  <CardTitle className={`text-sm truncate pr-2 ${msg.isUnread ? 'font-bold' : ''}`}>{msg.from}</CardTitle>
                                </div>
                                <span className={`text-xs whitespace-nowrap shrink-0 ${msg.isUnread ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                                  {msg.date ? format(new Date(msg.date), 'MMM d, yy') : ''}
                                </span>
                              </div>
                              <CardDescription className={`text-xs truncate ${msg.isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>{msg.subject}</CardDescription>
                              <div className="text-xs text-muted-foreground line-clamp-1">{msg.snippet}</div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                    {nextPageToken && (
                      <Button variant="outline" className="w-full mt-4" onClick={loadMore} disabled={loadingMore}>
                        {loadingMore ? 'Loading...' : 'Load Older'}
                      </Button>
                    )}
                  </>
                )}
              </>
            ) : null}

            {tab === 'sent' && (
              <>
                {logs.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="text-base font-medium">No emails sent yet</div>
                    </CardContent>
                  </Card>
                ) : (
                  logs.map((log) => (
                    <Card
                      key={log.id}
                      className={`cursor-pointer transition-colors ${selectedMsg?.id === log.id ? 'border-primary ring-1 ring-primary/20 bg-muted/50' : 'hover:bg-muted/30'}`}
                      onClick={() => {
                        setIsComposing(false);
                        setSelectedMsg({
                          id: log.id,
                          subject: log.subject,
                          from: 'Me (Sent)',
                          to: log.recipient,
                          date: log.sentAt
                        });
                        setFullBody(log.body);
                        setMsgAttachments([]);
                        setMsgLoading(false);
                      }}
                    >
                      <CardHeader className="py-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm truncate pr-2">To: {log.recipient}</CardTitle>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(log.sentAt), 'MMM d, yy')}
                            </span>
                          </div>
                          <CardDescription className="text-xs font-medium text-foreground truncate">{log.subject}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 pb-3 text-xs text-muted-foreground border-t bg-muted/10 line-clamp-2">
                        {log.body}
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column - Email Reader / Composer */}
        <div className="w-2/3 flex flex-col pl-2 overflow-y-auto bg-card rounded-lg border shadow-sm relative">
          {isComposing ? (
            <SendEmailForm
              organizationId={organizationId}
              onCancel={() => setIsComposing(false)}
              onSuccess={() => setIsComposing(false)}
            />
          ) : selectedMsg ? (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-4">{selectedMsg.subject}</h2>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">From: {selectedMsg.from}</span>
                    {selectedMsg.to && <span className="text-muted-foreground">To: {selectedMsg.to}</span>}
                  </div>
                  <span className="text-muted-foreground">
                    {selectedMsg.date ? format(new Date(selectedMsg.date), 'MMM d, yyyy h:mm a') : ''}
                  </span>
                </div>
              </div>
              <div className="border-t pt-6 text-sm whitespace-pre-wrap">
                {msgLoading ? (
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-2 bg-slate-200 rounded"></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                          <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                        </div>
                        <div className="h-2 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: fullBody || '' }} className="prose prose-sm dark:prose-invert max-w-none" />
                )}
                {!msgLoading && msgAttachments.length > 0 && (
                  <div className="mt-8 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {msgAttachments.map((att, i) => (
                        <button
                          key={i}
                          onClick={async () => {
                            try {
                              const { getAttachmentAction } = await import('@/app/actions/email');
                              const res = await getAttachmentAction(organizationId, selectedMsg.id, att.attachmentId);
                              if (res.success && res.attachment && res.attachment.data) {
                                // convert base64url to base64
                                const base64 = res.attachment.data.replace(/-/g, '+').replace(/_/g, '/');
                                const url = `data:${att.mimeType};base64,${base64}`;
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = att.filename;
                                a.click();
                              } else {
                                toast.error('Failed to download attachment');
                              }
                            } catch (e) {
                              toast.error('Failed to download attachment');
                            }
                          }}
                          className="flex items-center gap-2 bg-muted hover:bg-muted/80 transition-colors px-3 py-2 rounded-md border text-sm"
                        >
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="max-w-[200px] truncate">{att.filename}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-8 h-8 opacity-50" />
              </div>
              <p>Select an email to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
