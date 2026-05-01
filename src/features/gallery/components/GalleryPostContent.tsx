'use client';

import { useTranslation } from '@/lib/useTranslation';
import React, { useState, useEffect } from 'react';
import { GalleryClientService } from '@/services/client/gallery.client';
import { GalleryPostSchema, GalleryCommentSchema } from '@/types/schemas';
import { useAuth } from '@clerk/nextjs';
import { registerSkriptLanguage } from '@/lib/skript-language';
import { setupSkriptLinter } from '@/lib/skript-linter';
import { toast } from 'sonner';

// Sub-components
import { PostDetailHeader } from './PostDetailHeader';
import { PostImageGallery } from './PostImageGallery';
import { PostCodeViewer } from './PostCodeViewer';
import { PostCommentSection } from './PostCommentSection';

interface GalleryPost {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  code_snippet: string;
  image_urls: string[];
  likes_count: number;
  downloads_count: number;
  created_at: string;
  category: string;
  tags: string[];
}

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

const CATEGORY_IDS = ['Economy', 'Admin', 'Minigame', 'Chat', 'Security', 'Other'];
const CATEGORY_ICONS: Record<string, string> = {
  Economy: '💰',
  Admin: '🛡️',
  Minigame: '🎮',
  Chat: '💬',
  Security: '🔐',
  Other: '📁',
};

/**
 * GalleryPostContent Orchestrator
 * Manages state and logic for individual gallery posts.
 */
export default function GalleryPostContent({ post }: { post: GalleryPost }) {
  const translation = useTranslation();
  const t = translation?.t || ((key: string) => key);
  const lang = translation?.lang || 'en';
  const mounted = translation?.mounted || false;
  
  const { userId, getToken } = useAuth();
  
  // UI State
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Translation states
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);

  // States for dynamic updates
  const [postData, setPostData] = useState(post);
  const [likes, setLikes] = useState(post.likes_count);
  const [downloads, setDownloads] = useState(post.downloads_count);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(true);

  // Editing states
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedDesc, setEditedDesc] = useState(post.description);
  const [editedCategory, setEditedCategory] = useState(post.category);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);

  // Comments states
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      if (userId) {
        try {
          const token = await getToken({ template: 'supabase' });
          const liked = await GalleryClientService.checkLikeStatus(post.id, userId, token || '');
          if (liked) setIsLiked(true);
        } catch (err) {
          console.error('Error checking like status:', err);
        } finally {
          setIsLoadingLike(false);
        }
      } else {
        setIsLoadingLike(false);
      }

      try {
        const res = await fetch(`/api/gallery/${post.id}/comments`);
        const data = await res.json();
        if (res.ok) setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    initPage();
  }, [post.id, userId, getToken]);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.code_snippet);
    setCopied(true);
    toast.success(t('general.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/gallery/${post.id}/download`, { method: 'POST' });
      if (res.ok) setDownloads(prev => prev + 1);
    } catch (error) {
      console.error('Failed to increment download count:', error);
    }

    const blob = new Blob([post.code_snippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${postData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.sk`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('gallery.download_started'));
  };

  const handleLike = async () => {
    if (!userId) {
      toast.error(t('gallery.must_login_to_like'));
      return;
    }
    if (isLoadingLike) return;

    const previousIsLiked = isLiked;
    const previousLikes = likes;
    setIsLiked(!previousIsLiked);
    setLikes(prev => previousIsLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/gallery/${post.id}/like`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
    } catch (error: any) {
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
      toast.error(error.message);
    }
  };

  const handleTranslateDesc = async () => {
    if (translatedDesc) {
      setTranslatedDesc(null);
      return;
    }
    
    setIsTranslating(true);
    try {
      const translation = await GalleryClientService.translateDescription(postData.description, lang);
      if (translation) setTranslatedDesc(translation);
    } catch {
      toast.error(t('gallery.translation_failed'));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error(t('gallery.post_content.must_login_to_comment'));
      return;
    }

    const validation = GalleryCommentSchema.safeParse({ content: newComment });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsSubmittingComment(true);
    try {
      const data = await GalleryClientService.submitComment(post.id, validation.data);
      setComments(prev => [...prev, data]);
      setNewComment('');
      toast.success(t('gallery.comment_posted'));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdatePost = async () => {
    const validation = GalleryPostSchema.partial().safeParse({
      title: editedTitle,
      description: editedDesc || null,
      category: editedCategory,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsUpdatingPost(true);
    try {
      const updated = await GalleryClientService.updatePost(post.id, validation.data);
      setPostData(updated);
      setIsEditingPost(false);
      toast.success(t('gallery.post_updated'));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm(t('gallery.confirm_delete_post'))) return;
    try {
      const res = await fetch(`/api/gallery/${post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success(t('gallery.post_deleted'));
      setTimeout(() => window.location.href = '/gallery', 1500);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditorWillMount = (monaco: any) => {
    registerSkriptLanguage(monaco);
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    monaco.editor.setTheme('skripted-dark');
    setupSkriptLinter(editor, monaco);
  };

  if (!mounted) return <div className="flex min-h-screen flex-col bg-[#0a0a0b]" />;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-white">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 animate-fade-in">
        
        <PostDetailHeader 
          post={postData}
          t={t}
          isEditingPost={isEditingPost}
          editedTitle={editedTitle}
          setEditedTitle={setEditedTitle}
          editedCategory={editedCategory}
          setEditedCategory={setEditedCategory}
          isUpdatingPost={isUpdatingPost}
          handleUpdatePost={handleUpdatePost}
          setIsEditingPost={setIsEditingPost}
          handleDeletePost={handleDeletePost}
          userId={userId}
          isLiked={isLiked}
          likes={likes}
          handleLike={handleLike}
          handleShare={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success(t('gallery.share_link_copied'));
          }}
          handleDownload={handleDownload}
          categoryIds={CATEGORY_IDS}
          categoryIcons={CATEGORY_ICONS}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <PostImageGallery 
            post={postData}
            t={t}
            isEditingPost={isEditingPost}
            editedDesc={editedDesc}
            setEditedDesc={setEditedDesc}
            translatedDesc={translatedDesc}
            handleTranslateDesc={handleTranslateDesc}
            isTranslating={isTranslating}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
          />

          <div className="lg:col-span-7 space-y-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <PostCodeViewer 
              code={postData.code_snippet}
              t={t}
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
              handleCopy={handleCopy}
              copied={copied}
              handleEditorWillMount={handleEditorWillMount}
              handleEditorMount={handleEditorMount}
            />

            <PostCommentSection 
              comments={comments}
              postId={post.id}
              userId={userId}
              t={t}
              newComment={newComment}
              setNewComment={setNewComment}
              handleSubmitComment={handleSubmitComment}
              isSubmittingComment={isSubmittingComment}
              isLoadingComments={isLoadingComments}
              onCommentAdded={(newC) => setComments(prev => [...prev, newC])}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
