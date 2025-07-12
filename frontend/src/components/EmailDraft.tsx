import React, { useState } from 'react';
import { PaperAirplaneIcon, TrashIcon, PencilIcon, CheckIcon } from '@/components/icons';
import type { EmailDraft as EmailDraftType } from '../types';

interface EmailDraftProps {
  draft: EmailDraftType;
  onSend: (draftId: string) => void;
  onDelete: (draftId: string) => void;
  onUpdate: (draftId: string, to: string, subject: string, body: string) => void;
}

export const EmailDraft: React.FC<EmailDraftProps> = ({ draft, onSend, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [to, setTo] = useState(draft.to);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);

  const handleSave = () => {
    onUpdate(draft.id, to, subject, body);
    setIsEditing(false);
  };

  return (
    <div className="email-draft">
      <div className="email-draft-header">
        <h3>Draft Email</h3>
        <button onClick={() => setIsEditing(!isEditing)} className="edit-button">
          {isEditing ? <CheckIcon className="w-5 h-5" /> : <PencilIcon className="w-5 h-5" />}
          <span>{isEditing ? 'Done' : 'Edit'}</span>
        </button>
      </div>
      <div className="email-draft-body">
        {isEditing ? (
          <div className="edit-form">
            <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" />
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />
          </div>
        ) : (
          <>
            <p><strong>To:</strong> {to}</p>
            <p><strong>Subject:</strong> {subject}</p>
            <div dangerouslySetInnerHTML={{ __html: body }} />
          </>
        )}
      </div>
      <div className="email-draft-actions">
        {isEditing ? (
          <button onClick={handleSave} className="save-button">
            <CheckIcon className="w-5 h-5" />
            <span>Save</span>
          </button>
        ) : (
          <>
            <button onClick={() => onSend(draft.id)} className="send-button">
              <PaperAirplaneIcon className="w-5 h-5" />
              <span>Send</span>
            </button>
            <button onClick={() => onDelete(draft.id)} className="delete-button">
              <TrashIcon className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

