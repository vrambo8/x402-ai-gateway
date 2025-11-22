import { useState, useRef, useEffect } from 'react';
import { sendPrompt } from '../services/apiClient';
import { MODEL_PRICING } from '../utils/models';
import { formatCost } from '../utils/tokenCounter';
import { BASESCAN_URL } from '../services/paymentService';
import CostEstimator from './CostEstimator';

export default function ChatInterface({ selectedModel, wallet }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setError('');
    setLoading(true);

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      // Send to API
      console.log('=== ChatInterface: Sending prompt ===');
      console.log('Model:', selectedModel);
      console.log('Max tokens:', maxTokens);
      console.log('Wallet connected:', !!wallet);
      console.log('Wallet address:', wallet?.address);

      const result = await sendPrompt(selectedModel, input, maxTokens, wallet);

      console.log('=== ChatInterface: Result received ===');
      console.log('Success:', result.success);
      console.log('Full result:', result);

      if (result.success) {
        // Extract assistant response - handle both Chat Completions and Responses API formats
        let assistantContent = 'No response content';

        if (result.data.choices?.[0]?.message?.content) {
          // Chat Completions format
          assistantContent = result.data.choices[0].message.content;
        } else if (result.data.output?.[0]?.content) {
          // Responses API format - concatenate all text content
          const contentArray = result.data.output[0].content;
          assistantContent = contentArray
            .filter(item => item.type === 'output_text')
            .map(item => item.text)
            .join('');
        } else if (result.data.text) {
          // Fallback to text field
          assistantContent = result.data.text;
        }

        console.log('Assistant content extracted:', {
          contentLength: assistantContent.length,
          hasUsage: !!result.data.usage,
          hasPaymentStatus: !!result.paymentStatus,
        });

        const assistantMessage = {
          role: 'assistant',
          content: assistantContent,
          usage: result.data.usage,
          paymentStatus: result.paymentStatus,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        console.error('=== ChatInterface: Request failed ===');
        console.error('Error:', result.error);
        setError(result.error || 'Failed to get response');
        // Remove the user message if request failed
        setMessages((prev) => prev.slice(0, -1));
        setInput(input); // Restore input
      }
    } catch (err) {
      console.error('=== ChatInterface: Unexpected error ===');
      console.error('Error:', err);
      setError('Unexpected error: ' + err.message);
      setMessages((prev) => prev.slice(0, -1));
      setInput(input);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg text-slate-300 font-medium">Start a conversation</p>
              <p className="text-sm text-slate-500 mt-2">Enter a prompt below and press Send</p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 border border-white/10 text-slate-100 shadow-lg shadow-black/10'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

              {message.usage && (
                <div className={`text-xs mt-3 pt-3 border-t ${
                  message.role === 'user' ? 'border-blue-400/30' : 'border-white/10'
                }`}>
                  <div className="flex items-center gap-2 opacity-70">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Tokens: {message.usage.total_tokens}</span>
                    {message.usage.prompt_tokens && (
                      <span className="text-xs opacity-60">
                        (in: {message.usage.prompt_tokens}, out: {message.usage.completion_tokens})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {message.paymentStatus && (
                <div className={`text-xs mt-3 pt-3 border-t ${
                  message.role === 'user' ? 'border-blue-400/30' : 'border-white/10'
                }`}>
                  {message.paymentStatus.transaction && (
                    <div className="mb-2 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <a
                        href={`${BASESCAN_URL}/tx/${message.paymentStatus.transaction}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline decoration-dotted transition-colors"
                      >
                        {message.paymentStatus.transaction.slice(0, 10)}...{message.paymentStatus.transaction.slice(-8)}
                      </a>
                    </div>
                  )}
                  {message.paymentStatus.refund_amount > 0 && (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Refunded: {formatCost(parseFloat(message.paymentStatus.refund_amount))}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-3 shadow-lg">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="relative backdrop-blur-xl bg-white/5 border-t border-white/10 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm backdrop-blur-md flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {input && (
          <div className="mb-4">
            <CostEstimator
              prompt={input}
              maxTokens={maxTokens}
              modelPricing={MODEL_PRICING[selectedModel]}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3 items-center">
            <label htmlFor="max-tokens" className="text-sm text-slate-400 font-medium">
              Max tokens:
            </label>
            <input
              id="max-tokens"
              type="number"
              min="100"
              max="4000"
              step="100"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-28 px-3 py-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Enter your prompt... (Shift+Enter for new line)"
              rows="3"
              className="flex-1 px-4 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder-slate-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !wallet}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:shadow-none disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sending
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
