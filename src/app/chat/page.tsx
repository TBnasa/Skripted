'use client';

import { useState, useCallback, useRef } from 'react';
import ChatPanel from '@/components/ChatPanel';
import EditorPanel from '@/components/EditorPanel';
import type { ChatMessage, FeedbackPayload } from '@/types';

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [editorCode, setEditorCode] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const pineconeIdsRef = useRef<string[]>([]);
  const sessionIdRef = useRef(crypto.randomUUID());
  const lastPromptRef = useRef('');

  /**
   * Safe UUID generation with fallback for non-secure contexts.
   */
  const generateId = useCallback(() => {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).substring(2, 15);
    }
  }, []);

  /**
   * Extract code blocks (```vb ... ``` or ``` ... ```) from AI response.
   */
  const extractCode = useCallback((text: string): string => {
    const codeBlockRegex = /```(?:vb|sk|skript)?\n?([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }

    return blocks.join('\n\n');
  }, []);

  /**
   * Send a message and stream the AI response.
   */
  const handleNewMessage = useCallback(
    async (content: string) => {
      lastPromptRef.current = content;
      setShowFeedback(false);

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      // Add user message locally using functional update to ensure we have latest history
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent('');

      try {
        console.log('[Chat] Starting request to /api/chat...');
        
        // Get snapshot of current history for the API call
        // We do this by reaching into the state just before the fetch
        let currentHistory: ChatMessage[] = [];
        setMessages(prev => {
          currentHistory = prev.slice(-11); // Include the user message we just added
          return prev;
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: content,
            history: currentHistory.slice(0, -1), // Send history EXCEPT the current prompt
          }),
        });

        console.log('[Chat] Response received, status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || `Status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let fullContent = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'meta' && parsed.pineconeIds) {
                pineconeIdsRef.current = parsed.pineconeIds;
              } else if (parsed.type === 'content') {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              } else if (parsed.type === 'error') {
                console.error('[Stream] Server reported error:', parsed.error);
                // Display the error directly in the UI so the user knows what's happening
                fullContent = `⚠️ AI Service Error: ${parsed.error}`;
                setStreamingContent(fullContent);
              }
            } catch (e) {
              // Ignore malformed JSON lines
            }
          }
        }

        if (!fullContent && !isStreaming) {
          fullContent = '⚠️ The AI returned an empty response. This might be due to a temporary service interruption or rate limit. Please try again.';
          setStreamingContent(fullContent);
        }

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: fullContent,
          timestamp: Date.now(),
          codeBlock: extractCode(fullContent),
          pineconeIds: [...pineconeIdsRef.current],
        };

        // Update messages with the final assistant response
        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage];
          
          // Async save session to Supabase
          fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sessionIdRef.current,
              title: newMessages[0]?.content.substring(0, 40) || 'New Chat',
              messages: newMessages,
            }),
          }).catch(err => console.error('[Session] Sync failed:', err));

          return newMessages;
        });

        // Extract code and set in editor
        const code = extractCode(fullContent);
        if (code) {
          setEditorCode(code);
          setShowFeedback(true);
        }
      } catch (error) {
        console.error('[Chat] Error:', error);
        const errorMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: `⚠️ An error occurred while generating your script. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
      }
    },
    [generateId, extractCode],
  );

  /**
   * Handle user feedback (success/error).
   */
  const handleFeedback = useCallback(
    async (success: boolean, errorLog?: string) => {
      const payload: FeedbackPayload = {
        sessionId: sessionIdRef.current,
        prompt: lastPromptRef.current,
        generatedCode: editorCode,
        success,
        errorLog,
        pineconeIds: [...pineconeIdsRef.current],
      };

      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('[Feedback] Error:', error);
      }

      setShowFeedback(false);
    },
    [editorCode],
  );

  const handleCodeExtracted = useCallback((code: string) => {
    setEditorCode(code);
  }, []);

  return (
    <div className="flex h-screen flex-col pt-16">
      {/* Split view container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Chat */}
        <div className="flex w-full flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] md:w-1/2 lg:w-[45%]">
          <ChatPanel
            messages={messages}
            onNewMessage={handleNewMessage}
            onCodeExtracted={handleCodeExtracted}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            onFeedback={handleFeedback}
            showFeedback={showFeedback}
          />
        </div>

        {/* Right panel: Monaco Editor */}
        <div className="hidden flex-1 flex-col bg-[var(--color-bg-primary)] md:flex">
          <EditorPanel
            code={editorCode}
            onCodeChange={setEditorCode}
          />
        </div>
      </div>

      {/* Mobile tab for editor (visible only on small screens) */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2 md:hidden">
        {editorCode.trim() ? (
          <details className="group">
            <summary className="cursor-pointer rounded-lg bg-[var(--color-bg-tertiary)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]">
              📝 View Generated Code ({editorCode.split('\n').length} lines)
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[var(--color-bg-primary)] p-4 font-[var(--font-mono)] text-xs text-[var(--color-text-primary)]">
              <code>{editorCode}</code>
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}
