'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/useTranslation';
import GalleryPostModal from '@/features/gallery/components/GalleryPostModal';
import GitHubExportModal from '@/features/shared/components/GitHubExportModal';
import { SKRIPT_LANGUAGE_ID, registerSkriptLanguage } from '@/lib/skript-language';
import type { editor } from 'monaco-editor';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { setupSkriptLinter } from '@/lib/skript-linter';

// Sub-components
import { EditorHeader } from './Editor/EditorHeader';
import { EditorToolbar } from './Editor/EditorToolbar';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface EditorPanelProps {
  readonly code: string;
  readonly onCodeChange: (code: string) => void;
  readonly isStreaming?: boolean;
  readonly sessionId?: string | null;
}

/**
 * EditorPanel Orchestrator
 * Manages the Monaco editor instance and associated actions.
 */
export default function EditorPanel({ code, onCodeChange, isStreaming, sessionId }: EditorPanelProps) {
  const { t, mounted } = useTranslation();
  const { userId } = useAuth();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const triggerAction = (actionId: string) => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', actionId, null);
      editorRef.current.focus();
    }
  };

  const handleTab = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'tab', null);
      editorRef.current.focus();
    }
  };

  const handleEditorMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
      editorRef.current = editorInstance;

      registerSkriptLanguage(monaco);
      monaco.editor.setTheme('skripted-dark');

      const model = editorInstance.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, SKRIPT_LANGUAGE_ID);
        setupSkriptLinter(editorInstance, monaco);
      }
    },
    [],
  );

  useEffect(() => {
    const pendingCode = localStorage.getItem('skripted_active_code');
    if (pendingCode) {
      onCodeChange(pendingCode);
      localStorage.removeItem('skripted_active_code');
      toast.success(t('editor.loaded_from_cloud'));
    }
  }, [onCodeChange, t]);

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== code) {
        editorRef.current.setValue(code);
      }
    }
  }, [code]);

  const handleCopy = useCallback(async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(t('general.copied'));
    setTimeout(() => setCopied(false), 2000);
  }, [code, t]);

  const handleCloudSave = async () => {
    if (!userId) {
      toast.error(t('dashboard.please_login'));
      return;
    }
    if (!code.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/user-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Script ${new Date().toLocaleDateString(t('general.locale'))}`,
          content: sessionId ? '' : code,
          version: '1.0.0',
          linked_session_id: sessionId || null
        })
      });

      if (!res.ok) throw new Error(t('general.error'));
      toast.success(t('editor.saved_to_cloud'));
    } catch {
      toast.error(t('general.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return <div className="flex flex-1 flex-col min-h-0 glass-panel m-2 rounded-2xl bg-[#0a0a0b]" />;

  return (
    <div className="flex flex-1 flex-col min-h-0 glass-panel overflow-hidden m-2 rounded-2xl">
      <EditorHeader 
        code={code}
        t={t}
        copied={copied}
        handleCopy={handleCopy}
        isSaving={isSaving}
        handleCloudSave={handleCloudSave}
        setIsGitHubOpen={setIsGitHubOpen}
        setIsGalleryOpen={setIsGalleryOpen}
      />
      
      <div className="relative flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden [overflow-anchor:none] bg-[#0a0a0a] relative">
          <Editor
            height="100%"
            defaultLanguage={SKRIPT_LANGUAGE_ID}
            value={code}
            onChange={(value) => onCodeChange(value ?? '')}
            onMount={handleEditorMount}
            theme="skripted-dark"
            options={{
              fontSize: 14,
              fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
              fontLigatures: true,
              lineHeight: 22.4,
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 4,
              insertSpaces: false,
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              padding: { top: 20, bottom: 60 },
              roundedSelection: true,
              readOnly: false,
              automaticLayout: true,
              contextmenu: false,
            }}
          />
          
          <EditorToolbar 
            triggerAction={triggerAction} 
            handleTab={handleTab} 
          />
        </div>
      </div>

      <GalleryPostModal
        code={code}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSuccess={(id) => {
          window.open(`/gallery/${id}`, '_blank');
        }}
      />

      <GitHubExportModal
        code={code}
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />
    </div>
  );
}

