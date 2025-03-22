import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  messages: { id: number; text: string; sender: 'User' | 'Ai'; status:'sent' | 'delivered' | 'read'}[];
  theme: 'light' | 'dark';
  isAItyping : boolean;
  userStatus : 'Online' | 'Offline' | 'Typing';
  addMessage: (text: string, sender: 'User' | 'Ai') => void;
  toggleTheme: () => void;
  setAItyping: (typing: boolean) => void;
  clearmessages: () => void;
  setUserStatus: (status : 'Online' | 'Offline' | 'Typing') => void;
  messageStatus: (id:number, status : 'sent' | 'delivered' | 'read') => void;
  editMessage:(id:number,newText:string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      theme: 'dark',
      isAItyping: false,
      userStatus: 'Online',
      addMessage: (text, sender) =>
        set((state) => ({
          messages: [...state.messages, { id: Date.now(), text, sender, status: 'sent'}],
        })),
      toggleTheme: () =>
        set((state) => {
          return { theme: state.theme === 'light' ? 'dark' : 'light' };
        }),
      setAItyping:(typing) => set({ isAItyping: typing}),
      clearmessages: () => set({ messages: [] }),
      setUserStatus:(status) => set({userStatus:status }),
      messageStatus:(id,status) => set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id ? {...msg,status} : msg
        )
      })),
      editMessage: (id,newText) => 
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? {...msg, text:newText} : msg),
        }))
    }),
    { name: 'chat-storage' }
  )
);