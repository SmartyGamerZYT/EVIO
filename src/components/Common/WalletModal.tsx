import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  PlusCircle, 
  Smartphone, 
  CreditCard, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WalletModalProps {
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
  const { currentUser, formatCurrency, topUpWallet } = useApp();
  const [topUpAmount, setTopUpAmount] = useState<number>(100);
  const [paymentOption, setPaymentOption] = useState<'qr' | 'card'>('qr');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTopUp = () => {
    topUpWallet(topUpAmount);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  const transactions = [
    { id: 'TX-901', desc: 'Recarga de Energia #BKG-901', amount: -42.8, date: 'Hoy, 14:30', type: 'debit' },
    { id: 'TX-882', desc: 'Abono QR Simple Banco Union', amount: +200.0, date: 'Ayer, 09:15', type: 'credit' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1E1E1E] border border-[#2C2C2E] rounded-card w-full max-w-md p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#121212] border border-[#2C2C2E] flex items-center justify-center text-[#98989D] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Balance Card (DESIGN.md: JetBrains Mono 32px Bold) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-[#98989D] uppercase tracking-wider font-mono font-bold mb-1">
            <Wallet className="w-4 h-4 text-[#00E5FF]" />
            <span>Billetera de Red WattVision</span>
          </div>
          <div className="font-mono text-[32px] font-bold text-white tracking-tight">
            {formatCurrency(currentUser?.walletBalance || 0)}
          </div>
          <p className="text-xs text-[#98989D] mt-1 font-mono">Saldo habilitado para liquidacion inmediata por kWh.</p>
        </div>

        {/* Top-up controls */}
        <div className="bg-[#121212] border border-[#2C2C2E] rounded-2xl p-4 mb-6 space-y-4 font-mono">
          <span className="text-xs font-bold text-white block uppercase">Abono de Fondos</span>
          
          <div className="grid grid-cols-3 gap-2">
            {[50, 100, 250].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopUpAmount(amt)}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                  topUpAmount === amt
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]'
                    : 'bg-[#1E1E1E] border-[#2C2C2E] text-[#98989D] hover:text-white'
                }`}
              >
                +{formatCurrency(amt)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setPaymentOption('qr')}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 ${
                paymentOption === 'qr' ? 'bg-[#252525] border-[#00E5FF] text-white' : 'border-[#2C2C2E] text-[#98989D]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>QR Simple</span>
            </button>
            <button
              onClick={() => setPaymentOption('card')}
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 ${
                paymentOption === 'card' ? 'bg-[#252525] border-[#00E5FF] text-white' : 'border-[#2C2C2E] text-[#98989D]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Tarjeta Debito</span>
            </button>
          </div>

          <button
            onClick={handleTopUp}
            className="w-full py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold text-xs tracking-wider shadow-lg shadow-[#00E5FF]/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 fill-black" />
            <span>ABONAR {formatCurrency(topUpAmount)}</span>
          </button>

          {showSuccess && (
            <div className="p-2 rounded-xl bg-[#32D74B]/10 border border-[#32D74B]/40 text-[#32D74B] text-xs font-semibold text-center flex items-center justify-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Abono acreditado exitosamente.</span>
            </div>
          )}
        </div>

        {/* Transactions */}
        <div>
          <span className="text-xs uppercase font-mono font-bold text-[#98989D] tracking-wider block mb-3">Movimientos Contables</span>
          <div className="space-y-2 font-mono">
            {transactions.map(tx => (
              <div key={tx.id} className="p-2.5 rounded-xl bg-[#121212] border border-[#2C2C2E] flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{tx.desc}</span>
                  <span className="text-[10px] text-[#98989D]">{tx.date}</span>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? 'text-[#32D74B]' : 'text-white'}`}>
                  {tx.amount > 0 ? `+${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
