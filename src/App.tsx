import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { Navbar } from './components/Navbar';
import { DriverView } from './components/Driver/DriverView';
import { MyBookingsView } from './components/Driver/MyBookingsView';
import { HostDashboard } from './components/Host/HostDashboard';
import { ListingWizardModal } from './components/Host/ListingWizardModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { ActiveSessionModal } from './components/Driver/ActiveSessionModal';
import { WalletModal } from './components/Common/WalletModal';
import { ReceiptModal } from './components/Common/ReceiptModal';
import { ChatDrawer } from './components/Common/ChatDrawer';
import { AIAssistantDrawer } from './components/Common/AIAssistantDrawer';
import { Zap, ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, role } = useApp();

  const [currentTab, setCurrentTab] = useState<'driver' | 'bookings' | 'host' | 'admin'>('driver');
  const [showListingWizard, setShowListingWizard] = useState(false);
  const [showActiveSession, setShowActiveSession] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showAIDrawer, setShowAIDrawer] = useState(false);

  // If no user is logged in, show the AuthScreen (PRD Section 1.4: "1. User lands on the Login / Sign-up page.")
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans selection:bg-[#00E5FF] selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenWallet={() => setShowWalletModal(true)}
        onOpenChat={() => setShowChatDrawer(true)}
        onOpenActiveSession={() => setShowActiveSession(true)}
        onOpenAI={() => setShowAIDrawer(true)}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'driver' && (
          <DriverView 
            onOpenActiveSession={() => setShowActiveSession(true)} 
            onOpenListingWizard={() => setShowListingWizard(true)}
          />
        )}

        {currentTab === 'bookings' && (
          <MyBookingsView
            onOpenActiveSession={() => setShowActiveSession(true)}
            onOpenReceipt={() => setShowReceiptModal(true)}
            onOpenChat={() => setShowChatDrawer(true)}
          />
        )}

        {currentTab === 'host' && (
          <HostDashboard
            onOpenListingWizard={() => setShowListingWizard(true)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel />
        )}
      </main>

      {/* Modals & Drawers */}
      {showListingWizard && (
        <ListingWizardModal
          onClose={() => setShowListingWizard(false)}
          onSuccess={() => {
            setShowListingWizard(false);
            setCurrentTab('admin');
          }}
        />
      )}

      {showActiveSession && (
        <ActiveSessionModal
          onClose={() => setShowActiveSession(false)}
          onOpenChat={() => setShowChatDrawer(true)}
          onViewReceipt={() => setShowReceiptModal(true)}
        />
      )}

      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
        />
      )}

      {showReceiptModal && (
        <ReceiptModal
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {showChatDrawer && (
        <ChatDrawer
          onClose={() => setShowChatDrawer(false)}
        />
      )}

      {showAIDrawer && (
        <AIAssistantDrawer
          onClose={() => setShowAIDrawer(false)}
        />
      )}

      {/* Technical Footer (DESIGN.md: Technical tone & reliability) */}
      <footer className="border-t border-[#2C2C2E] bg-[#18181A] py-5 px-4 sm:px-8 mt-12 text-xs text-[#98989D] font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center font-bold">
              <Zap className="w-3 h-3 fill-[#00E5FF]" />
            </div>
            <span className="font-bold text-white tracking-wider">WATT-VISION TELEMETRY v1.0</span>
            <span className="hidden md:inline text-[#98989D]">• Red Electrica Descentralizada</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5 text-[#32D74B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conformidad NB 777 Verificada</span>
            </span>
            <span>Sistema Dark Mode (WattVision DESIGN.md)</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
