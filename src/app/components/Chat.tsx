'use client'
import { useRef, useEffect, useState} from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../lib/store';
import ThemeToggle from './ThemeToggle';
import '../globals.css';
import ReactMarkdown from 'react-markdown';
import EmojiPicker from 'emoji-picker-react';


export default function Chat() {
  const { messages,isAItyping,addMessage,setAItyping,clearmessages,userStatus,setUserStatus,messageStatus,editMessage} = useChatStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 280;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const messageID = Date.now();
      addMessage(input, 'User');
      setInput('');
      setTimeout(()=> messageStatus(messageID,"sent"),1000);
      setTimeout(()=> messageStatus(messageID,"delivered"),1000);
      setTimeout(()=> messageStatus(messageID,"read"),1000);
      setAItyping(true);
      setTimeout(() => {
        setAItyping(false)
        const aimsgId = Date.now();
        addMessage('Hey there! What can I do for you today?', 'Ai')
        setTimeout(() => messageStatus(aimsgId,"delivered"),500)
      }, 1000);
    }
  };

  const handleEmojiClick = (e:{emoji:string}) => {
    setInput((prev) => prev + e.emoji);
    setShowEmojiPicker(false);
  }

  const edit = (msg: { sender: string; id: number | null; text: string; }) => {
      if(msg.sender === 'User'){
        setEditId(msg.id)
        setEditText(msg.text)
    }
  }
  const EditReply = () => {
    setAItyping(true);
    setTimeout(() => {
      setAItyping(false)
      const AiMsgId = Date.now()
      addMessage("Cool! My mistake, let's try to re-initiate the converstion.","Ai")
      setTimeout(() => messageStatus(AiMsgId,'delivered'),500);
    },1000)
  }

  const saveEdit = () => {
      if (editId && editText.trim()){
        editMessage(editId,editText)
        setEditId(null)
        setEditText('')
        EditReply()
      }
  }
  const handleKeys = (e:React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === 'Enter' && !e.shiftKey)
    {
      e.preventDefault();
      if(input=== '@help'){
        setAItyping(true);
        setTimeout(() => {
          setAItyping(false)
          const aimsgId = Date.now();
          addMessage('**Shift + Enter** _to add new lines to the chat_, _**Enter** to send the message_','Ai')
          setTimeout(() => messageStatus(aimsgId,"delivered"),500)
        }, 1000);
        setInput('');
      }
      else{
        handleSend();
      }
    }
    else if(e.key === 'Enter' && e.shiftKey){
      e.preventDefault();
      setInput((prev) => {
        return prev + '\n'});
    }
  }
  const msgStatusIcon = (status : string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };
  const userHandling = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const l = e.target.value;
    if(l.length<=MAX_CHARS){
      setInput(e.target.value)
      setUserStatus('Typing')
      setTimeout(() => setUserStatus('Online'), 1500)
    }  
  }
  return (
    <div>
    <div className="h-screen flex flex-col p-10 bg-yellow-400/20 dark:bg-black">
      <div className="flex justify-between mb-4 dark:bg-transparent dark:text-white subpixel-antialiased font-bold font-mono text-4xl tracking-wider">
        <h1 className="text-slate-950 bebas-neue-regular dark:text-neutral-400 dark:montserrat-underline">Edu-Chat Application</h1>
        <p className="text-violet-900 text-base bebas-neue-regular dark:text-cyan-400 dark:montserrat-underline">User: {userStatus}</p>
      </div>
      <div className="flex justify-end mb-4">
        <button className="p-2 bg-blue-900 mr-1 text-white rounded-xl hover:bg-red-900 transition" onClick={clearmessages}> 
            Clear Chat
        </button>
        <ThemeToggle />
      </div>
      <div className="flex-1 overflow-y-auto p-20">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ type: "spring" }}
            className={`pl-4 pt-1 pb-1 mb-2 break-words text-pretty rounded-2xl ${
              msg.sender === 'User' ? 'bg-emerald-900/75 border-2 border-black text-slate-100 dark:bg-teal-900 dark:text-slate-300'  : 'bg-teal-300/30 border-2 border-black text-gray-900 dark:bg-zinc-900 dark:text-slate-300'
            }`}
            onClick={() => edit(msg)}
          >
            <b>{msg.sender} : </b>

            {editId === msg.id ? (
              <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveEdit();
                }
              }}
              rows={1}
              className="w-full p-1 bg-teal-900/90 rounded-xl text-white outline-none dark:bg-teal-700"
              autoFocus
            />
            ) : <ReactMarkdown>{msg.text}</ReactMarkdown> }

            <span className="text-sm opacity-70">
              {msgStatusIcon(msg.status)}
              {msg.status === 'read' && msg.sender === 'User' ? (
                <span className="text-red-500">✓✓</span>
              ) : null}
            </span>
          </motion.div>
        ))}
        {isAItyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-2 text-gray-500 dark:text-gray-400"
          >
            AI is typing...
          </motion.div>
        )}
        {userStatus === 'Typing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring" }}
            className="p-2 text-gray-500 dark:text-gray-400"
          >
            You are Typing...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
      <textarea
        value={input}
        onChange={userHandling}
        onKeyDown={handleKeys}
        className="p-3 mt-2 flex-1 rounded-3xl border-2 placeholder-stone-950 border border-amber-900/20 bg-amber-900/40 dark:bg-neutral-800 dark:text-slate-200 dark:border-teal-700 dark:border-e dark:placeholder-zinc-400"
        placeholder="Start the Discussion!"
        rows={1}
      />
      <div className={`absolute bottom-2 right-12 text-sm ${input.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
          {input.length}/{MAX_CHARS}
      </div>
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="relative mt-2 p-3 rounded-3xl border-2 border-amber-900/20 left-2 placeholder-amber-900 border border-zinc-600 bg-amber-900/40 dark:bg-neutral-800 dark:text-white dark:border-teal-800 dark:placeholder-cyan-800">😊
      </button>
      </div>
      {showEmojiPicker && (
          <div className="absolute bottom-20 right-11 dark:bg-gray-900">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
}