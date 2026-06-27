import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ChatBotWidget from '../components/chat/ChatBotWidget';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontSize: '14px' } }} />
      <ChatBotWidget />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
