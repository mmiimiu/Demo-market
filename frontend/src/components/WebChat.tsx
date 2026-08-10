'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, MessageCircle, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotification } from '@/hooks/use-notification';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
}

interface WebChatProps {
  property?: {
    id: number;
    name: string;
  };
  agent?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
  lang: 'th' | 'en' | 'cn';
  currentUserRole?: 'renter' | 'agent' | 'owner';
  chatPartnerName?: string;
}

export function WebChat({ 
  property, agent, isOpen: externalIsOpen, onClose, lang, currentUserRole = 'renter', chatPartnerName 
}: WebChatProps) {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [isMinimized, setIsMinimized] = useState(false);

  const isAgentOrOwner = currentUserRole === 'agent' || currentUserRole === 'owner';

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Initialize default message depending on who is viewing the chat
    if (isAgentOrOwner) {
      setMessages([
        {
          id: '1',
          text: lang === 'th' ? 'สวัสดีครับ สนใจห้องพักนี้ครับ ไม่ทราบว่ายังว่างอยู่ไหมครับ?' : lang === 'cn' ? '您好！我对这个房源感兴趣，请问还有空房吗？' : 'Hello! I am interested in this property. Is it still available?',
          sender: 'user',
          timestamp: new Date()
        }
      ]);
    } else {
      setMessages([
        {
          id: '1',
          text: lang === 'th' ? 'สวัสดีครับ มีอะไรให้ช่วยไหมครับ?' : lang === 'cn' ? '您好！有什么可以帮您的吗？' : 'Hello! How can I help you?',
          sender: 'agent',
          timestamp: new Date(),
          agentName: agent?.name || 'PrimeRent Agent'
        }
      ]);
    }
  }, [isAgentOrOwner, lang, agent]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const notification = useNotification();

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getCustomerResponse = (userMessage: string, lang: 'th' | 'en' | 'cn'): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lang === 'th') {
      if (lowerMessage.includes('ว่าง') || lowerMessage.includes('ได้') || lowerMessage.includes('สะดวก')) {
        return 'ดีเลยครับ สะดวกเข้าไปดูห้องวันเสาร์นี้ตอนบ่ายสองโมงไหมครับ?';
      }
      if (lowerMessage.includes('มัดจำ') || lowerMessage.includes('ราคา') || lowerMessage.includes('เงิน')) {
        return 'มัดจำรวมจ่ายก่อนย้ายเข้าทั้งหมดเท่าไหร่ครับ? สามารถโอนเข้าบัญชีไหนได้บ้าง';
      }
      return 'ขอบคุณสำหรับข้อมูลครับ เดี๋ยวผมขอนัดดูสถานที่จริงและตรวจสอบสัญญาด้วยนะครับ';
    }
    
    if (lang === 'cn') {
      if (lowerMessage.includes('空房') || lowerMessage.includes('可以') || lowerMessage.includes('方便')) {
        return '太好了！这周周六下午两点方便来看房吗？';
      }
      if (lowerMessage.includes('押金') || lowerMessage.includes('价格') || lowerMessage.includes('付款')) {
        return '入住前总共需要支付多少押金和租金？转账到哪个账户？';
      }
      return '谢谢您的回复。我想预约实地看房并确认合同。';
    }
    
    if (lowerMessage.includes('available') || lowerMessage.includes('yes') || lowerMessage.includes('sure')) {
      return 'Great! Are you free to show me the room this Saturday at 2:00 PM?';
    }
    if (lowerMessage.includes('deposit') || lowerMessage.includes('price') || lowerMessage.includes('pay')) {
      return 'How much is the total deposit and advance payment? Which account should I transfer to?';
    }
    return 'Thanks for the info. I would like to schedule a viewing and check the contract details.';
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const myMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: isAgentOrOwner ? 'agent' : 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, myMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate partner response
    setTimeout(() => {
      const partnerMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: isAgentOrOwner ? getCustomerResponse(inputText, lang) : getAgentResponse(inputText, lang),
        sender: isAgentOrOwner ? 'user' : 'agent',
        timestamp: new Date(),
        agentName: isAgentOrOwner ? (chatPartnerName || 'Customer') : (agent?.name || 'PrimeRent Agent')
      };
      setMessages(prev => [...prev, partnerMessage]);
      setIsTyping(false);

      // Send notification for new message
      notification.chatMessage(
        isAgentOrOwner 
          ? (lang === 'th' ? `ข้อความใหม่จาก ${chatPartnerName || 'ลูกค้า'}` : `New Message from ${chatPartnerName || 'Customer'}`)
          : (lang === 'th' ? 'ข้อความใหม่จาก Agent' : lang === 'cn' ? '来自代理的新消息' : 'New Message from Agent'),
        partnerMessage.text,
        isAgentOrOwner ? 'customer-chat' : (agent?.id || 'web-chat')
      );
    }, 1500);
  };

  const getAgentResponse = (userMessage: string, lang: 'th' | 'en' | 'cn'): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lang === 'th') {
      if (lowerMessage.includes('ราคา') || lowerMessage.includes('เท่าไหร่')) {
        return 'ราคาสามารถดูได้ที่หน้ารายละเอียดทรัพย์สินครับ หากต้องการสอบถามเพิ่มเติมสามารถคุยกับเจ้าของทรัพย์สินได้โดยตรงครับ';
      }
      if (lowerMessage.includes('จอง') || lowerMessage.includes('ว่าง')) {
        return 'สามารถกดปุ่มจองเพื่อทำการจองทรัพย์สินได้เลยครับ ระบบจะติดต่อกลับภายใน 24 ชั่วโมง';
      }
      if (lowerMessage.includes('สถานที่') || lowerMessage.includes('ทำเล')) {
        return 'สามารถดูแผนที่และทำเลที่ตั้งได้ที่หน้ารายละเอียดทรัพย์สินครับ หรือติดต่อเจ้าของเพื่อขอดูสถานที่จริงได้ครับ';
      }
      return 'ขอบคุณที่ติดต่อครับ ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ หากมีข้อสงสัยเพิ่มเติมสามารถสอบถามได้เลยครับ';
    }
    
    if (lang === 'cn') {
      if (lowerMessage.includes('价格') || lowerMessage.includes('多少钱')) {
        return '价格可以在房产详情页面查看。如需更多信息，可以直接与业主联系。';
      }
      if (lowerMessage.includes('预订') || lowerMessage.includes('可用')) {
        return '您可以点击预订按钮进行预订。我们会在24小时内联系您。';
      }
      if (lowerMessage.includes('位置') || lowerMessage.includes('地点')) {
        return '您可以在房产详情页面查看地图和位置信息，或联系业主预约实地看房。';
      }
      return '感谢您的联系。我们的团队会尽快回复您。如有其他问题，请随时询问。';
    }
    
    // English
    if (lowerMessage.includes('price') || lowerMessage.includes('how much')) {
      return 'You can view the price on the property details page. For more information, you can contact the owner directly.';
    }
    if (lowerMessage.includes('book') || lowerMessage.includes('available')) {
      return 'You can click the Book button to make a reservation. We will contact you within 24 hours.';
    }
    if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
      return 'You can view the map and location on the property details page, or contact the owner to schedule a viewing.';
    }
    return 'Thank you for contacting us. Our team will get back to you as soon as possible. Feel free to ask if you have any other questions.';
  };

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onClose && !newState) {
      onClose();
    }
  };

  const t = {
    title: lang === 'th' ? 'แชทกับ Agent' : lang === 'cn' ? '与代理聊天' : 'Chat with Agent',
    placeholder: lang === 'th' ? 'พิมพ์ข้อความ...' : lang === 'cn' ? '输入消息...' : 'Type a message...',
    send: lang === 'th' ? 'ส่ง' : lang === 'cn' ? '发送' : 'Send',
    typing: lang === 'th' ? 'กำลังพิมพ์...' : lang === 'cn' ? '正在输入...' : 'Typing...',
    property: lang === 'th' ? 'ทรัพย์สิน' : lang === 'cn' ? '房产' : 'Property'
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 animate-in fade-in duration-300">
        <Button
          onClick={handleToggle}
          className="w-16 h-16 rounded-none bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 group relative"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-none">
            {messages.length}
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] sm:max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-none shadow-2xl shadow-gray-900/10 overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white/30 rounded-none">
              <AvatarFallback className="bg-white/20 text-white font-black rounded-none">
                {isAgentOrOwner ? (chatPartnerName?.charAt(0) || 'C') : (agent?.name?.charAt(0) || 'A')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-sm">{isAgentOrOwner ? (chatPartnerName || 'Customer') : (agent?.name || 'PrimeRent Agent')}</h3>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
                {lang === 'th' ? 'ออนไลน์' : lang === 'cn' ? '在线' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 rounded-none"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 rounded-none"
              onClick={handleToggle}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Property Info */}
            {property && (
              <div className="bg-primary/5 p-3 border-b border-primary/10 rounded-none">
                <p className="text-xs text-gray-600 font-bold">
                  {t.property}: {property.name}
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="h-[calc(100dvh-220px)] sm:h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => {
                const isMyMessage = (message.sender === 'user' && !isAgentOrOwner) || (message.sender === 'agent' && isAgentOrOwner);
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      isMyMessage ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="w-8 h-8 shrink-0 rounded-none">
                      <AvatarFallback className={cn(
                        isMyMessage ? "bg-primary text-white" : "bg-gray-200 text-gray-600",
                        "text-xs font-black rounded-none"
                      )}>
                        {isMyMessage ? 'ME' : (isAgentOrOwner ? (chatPartnerName?.charAt(0) || 'C') : (message.agentName?.charAt(0) || 'A'))}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "max-w-[75%] flex flex-col",
                      isMyMessage ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "rounded-none px-4 py-2 text-sm font-semibold",
                        isMyMessage
                          ? "bg-primary text-white"
                          : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                      )}>
                        {message.text}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0 rounded-none">
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs font-black rounded-none">
                      {isAgentOrOwner ? (chatPartnerName?.charAt(0) || 'C') : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 rounded-none px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t rounded-none">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.placeholder}
                  className="flex-1 rounded-none font-bold"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-primary hover:bg-primary/90 rounded-none text-white font-black"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
