import { Metadata } from 'next';
import ChatInterface from '@/components/ChatInterface';

export const metadata: Metadata = {
  title: 'AI Skript Oluşturucu | Skripted Engine',
  description: 'Yapay zeka yardımıyla saniyeler içinde karmaşık Minecraft skriptleri oluşturun.',
};

export default function ChatPage() {
  return <ChatInterface />;
}
