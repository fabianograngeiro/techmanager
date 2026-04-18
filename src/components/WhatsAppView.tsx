import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  User, 
  Clock, 
  List, 
  Square, 
  CreditCard, 
  RefreshCw,
  Search,
  MoreVertical,
  Paperclip,
  Check,
  CheckCheck,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import axios from 'axios';

interface Chat {
  from: string;
  name: string;
  lastMessage: string;
  timestamp: string;
}

interface Message {
  id: string;
  from?: string;
  to?: string;
  text: string;
  timestamp: string;
  type: 'sent' | 'received';
}

export function WhatsAppView({ companyId }: { companyId: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`/api/whatsapp/chats?companyId=${companyId}`);
      setChats(response.data);
    } catch (err) {
      console.error('Erro ao buscar conversas', err);
    }
  };

  const fetchMessages = async (number: string) => {
    try {
      const response = await axios.get(`/api/whatsapp/messages/${number}?companyId=${companyId}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Erro ao buscar mensagens', err);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.from);
      const interval = setInterval(() => fetchMessages(selectedChat.from), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (type: 'text' | 'interactive', content: any) => {
    if (!selectedChat) return;
    setIsLoading(true);
    try {
      await axios.post('/api/whatsapp/send', {
        to: selectedChat.from,
        type,
        content,
        companyId
      });
      setInputText('');
      fetchMessages(selectedChat.from);
      toast.success('Mensagem enviada!');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const sendPixMessage = () => {
    const pixKey = "suachavepix@aqui.com";
    const pixValue = "R$ 0,00";
    const text = `Olá! Segue nossa chave PIX para pagamento:\n\n🔑 Chave: ${pixKey}\n💰 Valor: ${pixValue}\n\nApós o pagamento, por favor envie o comprovante por aqui. 😊`;
    sendMessage('text', text);
  };

  const sendButtonsMessage = () => {
    const content = {
      type: "button",
      header: { type: "text", text: "Assistência Técnica" },
      body: { text: "Como podemos ajudar você hoje?" },
      footer: { text: "Escolha uma opção abaixo" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "check_os", title: "Consultar OS" } },
          { type: "reply", reply: { id: "new_budget", title: "Novo Orçamento" } },
          { type: "reply", reply: { id: "talk_human", title: "Falar com Atendente" } }
        ]
      }
    };
    sendMessage('interactive', content);
  };

  const sendListMessage = () => {
    const content = {
      header: { text: "Nossos Serviços" },
      body: { text: "Selecione o tipo de serviço que você procura:" },
      footer: { text: "TechManager Assistência" },
      action: {
        buttons: [
          { reply: { id: "screen", title: "Troca de Tela" } },
          { reply: { id: "battery", title: "Bateria" } },
          { reply: { id: "software", title: "Software" } }
        ]
      }
    };
    sendMessage('interactive', content);
  };

  const sendCarouselMessage = () => {
    const content = {
      type: "product_list",
      header: { type: "text", text: "Nossas Ofertas" },
      body: { text: "Confira os produtos em destaque na nossa assistência técnica:" },
      footer: { text: "TechManager" },
      action: {
        catalog_id: "CATALOG_ID_MOCK",
        sections: [
          {
            title: "Destaques",
            product_items: [
              { product_retailer_id: "p1" },
              { product_retailer_id: "p2" },
              { product_retailer_id: "p3" }
            ]
          }
        ]
      }
    };
    // Alternative: Generic Interative with multiple cards (if supported by BSP or specific version)
    // For Cloud API, standard is Product List or Templates.
    sendMessage('interactive', content);
  };

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.from.includes(searchTerm)
  );

  return (
    <div className="flex h-[calc(100vh-140px)] bg-background border rounded-2xl overflow-hidden shadow-2xl">
      {/* Sidebar: Chat List */}
      <div className="w-[350px] border-r bg-secondary/5 flex flex-col">
        <div className="p-4 border-b bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-primary">Conversas</h2>
            <Button variant="ghost" size="icon" onClick={fetchChats}>
              <RefreshCw className="w-4 h-4 text-primary" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar contato..." 
              className="pl-9 bg-white border-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div 
              key={chat.from}
              className={cn(
                "p-4 border-b cursor-pointer transition-all hover:bg-white group",
                selectedChat?.from === chat.from ? "bg-white border-l-4 border-l-primary" : "opacity-80"
              )}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-black text-sm truncate">{chat.name}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(chat.timestamp), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate italic">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filteredChats.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto opacity-20 mb-4" />
              <p className="text-sm font-medium">Nenhuma conversa encontrada.</p>
              <p className="text-[10px] mt-1">Aguarde o primeiro Webhook da Meta.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5] dark:bg-secondary/5 relative">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-[#f0f2f5] dark:bg-secondary/20 flex items-center justify-between border-b shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm leading-none">{selectedChat.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">{selectedChat.from}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreVertical className="w-5 h-5" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-fixed bg-repeat"
              style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-thumbnail.jpg")', backgroundSize: '400px', opacity: 1 }}
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex w-full mb-2",
                    msg.type === 'sent' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[70%] p-3 rounded-2xl shadow-md relative group",
                    msg.type === 'sent' 
                      ? "bg-[#dcf8c6] text-slate-800 rounded-tr-none" 
                      : "bg-white text-slate-800 rounded-tl-none"
                  )}>
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-muted-foreground">
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </span>
                      {msg.type === 'sent' && (
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input & Quick Actions */}
            <div className="p-4 bg-[#f0f2f5] dark:bg-secondary/20 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Badge 
                  variant="outline" 
                  className="bg-white hover:bg-primary hover:text-white cursor-pointer transition-all gap-1 py-1"
                  onClick={sendButtonsMessage}
                >
                  <Square className="w-3 h-3" /> Menu Botões
                </Badge>
                <Badge 
                  variant="outline" 
                  className="bg-white hover:bg-primary hover:text-white cursor-pointer transition-all gap-1 py-1"
                  onClick={sendListMessage}
                >
                  <List className="w-3 h-3" /> Menu Lista
                </Badge>
                <Badge 
                  variant="outline" 
                   className="bg-white hover:bg-primary hover:text-white cursor-pointer transition-all gap-1 py-1"
                   onClick={sendPixMessage}
                >
                  <CreditCard className="w-3 h-3" /> Enviar PIX
                </Badge>
                <Badge 
                  variant="outline" 
                   className="bg-white hover:bg-primary hover:text-white cursor-pointer transition-all gap-1 py-1"
                   onClick={sendCarouselMessage}
                >
                  <Layout className="w-3 h-3" /> Carrossel
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="w-5 h-5" /></Button>
                <Input 
                  placeholder="Mensagem..." 
                  className="flex-1 bg-white border-none shadow-sm h-12 text-sm rounded-xl"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage('text', inputText)}
                />
                <Button 
                  className="h-12 w-12 rounded-xl shadow-lg ring-2 ring-primary/20" 
                  disabled={!inputText.trim() || isLoading}
                  onClick={() => sendMessage('text', inputText)}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-pulse">
              <MessageSquare className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-primary mb-2">Central WhatsApp</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Selecione uma conversa ao lado para gerenciar seus atendimentos via API oficial.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <Card className="bg-white border-none shadow-sm p-4">
                <div className="p-2 rounded-lg bg-emerald-100 w-fit mb-4">
                  <CheckCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-bold text-sm">Status da API</h4>
                <p className="text-[10px] text-muted-foreground mt-1">Conexão ativa com Meta Business</p>
              </Card>
              <Card className="bg-white border-none shadow-sm p-4">
                <div className="p-2 rounded-lg bg-blue-100 w-fit mb-4">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-sm">Webhooks</h4>
                <p className="text-[10px] text-muted-foreground mt-1">Aguardando eventos do sistema</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
