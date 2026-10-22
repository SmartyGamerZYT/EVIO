import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Cpu, 
  Layers,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, ConnectorType, UserProfile } from '../../types';

export const AuthScreen: React.FC = () => {
  const { loginUser } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('driver');
  const [vehicleModel, setVehicleModel] = useState('Tesla Model 3');
  const [connector, setConnector] = useState<ConnectorType>('CCS-2');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const user: UserProfile = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0] || 'EV Driver',
      email: email || 'driver@evio.network',
      phone: '+1 555-0192',
      role: selectedRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      walletBalance: 75.0,
      vehicle: selectedRole === 'driver' ? {
        make: vehicleModel.split(' ')[0] || 'EV',
        model: vehicleModel,
        batteryCapacity: 60.0,
        connector,
        plateNumber: 'EV-7829',
      } : undefined
    };

    loginUser(user);
  };

  const handleQuickAccess = (role: UserRole) => {
    const rolesConfig = {
      driver: {
        name: 'Sarah Jenkins (Driver)',
        email: 'sarah.j@evio.network',
        role: 'driver' as UserRole,
        vehicle: {
          make: 'Tesla',
          model: 'Model Y',
          batteryCapacity: 75.0,
          connector: 'CCS-2' as ConnectorType,
          plateNumber: '7X-9821',
        }
      },
      host: {
        name: 'Marcus Vance (Host)',
        email: 'marcus.v@powerhub.com',
        role: 'host' as UserRole,
        vehicle: undefined
      },
      admin: {
        name: 'Network Supervisor',
        email: 'ops@evio.network',
        role: 'admin' as UserRole,
        vehicle: undefined
      }
    };

    const sel = rolesConfig[role];
    const user: UserProfile = {
      id: `usr-${role}-default`,
      name: sel.name,
      email: sel.email,
      phone: '+1 555-0144',
      role: sel.role,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      walletBalance: role === 'driver' ? 120.0 : 480.0,
      vehicle: sel.vehicle,
    };

    loginUser(user);
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#0F172A] flex flex-col justify-center items-center p-4 selection:bg-[#0284C7] selection:text-white">
      
      {/* Top Header */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#BAE6FD] shadow-sm mb-3">
          <Zap className="w-4 h-4 text-[#0284C7] fill-[#0284C7]" />
          <span className="font-mono text-xs font-bold tracking-wider text-[#0284C7]">EVIO NETWORK ACCESS</span>
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Peer-to-Peer EV Charging</h1>
        <p className="text-xs text-[#64748B] mt-1">
          Community charging infrastructure management and real-time power telemetry.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white border border-[#BAE6FD] rounded-card p-6 sm:p-8 shadow-xl relative">
        
        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-6">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin' ? 'bg-white text-[#0284C7] font-bold shadow-sm border border-[#BAE6FD]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup' ? 'bg-white text-[#0284C7] font-bold shadow-sm border border-[#BAE6FD]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1">Full Name or Business</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. David Vance"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#475569] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@evio.network"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#475569] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-xs font-semibold text-[#475569] block mb-2">Network Operating Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('driver')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  selectedRole === 'driver'
                    ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0F172A] shadow-sm'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                }`}
              >
                <span className="font-mono font-bold block text-[#0284C7] mb-0.5">EV DRIVER</span>
                <span className="text-[11px] text-[#64748B]">Find & charge nearby</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('host')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  selectedRole === 'host'
                    ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0F172A] shadow-sm'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                }`}
              >
                <span className="font-mono font-bold block text-[#16A34A] mb-0.5">CHARGER HOST</span>
                <span className="text-[11px] text-[#64748B]">Monetize home bay</span>
              </button>
            </div>
          </div>

          {/* Connector spec for drivers */}
          {selectedRole === 'driver' && (
            <div className="p-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] space-y-2">
              <label className="text-[11px] font-mono font-bold text-[#0284C7] uppercase block">Primary Vehicle Connector</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {(['Type 2', 'CCS-2', 'GB/T'] as ConnectorType[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConnector(c)}
                    className={`py-1.5 rounded-lg border text-center transition-all ${
                      connector === c ? 'bg-[#0284C7] text-white font-bold border-[#0284C7]' : 'bg-white border-[#CBD5E1] text-[#475569]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs tracking-wider shadow-md shadow-[#0284C7]/25 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration & Access'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Quick System Access */}
        <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-2.5 text-center font-bold">
            Quick Operator Profiles
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <button
              onClick={() => handleQuickAccess('driver')}
              className="p-2 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] hover:border-[#0284C7] text-[#0284C7] font-bold text-center transition-colors"
            >
              Driver
            </button>
            <button
              onClick={() => handleQuickAccess('host')}
              className="p-2 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] hover:border-[#16A34A] text-[#16A34A] font-bold text-center transition-colors"
            >
              Host
            </button>
            <button
              onClick={() => handleQuickAccess('admin')}
              className="p-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#0F172A] text-[#0F172A] font-bold text-center transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

      </div>

      {/* Footer System Verification */}
      <div className="mt-6 text-center text-[11px] font-mono text-[#64748B] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
        <span>Certified Electrical Installation & Safety Compliance</span>
      </div>

    </div>
  );
};
