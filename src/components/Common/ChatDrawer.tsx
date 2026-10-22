import React, { useState } from 'react';
import { X, Send, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatDrawerProps {
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ onClose }) => {
  const { currentUser, chatMessages, sendChatMessage } = useApp();
  const [inputText, setInputText] = useState('');

  const activeBookingId = 'BKG-DEFAULT';

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    sendChatMessage(activeBookingId, text);
    setInputText('');
  };

  const quickMessages = [
    'En aproximacion a porton de estacion.',
    'Conectado al punto de recarga trifasico.',
    'Suministro completado. Desconectando bahia.',
    'Confirmar recepcion de datos de telemetria.'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#1E1E1E] border-l border-[#2C2C2E] shadow-2xl flex flex-col justify-between font-sans">
      
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C2E] flex items-center justify-between bg-[#18181A]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#32D74B] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-white uppercase">Canal de Enlace Operador - Conductor</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#98989D] mt-0.5">
            <ShieldCheck className="w-3 h-3 text-[#32D74B]" />
            <span>Transmision encriptada de telemetria</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#121212] border border-[#2C2C2E] flex items-center justify-center text-[#98989D] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
        {chatMessages.length === 0 ? (
          <div className="text-center p-8 text-xs text-[#98989D]">
            No hay transmisiones previas en este canal.
          </div>
        ) : (
          chatMessages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 mb-0.5 text-[10px] text-[#98989D]">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#00E5FF] text-black font-semibold rounded-br-none'
                      : 'bg-[#252525] text-white border border-[#2C2C2E] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Action Chips & Input Box */}
      <div className="p-4 border-t border-[#2C2C2E] bg-[#18181A] space-y-3 font-mono">
        
        {/* Quick Message Chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickMessages.map(qm => (
            <button
              key={qm}
              onClick={() => handleSend(qm)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-[#121212] border border-[#2C2C2E] text-[#98989D] hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all text-left"
            >
              [+] {qm}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Escriba mensaje operativo..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-[#121212] border border-[#2C2C2E] rounded-xl text-xs text-white placeholder-[#98989D] focus:outline-none focus:border-[#00E5FF]"
          />
          <button
            type="submit"
            className="p-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black rounded-xl font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
