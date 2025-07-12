import { create } from 'zustand';
import type { Email } from '@shared/types';

export type EditorMode = 'compose' | 'reply' | 'edit';

interface EditorState {
  isOpen: boolean;
  mode: EditorMode | null;
  email: Partial<Email> | null;
  draftId: string | null;
  setEditorState: (state: Partial<EditorState>) => void;
  openEditor: (mode: EditorMode, email?: Partial<Email>, draftId?: string | null) => void;
  closeEditor: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isOpen: false,
  mode: null,
  email: null,
  draftId: null,
  setEditorState: (newState) => set((state) => ({ ...state, ...newState })),
  openEditor: (mode, email = {}, draftId = null) => set({
    isOpen: true,
    mode,
    email: {
      to: email.to || '',
      subject: email.subject || '',
      body: email.body || '',
      ...email,
    },
    draftId,
  }),
  closeEditor: () => set({
    isOpen: false,
    mode: null,
    email: null,
    draftId: null,
  }),
}));
