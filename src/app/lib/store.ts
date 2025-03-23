import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ChatState {
  messages: { id: number; text: string; sender: 'User' | 'Ai'; status:'sent' | 'delivered' | 'read'}[];
  isAItyping : boolean;
  theme: string;
  userStatus : 'Online' | 'Offline' | 'Typing';
  addMessage: (text: string, sender: 'User' | 'Ai') => void;
  setAItyping: (typing: boolean) => void;
  clearmessages: () => void;
  setUserStatus: (status : 'Online' | 'Offline' | 'Typing') => void;
  messageStatus: (id:number, status : 'sent' | 'delivered' | 'read') => void;
  editMessage:(id:number,newText:string) => void;
  setTheme: (theme:string) => void;
}

const isBrowser = typeof window !== 'undefined';

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isAItyping: false,
      userStatus: 'Online',
      theme: isBrowser ? localStorage.getItem('theme') || 'Light' : 'Light',
      addMessage: (text, sender) =>
        set((state) => ({
          messages: [...state.messages, { id: Date.now(), text, sender, status: 'sent'}],
        })),
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
        })),
      setTheme:(theme) => 
        set(() => {
          if(isBrowser){
            localStorage.setItem('theme',theme);
          }
          return {theme};
          }),
    }),
    { name: 'Chat-Store', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);