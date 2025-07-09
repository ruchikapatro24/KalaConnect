'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send, User, X, Mic, MicOff, Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { conversationalProductSearch } from '@/ai/flows/conversational-product-search';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  audioDataUri?: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null;
  }

  const handleSend = async (query?: string) => {
    const textToSend = query || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await conversationalProductSearch({ query: textToSend });
      let audioDataUri: string | undefined;

      if (result.response) {
        try {
           const audioResult = await textToSpeech(result.response);
           audioDataUri = audioResult.audioDataUri;
        } catch (audioError) {
          console.error("TTS generation failed:", audioError);
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        products: result.products as Product[],
        audioDataUri,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      if(audioDataUri) {
          const audio = new Audio(audioDataUri);
          audio.play();
      }

    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I couldn't understand that. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          <span className="sr-only">Toggle Chat</span>
        </Button>
      </div>
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50">
          <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
            <CardHeader className="flex-row items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="font-headline">AI Assistant</CardTitle>
                <p className="text-xs text-muted-foreground">How can I help you today?</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-3 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <div className="p-2 bg-primary rounded-full text-primary-foreground">
                        <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2">
                        <p className="text-sm">{message.content}</p>
                        {message.role === 'assistant' && message.audioDataUri && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => new Audio(message.audioDataUri as string).play()}
                                aria-label="Play audio response"
                            >
                                <Volume2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {message.products && message.products.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {message.products.map(p => <ProductCard key={p.id} product={p} />)}
                      </div>
                    )}
                  </div>
                   {message.role === 'user' && (
                    <div className="p-2 bg-muted rounded-full text-muted-foreground">
                        <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-full text-primary-foreground">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
                )}
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center gap-2">
                <Input
                  placeholder={isListening ? 'Listening...' : "Ask for gifts..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading || isListening}
                />
                <Button onClick={() => handleSend()} disabled={isLoading || !input}>
                  <Send className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={toggleListening} disabled={isLoading || !recognitionRef.current}>
                    {isListening ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
                    <span className="sr-only">Use microphone</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
