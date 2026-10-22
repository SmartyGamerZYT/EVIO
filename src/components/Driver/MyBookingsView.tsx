import React from 'react';
import { 
  Car, 
  Zap, 
  FileText, 
  MessageSquare, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MyBookingsViewProps {
  onOpenActiveSession: () => void;
  onOpenReceipt: () => void;
  onOpenChat: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  onOpenActiveSession,
  onOpenReceipt,
  onOpenChat,
}) => {
  const { bookings, formatCurrency, activeBooking } = useApp();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="bg-[#1E1E1E] border border-[#2C2C2E] rounded-card p-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Historial de Recargas y Telemetria</h1>
        <p className="text-xs text-[#98989D] mt-1">
          Seguimiento de sesiones activas, consumo energetico en kWh y comprobantes fiscales de liquidacion.
        </p>
      </div>

      {/* Active Session Highlight Banner */}
      {activeBooking && activeBooking.activeSession && (
        <div className="bg-[#1E1E1E] border-2 border-[#32D74B] rounded-card p-6 relative overflow-hidden shadow-[0_0_25px_rgba(50,215,75,0.15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#32D74B] animate-pulse"></span>
                <span className="text-xs font-mono font-bold text-[#32D74B] uppercase tracking-wider">
                  SESION ACTIVA EN CURSO
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white">{activeBooking.chargerTitle}</h3>
              <p className="text-xs text-[#98989D] mt-0.5 font-mono">
                Vehiculo: {activeBooking.driverVehicle} • Conectado: {activeBooking.startTime}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-bold text-[#98989D] block">Nivel SOC</span>
                <span className="font-mono text-2xl font-bold text-[#32D74B]">
                  {activeBooking.activeSession.batteryPercentage}%
                </span>
              </div>

              <button
                onClick={onOpenActiveSession}
                className="px-5 py-2.5 rounded-xl bg-[#32D74B] hover:bg-[#32D74B]/90 text-black font-mono font-bold text-xs tracking-wider shadow-lg shadow-[#32D74B]/20 transition-all flex items-center gap-1.5"
              >
                <span>VER TELEMETRIA</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions History Table (DESIGN.md: border-bottom 1px solid #2C2C2E, hover #252525) */}
      <div className="bg-[#1E1E1E] border border-[#2C2C2E] rounded-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Registro de Recargas Anteriores</h3>
        
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#98989D] border border-dashed border-[#2C2C2E] rounded-xl font-mono">
            No registra recargas en su cuenta. Seleccione un nodo en el mapa para iniciar una conexion.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2C2C2E] text-[#98989D] uppercase text-[10px] font-mono tracking-wider">
                  <th className="pb-3 font-semibold">Identificador</th>
                  <th className="pb-3 font-semibold">Punto de Recarga</th>
                  <th className="pb-3 font-semibold">Fecha y Tiempo</th>
                  <th className="pb-3 font-semibold">Energia (kWh)</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold">Total Pagado</th>
                  <th className="pb-3 font-semibold text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2C2E]">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-[#252525] transition-colors">
                    <td className="py-3.5 font-mono text-[#00E5FF] font-bold">{b.id}</td>
                    <td className="py-3.5">
                      <div className="font-semibold text-white">{b.chargerTitle}</div>
                      <div className="text-[11px] text-[#98989D] font-mono">Operador: {b.hostName}</div>
                    </td>
                    <td className="py-3.5 font-mono">
                      <div className="text-white">{b.startTime}</div>
                      <div className="text-[11px] text-[#98989D]">{b.durationHours} horas</div>
                    </td>
                    <td className="py-3.5 font-mono text-white font-bold">
                      {b.estimatedKwh} kWh
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        b.status === 'active' 
                          ? 'bg-[#32D74B]/10 text-[#32D74B] border border-[#32D74B]/30'
                          : b.status === 'completed'
                          ? 'bg-[#252525] text-white'
                          : 'bg-[#FFD60A]/10 text-[#FFD60A]'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="py-3.5 text-right space-x-2 font-mono">
                      <button
                        onClick={onOpenReceipt}
                        className="px-2.5 py-1 rounded-lg bg-[#121212] border border-[#2C2C2E] hover:border-[#00E5FF]/40 text-xs text-[#98989D] hover:text-white inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>Factura</span>
                      </button>
                      <button
                        onClick={onOpenChat}
                        className="px-2.5 py-1 rounded-lg bg-[#121212] border border-[#2C2C2E] hover:border-[#00E5FF]/40 text-xs text-[#98989D] hover:text-white inline-flex items-center gap-1"
                        title="Chat con Operador"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#00E5FF]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
