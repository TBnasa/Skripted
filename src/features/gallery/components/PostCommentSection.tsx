'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import CommentThread from './CommentThread';

interface PostCommentSectionProps {
  comments: any[];
  postId: string;
  userId?: string | null;
  t: (key: string, options?: Record<string, unknown>) => string;
  newComment: string;
  setNewComment: (val: string) => void;
  handleSubmitComment: (e: React.FormEvent) => void;
  isSubmittingComment: boolean;
  isLoadingComments: boolean;
  onCommentAdded: (newC: any) => void;
}

export function PostCommentSection({
  comments,
  postId,
  userId,
  t,
  newComment,
  setNewComment,
  handleSubmitComment,
  isSubmittingComment,
  isLoadingComments,
  onCommentAdded,
}: PostCommentSectionProps) {
  return (
    <div className="bg-[#0c0c0e] border border-white/[0.06] rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
      <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
        <MessageSquare size={24} className="text-emerald-400" />
        <span className="uppercase">{t('gallery.comments')}</span> <span className="text-zinc-600 font-mono text-lg">({comments.length})</span>
      </h3>

      {/* Comment Form */}
      {userId ? (
        <form onSubmit={handleSubmitComment} className="mb-10 group">
          <div className="relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('gallery.write_comment')}
              className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 min-h-[120px] text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all resize-none font-medium"
            />
            <button 
              disabled={isSubmittingComment}
              className="absolute bottom-4 right-4 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all group/btn active:scale-95"
            >
              {isSubmittingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-2xl text-center mb-10">
          <p className="text-zinc-500 text-sm">{t('gallery.post_content.must_login_to_comment_prefix', { defaultValue: 'You must' })} <Link href="/login" className="text-emerald-400 font-bold hover:underline">{t('general.sign_in')}</Link> {t('gallery.post_content.must_login_to_comment_suffix', { defaultValue: 'to post a comment.' })}</p>
        </div>
      )}

      {/* Comments List */}
      <div className="max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
        {isLoadingComments ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-emerald-500" />
          </div>
        ) : (
          <CommentThread 
            comments={comments} 
            postId={postId} 
            currentUserId={userId || undefined}
            onCommentAdded={onCommentAdded}
          />
        )}
      </div>
    </div>
  );
}
