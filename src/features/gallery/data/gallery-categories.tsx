import React from 'react';
import { Sparkles, Wallet, Shield, Gamepad2, MessageSquare, Lock, FolderOpen } from 'lucide-react';

export const CATEGORY_IDS = ['All', 'Economy', 'Admin', 'Minigame', 'Chat', 'Security', 'Other'];

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Sparkles className="w-4 h-4" />,
  Economy: <Wallet className="w-4 h-4" />,
  Admin: <Shield className="w-4 h-4" />,
  Minigame: <Gamepad2 className="w-4 h-4" />,
  Chat: <MessageSquare className="w-4 h-4" />,
  Security: <Lock className="w-4 h-4" />,
  Other: <FolderOpen className="w-4 h-4" />,
};
