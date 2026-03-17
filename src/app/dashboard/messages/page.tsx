"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Sparkles, 
  Search, 
  Circle,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { aiMessagingAssistant } from '@/ai/flows/ai-messaging-assistant';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

export default function MessagesPage() {
  const db = useFirestore();
  const [inputText, setInputText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
  }, [db]);

  const { data: messages } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !db) return;
    
    const text = inputText;
    setInputText("");

    addDoc(collection(db, 'messages'), {
      sender: 'provider',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    });
  };

  const generateAiReply = async () => {
    if (!messages?.length) return;
    setIsAiLoading(true);
    try {
      const lastMsg = messages[messages.length - 1];
      const history = messages.map(m => ({
        sender: m.sender as 'client' | 'admin' | 'provider',
        text: m.text
      }));

      const result = await aiMessagingAssistant({
        currentMessage: lastMsg.text,
        conversationHistory: history
      });

      if (result.suggestedReply) {
        setInputText(result.suggestedReply);
        toast({
          title: "AI Suggestion Generated",
          description: "Click send or edit the draft as needed.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Failed",
        description: "Could not generate a suggestion at this time.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary font-headline">Messages</h1>
        <Badge variant="outline" className="text-primary border-primary">
          <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2" />
          Active Chat
        </Badge>
      </div>

      <div className="flex-1 grid md:grid-cols-3 gap-4 min-h-0 overflow-hidden">
        {/* Contacts List */}
        <Card className="md:col-span-1 border-none shadow-md flex flex-col min-h-0">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10 bg-muted/30 border-none h-10" placeholder="Search conversations..." />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {[
                { id: 1, name: "Sarah Jenkins", role: "Client", lastMsg: "See you tomorrow!", time: "10:30 AM", online: true },
                { id: 2, name: "Admin (Mike)", role: "Company", lastMsg: "Payment processed.", time: "Yesterday", online: true },
              ].map((convo) => (
                <div key={convo.id} className="p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors relative">
                  <Avatar className="w-12 h-12 border">
                    <AvatarImage src={`https://picsum.photos/seed/${convo.id}/100/100`} />
                    <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-sm truncate text-primary">{convo.name}</h4>
                      <span className="text-[10px] text-muted-foreground">{convo.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{convo.lastMsg}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Active Chat Thread */}
        <Card className="md:col-span-2 border-none shadow-lg flex flex-col min-h-0 relative">
          <div className="p-4 border-b flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border">
                <AvatarImage src={`https://picsum.photos/seed/1/100/100`} />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-primary">Sarah Jenkins</h4>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="text-muted-foreground"><Phone className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-muted-foreground"><Video className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages?.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.sender === 'provider' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-4 ${
                    msg.sender === 'provider' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-muted/50 text-foreground rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'provider' ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 bg-white border-t space-y-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs text-primary border-primary/20 hover:bg-primary/5 flex gap-2"
                onClick={generateAiReply}
                disabled={isAiLoading}
              >
                <Sparkles className="w-3 h-3 text-accent" />
                {isAiLoading ? "Analyzing..." : "AI Suggested Reply"}
              </Button>
            </div>
            <div className="flex gap-2 items-end">
              <Textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..." 
                className="resize-none min-h-[44px] max-h-[120px] bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-primary h-11 w-11 p-0 rounded-full shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}