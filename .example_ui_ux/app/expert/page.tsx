'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppStore } from '@/lib/store';
import { parseText, analyzeImage, generateResponse, generateQuestion } from '@/lib/ai-engine';
import { isReadyForSolution } from '@/lib/knowledge-state';
import { generateSolution } from '@/lib/solution-generator';
import { delay } from '@/lib/utils';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { ChatInput } from '@/components/chat-input';
import { MessageBubble } from '@/components/message-bubble';
import { TypingIndicator } from '@/components/typing-indicator';
import { UnderstandingCard } from '@/components/understanding-card';
import { QuestionCard } from '@/components/question-card';
import { Button } from '@/components/ui/button';

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
  }, [initSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, currentQuestion]);

  const processInput = useCallback(async (text: string, imageUrl?: string) => {
    setIsTyping(true);
    addUserMessage(text, imageUrl);

    // Simulate AI processing time
    await delay(600 + Math.random() * 800);

    // Parse text input
    const { updates, inferences } = parseText(text);

    // Analyze image if provided
    let imageInferences = {};
    if (imageUrl) {
      const imageAnalysis = await analyzeImage(imageUrl);
      
      // Convert image analysis to knowledge state updates
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

      // Add image analysis summary to message
      await delay(400);
      addAssistantMessage(imageAnalysis.summary);
    }

    // Update knowledge state
    updateKnowledgeState(updates, { ...inferences, ...imageInferences });

    // Small delay before generating response
    await delay(500);

    // Generate response based on new state
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

    // Check if ready for solution
    if (response.readyForSolution || isReadyForSolution(newState)) {
      await delay(1000);
      setIsTyping(true);
      addAssistantMessage("Creating your personalized repair plan...");
      await delay(1500);
      
      const generatedSolution = generateSolution(newState);
      setSolution(generatedSolution);
      addAssistantMessage(`Your repair plan is ready! It includes ${generatedSolution.totalProducts} products for a total of €${generatedSolution.totalPrice.toFixed(2)}.`);
    }

    setIsTyping(false);
  }, [messages.length, addUserMessage, addAssistantMessage, updateKnowledgeState, setCurrentQuestion, setSolution, setIsTyping]);

  const handleAnswerQuestion = useCallback(async (value: any) => {
    if (!currentQuestion) return;

    setIsTyping(true);
    answerQuestion(currentQuestion.field, value);

    await delay(500 + Math.random() * 500);

    // Check updated state
    const newState = useAppStore.getState().knowledgeState;
    
    if (isReadyForSolution(newState)) {
      addAssistantMessage("I have enough information now!");
      await delay(800);
      addAssistantMessage("Creating your personalized repair plan...");
      await delay(1500);
      
      const generatedSolution = generateSolution(newState);
      setSolution(generatedSolution);
      addAssistantMessage(`Your repair plan is ready! It includes ${generatedSolution.totalProducts} products for a total of €${generatedSolution.totalPrice.toFixed(2)}.`);
    } else {
      // Ask next question
      const nextQuestion = generateQuestion(newState);
      if (nextQuestion) {
        addAssistantMessage("Thanks! One more thing:");
        setCurrentQuestion(nextQuestion);
      }
    }

    setIsTyping(false);
  }, [currentQuestion, answerQuestion, addAssistantMessage, setCurrentQuestion, setSolution, setIsTyping]);

  const hasConversation = messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <span className="font-medium">Expert Guide</span>
          </div>
          {hasConversation ? (
            <button onClick={resetConversation} className="p-2 -mr-2 text-muted-foreground">
              <RotateCcw className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 pt-14 md:pt-20 pb-40 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Welcome message when empty */}
          {!hasConversation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <h1 className="text-xl font-semibold">Expert Paint Guidance</h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Tell me about your paint project or share a photo, and I&apos;ll help you find exactly what you need.
              </p>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Current question */}
          <AnimatePresence>
            {currentQuestion && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pl-11"
              >
                <QuestionCard
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
                className="glass-card p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {solution.totalProducts} products • €{solution.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="teal"
                  className="w-full"
                  onClick={() => router.push('/solution')}
                >
                  View Your Repair Plan
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40">
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
