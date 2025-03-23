'use client'
import { useRef, useEffect, useState} from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../lib/store';
import '../globals.css';
import ReactMarkdown from 'react-markdown';
import EmojiPicker from 'emoji-picker-react';


export default function Chat() {
  const { messages,isAItyping,addMessage,setAItyping,clearmessages,userStatus,setUserStatus,messageStatus,editMessage,theme,setTheme} = useChatStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 280;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  })
  const themes = ['light', 'dark', 'neon', 'retro','royale'];
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
      addMessage("Cool! My mistake, let's try to re-initiate the conversation.","Ai")
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
    <div className='body'>
    <div className="h-screen flex flex-col p-10 chat-container">
      <div className="flex justify-between mb-4 dark:bg-transparent dark:text-white subpixel-antialiased font-bold font-mono text-4xl tracking-wider">
        <h1 className="bebas-neue-regular title dark:montserrat-underline">Edu-Chat Application</h1>
        <p className="status-text text-base bebas-neue-regular dark:montserrat-underline">User: {userStatus}</p>
      </div>
      <div className="flex justify-end mb-4">
        <button className="p-2 bg-blue-900 mr-1 text-white rounded-xl transition delay-250 hover:-translate-y-1 hover:scale-110 hover:bg-red-900 transition" onClick={clearmessages}> 
            Clear Chat
        </button>
        <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="p-2 rounded transition delay-50 rounded-2xl border text-black theme-selector"
          >{themes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
        </select> 
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-20">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ type: "spring" }}
            className={`pl-4 pt-1 pb-1 mb-2 break-words text-pretty rounded-2xl ${
              msg.sender === 'User' ? 'border-2 border-black user-msg'  : 'border-2 border-black ai-msg'
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
              className="w-full p-1 edit rounded-xl text-white outline-none"
              autoFocus
            />
            ) : <ReactMarkdown>{msg.text}</ReactMarkdown> }

            <span className="text-sm opacity-70">
              {msgStatusIcon(msg.status)}
              {msg.status === 'read' && msg.sender === 'User' ? (
                <span className="text-blue-500">✓✓</span>
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
        className="p-3 mt-2 flex-1 rounded-3xl border-2 border transition delay-50 input-field"
        placeholder="Start the Discussion!"
        rows={1}
      />
      <div className={`absolute bottom-2 right-12 text-sm ${input.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
          {input.length}/{MAX_CHARS}
      </div>
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="relative mt-2 p-3 rounded-3xl transition delay-50 hover:-translate-y-1 hover:scale-110 border-2 left-2 border border-zinc-600 input-field">😊
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