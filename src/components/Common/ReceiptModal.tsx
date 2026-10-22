import React from 'react';
import { 
  X, 
  Zap, 
  Printer, 
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReceiptModalProps {
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ onClose }) => {
  const { currentUser, formatCurrency, bookings } = useApp();

  const latestBooking = bookings[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1E1E1E] border border-[#2C2C2E] rounded-card w-full max-w-lg p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#121212] border border-[#2C2C2E] flex items-center justify-center text-[#98989D] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Invoice Header */}
        <div className="text-center pb-6 border-b border-[#2C2C2E]">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5 fill-[#00E5FF]" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] font-bold">FACTURA DE RECARGA ENERGETICA</span>
          <h2 className="text-lg font-semibold text-white mt-1">Comprobante de Suministro Electrico</h2>
          <p className="text-xs text-[#98989D] font-mono">N° Autorizacion SIN: 4892019482910</p>
        </div>

        {/* Breakdown Items */}
        <div className="py-6 space-y-3 text-xs font-mono border-b border-[#2C2C2E]">
          <div className="flex justify-between text-[#98989D]">
            <span>Estacion de Carga:</span>
            <span className="text-white font-medium">{latestBooking?.chargerTitle || 'Estacion Calacoto 22kW'}</span>
          </div>
          <div className="flex justify-between text-[#98989D]">
            <span>Operador / Host:</span>
            <span className="text-white font-medium">{latestBooking?.hostName || 'Operador Local'}</span>
          </div>
          <div className="flex justify-between text-[#98989D]">
            <span>Vehiculo Conectado:</span>
            <span className="text-white font-medium">{latestBooking?.driverVehicle || 'EV Suministrado'}</span>
          </div>
          <div className="flex justify-between text-[#98989D]">
            <span>Energia Neta Entregada:</span>
            <span className="text-white font-bold">{latestBooking?.estimatedKwh || 18.5} kWh</span>
          </div>
          <div className="flex justify-between text-[#98989D]">
            <span>Tiempo de Suministro:</span>
            <span className="text-white">{latestBooking?.durationHours || 1.5} Horas</span>
          </div>
          <div className="flex justify-between text-[#98989D]">
            <span>Modalidad de Pago:</span>
            <span className="text-white font-bold uppercase">{latestBooking?.paymentMethod || 'Billetera Digital'}</span>
          </div>
        </div>

        {/* Total Cost in Bs. */}
        <div className="py-4 border-b border-[#2C2C2E] flex justify-between items-baseline font-mono">
          <div>
            <span className="text-xs text-[#98989D] block">Importe Total Liquidado</span>
            <span className="text-[10px] text-[#32D74B] flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Liquidado y emitido
            </span>
          </div>
          <div className="text-[28px] font-bold text-[#00E5FF]">
            {formatCurrency(latestBooking?.totalAmount || 38.85)}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 flex gap-3 font-mono">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-white font-semibold text-xs flex items-center justify-center gap-2 border border-[#2C2C2E]"
          >
            <Printer className="w-4 h-4 text-[#00E5FF]" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold text-xs tracking-wider shadow-lg shadow-[#00E5FF]/20"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
