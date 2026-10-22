import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  FileText, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { askOpenRouterAssistant } from '../../services/aiService';
import { useApp } from '../../context/AppContext';

interface AIAssistantDrawerProps {
  onClose: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ onClose }) => {
  const { chargers, activeBooking, formatCurrency } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Modulo de analisis predictivo y telemetria activo. Modelo configurado via OpenRouter para analisis de redes electricas y planificacion de carga segun norma NB 777 (Bolivia). Ingrese un comando o consulta tecnica.',
      time: '00:00'
    }
  ]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: prompt, time };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    const context = `Puntos de carga activos en red: ${chargers.length}. Sesion actual: ${activeBooking ? activeBooking.chargerTitle + ' a ' + activeBooking.activeSession?.flowRateKw + ' kW' : 'Ninguna'}. Moneda: Bolivianos (Bs.).`;

    const reply = await askOpenRouterAssistant(prompt, context);
    const aiMsg = { sender: 'ai' as const, text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const samplePrompts = [
    'Calcular autonomia y paradas de recarga La Paz - Cochabamba (Bateria 60 kWh)',
    'Parametros de seguridad electrica y puesta a tierra para cargador trifasico 22kW',
    'Analizar tarifa optima en Bs./kWh considerando costo industrial ENDE'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#1E1E1E] border-l border-[#2C2C2E] shadow-2xl flex flex-col justify-between">
      
      {/* Header */}
      <div className="p-4 border-b border-[#2C2C2E] flex items-center justify-between bg-[#18181A]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Asistente de Telemetria (OpenRouter AI)
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#32D74B] block mt-0.5">
            [ONLINE] Gemini 2.0 Flash / Analitica Electrica
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#121212] border border-[#2C2C2E] flex items-center justify-center text-[#98989D] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="text-[10px] font-mono text-[#98989D] mb-1">
              {m.sender === 'user' ? 'OPERADOR' : 'IA WATT-VISION'} • {m.time}
            </div>
            <div
              className={`p-3.5 rounded-xl text-xs leading-relaxed max-w-[92%] whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-[#00E5FF] text-black font-medium'
                  : 'bg-[#121212] text-white border border-[#2C2C2E]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="p-3 rounded-xl bg-[#121212] border border-[#2C2C2E] text-xs text-[#00E5FF] font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"></span>
            <span>Consultando modelo en OpenRouter...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts & Input */}
      <div className="p-4 border-t border-[#2C2C2E] bg-[#18181A] space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#98989D] block">Consultas Tecnicas Predefinidas:</span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="w-full text-left p-2 rounded-lg bg-[#121212] border border-[#2C2C2E] hover:border-[#00E5FF]/40 text-[11px] text-[#98989D] hover:text-white transition-colors truncate block"
            >
              &gt; {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ingrese parametro o consulta tecnica..."
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 bg-[#121212] border border-[#2C2C2E] rounded-xl text-xs text-white placeholder-[#98989D] focus:outline-none focus:border-[#00E5FF]"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-2.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black rounded-xl font-bold disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
