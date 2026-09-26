'use client';

import { useState, useRef } from 'react';
import { Paperclip, Sparkles, X, Folder } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { sendEmailAction, rewriteTextAction } from '@/app/actions/email';
import { listDriveContentsAction } from '@/app/actions/drive';

interface SendEmailFormProps {
  organizationId: string;
  defaultTo?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function SendEmailForm({ organizationId, defaultTo = '', onCancel, onSuccess }: SendEmailFormProps) {
  const [loading, setLoading] = useState(false);
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [rewritingSubject, setRewritingSubject] = useState(false);
  const [rewritingBody, setRewritingBody] = useState(false);
  
  const [attachments, setAttachments] = useState<{name: string, mimeType: string, base64?: string, driveFileId?: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await sendEmailAction(organizationId, to, subject, body, false, attachments);
      
      if (result.success) {
        toast.success('Email sent successfully!');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async (type: 'subject' | 'body') => {
    const text = type === 'subject' ? subject : body;
    if (!text) {
      toast.error(`Please enter a ${type} to rewrite`);
      return;
    }

    if (type === 'subject') setRewritingSubject(true);
    else setRewritingBody(true);

    try {
      const result = await rewriteTextAction(text, type);
      if (result.success && result.text) {
        if (type === 'subject') setSubject(result.text);
        else setBody(result.text);
        toast.success(`AI rewritten ${type} successfully`);
      } else {
        toast.error(`Failed to rewrite ${type}`);
      }
    } catch (err) {
      toast.error('Unexpected error during rewrite');
    } finally {
      if (type === 'subject') setRewritingSubject(false);
      else setRewritingBody(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const [folderStack, setFolderStack] = useState<{id: string, name: string}[]>([{id: 'root', name: 'My Drive'}]);

  const loadDriveFolder = async (folderId: string) => {
    setLoadingDrive(true);
    const res = await listDriveContentsAction(organizationId, folderId);
    if (res.success && res.files) {
      setDriveFiles(res.files);
    } else {
      toast.error(res.error || 'Failed to load Google Drive files');
    }
    setLoadingDrive(false);
  };

  const openDrivePicker = async () => {
    setShowDriveModal(true);
    if (folderStack.length === 1 && folderStack[0].id === 'root' && driveFiles.length > 0) return;
    
    setFolderStack([{id: 'root', name: 'My Drive'}]);
    await loadDriveFolder('root');
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold tracking-tight">Compose Email</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Compose and send an email directly from the platform.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="to">To</Label>
          <Input 
            id="to" 
            placeholder="recipient@example.com" 
            value={to} 
            onChange={(e) => setTo(e.target.value)} 
          />
        </div>
        
        <div className="grid gap-2 relative group">
          <div className="flex items-center justify-between">
            <Label htmlFor="subject">Subject</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-blue-500 hover:text-blue-600"
              onClick={() => handleRewrite('subject')}
              disabled={rewritingSubject}
            >
              <Sparkles className="w-3 h-3 mr-1" /> {rewritingSubject ? 'Rewriting...' : 'Rewrite'}
            </Button>
          </div>
          <Input 
            id="subject" 
            placeholder="Email Subject" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
          />
        </div>
        
        <div className="grid gap-2 relative group flex-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">Message Draft</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-blue-500 hover:text-blue-600"
              onClick={() => handleRewrite('body')}
              disabled={rewritingBody}
            >
              <Sparkles className="w-3 h-3 mr-1" /> {rewritingBody ? 'Rewriting...' : 'Rewrite'}
            </Button>
          </div>
          <Textarea 
            id="body" 
            placeholder="Type your message here..." 
            className="min-h-[200px] flex-1 resize-none"
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
          />
        </div>
        
        <div className="grid gap-2 pt-2">
          <Label>Attachments</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm">
                <span className="truncate max-w-[150px]">{att.name}</span>
                <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <Button variant="outline" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="w-4 h-4 mr-2" /> Upload File
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={openDrivePicker}>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 2 2 19h20L12 2Z"/></svg>
               Google Drive
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDriveModal} onOpenChange={setShowDriveModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-1 text-base">
              {folderStack.map((f, i) => (
                <span key={f.id} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted-foreground mx-1">/</span>}
                  <button 
                    className="hover:underline hover:text-blue-500 font-medium" 
                    onClick={() => {
                      const newStack = folderStack.slice(0, i + 1);
                      setFolderStack(newStack);
                      loadDriveFolder(f.id);
                    }}
                  >
                    {f.name}
                  </button>
                </span>
              ))}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {loadingDrive ? (
              <div className="text-center text-sm text-muted-foreground py-10">Loading folder contents...</div>
            ) : driveFiles.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">This folder is empty.</div>
            ) : (
              <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-2">
                {driveFiles.map(file => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  return (
                    <Button 
                      key={file.id} 
                      variant="ghost" 
                      className="justify-start truncate w-full font-normal"
                      onClick={() => {
                        if (isFolder) {
                          setFolderStack(prev => [...prev, {id: file.id, name: file.name}]);
                          loadDriveFolder(file.id);
                        } else {
                          setAttachments(prev => [...prev, {
                            name: file.name,
                            mimeType: file.mimeType,
                            driveFileId: file.id
                          }]);
                          setShowDriveModal(false);
                        }
                      }}
                    >
                      {isFolder ? <Folder className="w-4 h-4 mr-3 shrink-0 text-blue-500 fill-blue-500/20" /> : <Paperclip className="w-4 h-4 mr-3 shrink-0 text-muted-foreground" />}
                      <span className="truncate">{file.name}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Discard
        </Button>
        <Button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send Email'}
        </Button>
      </div>
    </div>
  );
}
