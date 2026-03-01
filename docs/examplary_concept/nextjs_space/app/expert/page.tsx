'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppStore } from '@/lib/store';
import { parseText, analyzeImage, generateResponse, generateQuestion } from '@/lib/ai-engine';
import { isReadyForSolution } from '@/lib/knowledge-state';
import { generateSolution } from '@/lib/solution-generator';
import { delay, formatPrice } from '@/lib/utils';

import { 
  Header, 
  BottomNav, 
  ChatBubble, 
  ChatInput, 
  ChatQuestionCard, 
  TypingIndicator, 
  ConfirmedFacts,
  PrimaryButton 
} from '@/components/skeuo';

export default function ExpertPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    knowledgeState,
    currentQuestion,
    solution,
    status,
    isTyping,
    addUserMessage,
    addAssistantMessage,
    updateKnowledgeState,
    setCurrentQuestion,
    answerQuestion,
    setSolution,
    setIsTyping,
    resetConversation,
    initSession,
  } = useAppStore();

  useEffect(() => {
    initSession();
    
    // Check for pending query from home page
    const pendingQuery = sessionStorage.getItem('pendingQuery');
    if (pendingQuery && messages.length === 0) {
      sessionStorage.removeItem('pendingQuery');
      setTimeout(() => {
        processInput(pendingQuery);
      }, 500);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, currentQuestion]);

  const processInput = useCallback(async (text: string, imageUrl?: string) => {
    setIsTyping(true);
    addUserMessage(text, imageUrl);

    await delay(600 + Math.random() * 800);

    const { updates, inferences } = parseText(text);

    if (imageUrl) {
      const imageAnalysis = await analyzeImage(imageUrl);
      
      if (imageAnalysis.damageType) {
        inferences.damageType = {
          value: imageAnalysis.damageType.value,
          confidence: imageAnalysis.damageType.confidence,
          source: 'image' as const,
        };
      }
      if (imageAnalysis.damageDepth) {
        inferences.damageDepth = {
          value: imageAnalysis.damageDepth.value,
          confidence: imageAnalysis.damageDepth.confidence,
          source: 'image' as const,
        };
      }
      if (imageAnalysis.rustPresent) {
        if (imageAnalysis.rustPresent.confidence > 0.8) {
          updates.rustPresent = imageAnalysis.rustPresent.value;
        } else {
          inferences.rustPresent = {
            value: imageAnalysis.rustPresent.value,
            confidence: imageAnalysis.rustPresent.confidence,
            source: 'image' as const,
          };
        }
      }
      if (imageAnalysis.material) {
        inferences.material = {
          value: imageAnalysis.material.value,
          confidence: imageAnalysis.material.confidence,
          source: 'image' as const,
        };
      }
      if (imageAnalysis.sizeEstimate) {
        inferences.size = {
          value: imageAnalysis.sizeEstimate.value,
          confidence: imageAnalysis.sizeEstimate.confidence,
          source: 'image' as const,
        };
      }

      await delay(400);
      addAssistantMessage(imageAnalysis.summary);
    }

    updateKnowledgeState(updates, { ...inferences });

    await delay(500);

    const newState = useAppStore.getState().knowledgeState;
    const response = generateResponse(newState, messages.length === 0, !!imageUrl);

    if (response.message) {
      addAssistantMessage(response.message);
    }

    if (response.question) {
      setCurrentQuestion(response.question);
    } else {
      setCurrentQuestion(null);
    }

    if (response.readyForSolution || isReadyForSolution(newState)) {
      await delay(1000);
      setIsTyping(true);
      addAssistantMessage("Creating your personalized repair plan...");
      await delay(1500);
      
      const generatedSolution = generateSolution(newState);
      setSolution(generatedSolution);
      addAssistantMessage(`Your repair plan is ready! It includes ${generatedSolution.totalProducts} products for a total of ${formatPrice(generatedSolution.totalPrice)}.`);
    }

    setIsTyping(false);
  }, [messages.length, addUserMessage, addAssistantMessage, updateKnowledgeState, setCurrentQuestion, setSolution, setIsTyping]);

  const handleAnswerQuestion = useCallback(async (value: any) => {
    if (!currentQuestion) return;

    setIsTyping(true);
    answerQuestion(currentQuestion.field, value);

    await delay(500 + Math.random() * 500);

    const newState = useAppStore.getState().knowledgeState;
    
    if (isReadyForSolution(newState)) {
      addAssistantMessage("Perfect! I have enough information now.");
      await delay(800);
      addAssistantMessage("Creating your personalized repair plan...");
      await delay(1500);
      
      const generatedSolution = generateSolution(newState);
      setSolution(generatedSolution);
      addAssistantMessage(`Your repair plan is ready! It includes ${generatedSolution.totalProducts} products for a total of ${formatPrice(generatedSolution.totalPrice)}.`);
    } else {
      const nextQuestion = generateQuestion(newState);
      if (nextQuestion) {
        addAssistantMessage("Thanks! One more thing:");
        setCurrentQuestion(nextQuestion);
      }
    }

    setIsTyping(false);
  }, [currentQuestion, answerQuestion, addAssistantMessage, setCurrentQuestion, setSolution, setIsTyping]);

  const hasConversation = messages.length > 0;
  
  // Build understanding for display
  const confirmed = Object.entries(knowledgeState.confirmed)
    .filter(([_, v]) => v !== undefined)
    .map(([field, value]) => ({
      field: formatFieldName(field),
      value: formatValue(field, value),
    }));
  
  const inferred = Object.entries(knowledgeState.inferred)
    .filter(([_, v]) => v !== undefined)
    .map(([field, v]) => ({
      field: formatFieldName(field),
      value: formatValue(field, v!.value),
      confidence: v!.confidence,
    }));

  return (
    <div className="min-h-screen flex flex-col bg-skeuo-bg">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="p-2 -ml-2 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-skeuo-accent" />
            <span className="font-bold text-slate-800">Expert Guide</span>
          </div>
          {hasConversation ? (
            <button onClick={resetConversation} className="p-2 -mr-2 text-slate-500">
              <RotateCcw className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 pt-14 md:pt-20 pb-48 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Welcome message when empty */}
          {!hasConversation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-skeuo-accent to-skeuo-pink flex items-center justify-center shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Expert Paint Guidance</h1>
              <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
                Tell me about your paint project or share a photo, and I&apos;ll help you find exactly what you need.
              </p>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ChatBubble
                  role={message.role}
                  content={message.content}
                  imageUrl={message.imageUrl}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Understanding card */}
          {!isTyping && (confirmed.length > 0 || inferred.length > 0) && !solution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ml-[54px]"
            >
              <ConfirmedFacts
                confirmed={confirmed}
                inferred={inferred}
              />
            </motion.div>
          )}

          {/* Current question */}
          <AnimatePresence>
            {currentQuestion && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="ml-[54px]"
              >
                <ChatQuestionCard
                  question={currentQuestion}
                  onAnswer={handleAnswerQuestion}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Solution ready CTA */}
          <AnimatePresence>
            {solution && status === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="skeuo-card p-5 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-skeuo-accent to-skeuo-accent-dark flex items-center justify-center shadow-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{solution.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {solution.totalProducts} products • {formatPrice(solution.totalPrice)}
                    </p>
                  </div>
                </div>
                <PrimaryButton
                  onClick={() => router.push('/solution')}
                >
                  View Your Repair Plan
                </PrimaryButton>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 border-t border-slate-200/50">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSend={processInput}
            disabled={isTyping || status === 'complete'}
            placeholder={status === 'complete' ? "Your plan is ready! View it above." : undefined}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function formatFieldName(field: string): string {
  const names: Record<string, string> = {
    damageType: 'Damage',
    damageDepth: 'Depth',
    material: 'Surface',
    rustPresent: 'Rust',
    colorType: 'Color type',
    colorDescription: 'Color',
    size: 'Size',
    equipment: 'Equipment',
    location: 'Location',
  };
  return names[field] || field;
}

function formatValue(field: string, value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  const valueLabels: Record<string, Record<string, string>> = {
    damageType: { scratch: 'Scratch', rust: 'Rust damage', chip: 'Stone chip', dent: 'Dent', fade: 'Faded paint', peel: 'Peeling paint' },
    damageDepth: { surface: 'Surface only', throughClear: 'Through clear coat', toPrimer: 'To primer', toMetal: 'To bare metal' },
    material: { metal: 'Metal', plastic: 'Plastic', fiberglass: 'Fiberglass', mixed: 'Mixed' },
    colorType: { solid: 'Solid', metallic: 'Metallic', pearl: 'Pearl', tricoat: 'Tri-coat' },
    size: { tiny: 'Tiny', small: 'Small', medium: 'Medium', large: 'Large' },
    equipment: { aerosol: 'Spray cans', sprayGun: 'Spray gun', none: 'None' },
  };
  
  if (valueLabels[field] && valueLabels[field][value]) {
    return valueLabels[field][value];
  }
  
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}
