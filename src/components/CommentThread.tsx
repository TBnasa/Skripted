'use client';

import React, { useState } from 'react';
import { User, MessageSquare, Reply, Trash2, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  avatar_url?: string;
  author_username?: string;
}

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  currentUserId?: string | null;
  onCommentAdded: (comment: Comment) => void;
}

const CommentItem = ({ 
  comment, 
  allComments, 
  postId, 
  currentUserId,
  onCommentAdded,
  level = 0 
}: { 
  comment: Comment, 
  allComments: Comment[], 
  postId: string, 
  currentUserId?: string | null,
  onCommentAdded: (comment: Comment) => void,
  level?: number 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const replies = allComments.filter(c => c.parent_id === comment.id);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error('Cevap vermek için giriş yapmalısınız.');
      return;
    }
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/gallery/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId: comment.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onCommentAdded(data);
      setReplyContent('');
      setIsReplying(false);
      toast.success('Cevabınız eklendi!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mention parsing helper (basic)
  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-emerald-400 font-bold hover:underline cursor-pointer">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className={`flex flex-col gap-4 ${level > 0 ? 'ml-6 md:ml-10 border-l border-white/5 pl-4 md:pl-6 my-2' : 'py-4'}`}>
      <div className="flex gap-4 group/item">
        <div className="relative shrink-0">
          {comment.avatar_url ? (
            <img src={comment.avatar_url} alt={comment.author_name} className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover border border-white/10" />
          ) : (
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-black text-xs">
              {comment.author_name[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-300">{comment.author_name}</span>
              {comment.author_username && (
                <span className="text-[10px] text-zinc-600 font-mono">@{comment.author_username}</span>
              )}
            </div>
            <span className="text-[10px] text-zinc-600 font-mono italic">
              {new Date(comment.created_at).toLocaleDateString('tr-TR')}
            </span>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl rounded-tl-none text-zinc-300 text-sm leading-relaxed font-medium">
            {renderContent(comment.content)}
          </div>
          
          <div className="flex items-center gap-4 mt-2 ml-2">
             <button 
               onClick={() => setIsReplying(!isReplying)}
               className="text-[10px] font-bold text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors uppercase tracking-widest"
             >
               <Reply size={12} />
               CEVAPLA
             </button>
          </div>

          <AnimatePresence>
            {isReplying && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleReply} 
                className="mt-4 flex gap-2"
              >
                <input 
                  autoFocus
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`@${comment.author_name} kullanıcısına yanıt ver...`}
                  className="flex-1 bg-white/[0.02] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
                <button 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="flex flex-col">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              allComments={allComments}
              postId={postId}
              currentUserId={currentUserId}
              onCommentAdded={onCommentAdded}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CommentThread({ comments, postId, currentUserId, onCommentAdded }: CommentThreadProps) {
  const rootComments = comments.filter(c => !c.parent_id);

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 opacity-30 border border-dashed border-white/5 rounded-3xl">
        <MessageSquare size={48} className="mx-auto mb-4" />
        <p className="text-sm">Henüz bir tartışma başlatılmamış.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rootComments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          allComments={comments}
          postId={postId}
          currentUserId={currentUserId}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  );
}
