import React, { useState, useEffect, useMemo } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  startOfDay,
  differenceInDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ShoppingCart,
  Receipt,
  Tag,
  LayoutDashboard, 
  Users, 
  Wrench, 
  Package, 
  DollarSign, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronRight,
  Plus,
  Filter,
  MoreVertical,
  Printer,
  FileText,
  Clock,
  AlertCircle,
  Check,
  CheckCircle2,
  ListTodo,
  Smartphone,
  XCircle,
  Printer as PrinterIcon,
  Monitor,
  Scan,
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Share2,
  Scissors,
  History,
  MessageSquare,
  CreditCard,
  Lock,
  Layout,
  Eye,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  Building2,
  Globe,
  Activity,
  CreditCard as PlansIcon,
  BarChart3,
  Image as ImageIcon,
  Upload,
  Tags,
  Database,
  Keyboard,
  Wallet,
  Banknote,
  QrCode,
  Minus,
  FileDown,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Truck,
  UploadCloud,
  Home,
  Coffee,
  Gift,
  Briefcase,
  Lightbulb,
  Utensils,
  Car,
  Sun,
  Moon,
  ListChecks,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from 'sonner';
import axios from 'axios';
import { WhatsAppView } from './components/WhatsAppView';
import { PrintDesigner } from './components/PrintDesigner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { MOCK_OS, STATUS_COLUMNS } from './constants';
import { ServiceOrder, OSStatus, OSItem, PrintTemplate, TemplateElement, User, Company, Supplier, EquipmentType } from './types';

// --- Components ---

// --- Helper Functions ---
const fuzzyMatch = (text: string, query: string) => {
  if (!query) return true;
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const nText = normalize(text);
  const nQuery = normalize(query);
  return nText.includes(nQuery);
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-2.5 text-sm font-medium transition-all rounded-lg group relative overflow-hidden",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
  >
    <Icon className={cn("w-5 h-5 transition-transform duration-300", active ? "text-primary-foreground" : "group-hover:scale-110 group-hover:text-primary")} />
    <span>{label}</span>
    {active && (
      <motion.div 
        layoutId="active-nav"
        className="absolute right-0 w-1 h-6 bg-primary-foreground rounded-l-full"
      />
    )}
    {!active && <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
  </button>
);

const StatCard = ({ title, value, icon: Icon, trend, color, description }: any) => (
  <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm group hover:ring-1 ring-primary/20 transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight">{value}</h3>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trend > 0 ? "text-emerald-500" : "text-rose-500")}>
              {trend > 0 ? "+" : ""}{trend}% em relação ao mês anterior
            </p>
          )}
          {description && (
            <p className="text-[10px] text-muted-foreground mt-2 leading-tight opacity-70">
              {description}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", color, "group-hover:scale-110 transition-transform")}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- Auth & Login ---

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin SaaS',
    email: 'saas@admin.com',
    role: 'ADMIN-SAAS',
    companyId: 'saas-system',
  },
  {
    id: '2',
    name: 'Admin Empresa',
    email: 'admin@empresa.com',
    role: 'ADMIN-USER',
    companyId: 'company-1',
  },
  {
    id: '3',
    name: 'Técnico João',
    email: 'joao@tecnico.com',
    role: 'USUARIO',
    companyId: 'company-1',
  }
];

function LoginView({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de login
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      if (user) {
        onLogin(user);
        toast.success(`Bem-vindo, ${user.name}!`);
      } else {
        toast.error('Credenciais inválidas. Tente saas@admin.com, admin@empresa.com ou joao@tecnico.com');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">TechManager</h1>
          <p className="text-muted-foreground mt-2">Gestão inteligente para sua assistência técnica</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Acessar Sistema</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nome@exemplo.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Button variant="link" className="px-0 font-normal text-xs">Esqueceu a senha?</Button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                {isLoading ? "Autenticando..." : "Entrar"}
              </Button>
            </form>

            <div className="relative mt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Contas de Teste</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start gap-2 h-auto py-2"
                onClick={() => { setEmail('saas@admin.com'); setPassword('123456'); }}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase leading-none mb-1">Admin SaaS</p>
                  <p className="text-[10px] text-muted-foreground leading-none">saas@admin.com</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start gap-2 h-auto py-2"
                onClick={() => { setEmail('admin@empresa.com'); setPassword('123456'); }}
              >
                <Lock className="w-4 h-4 text-amber-500" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase leading-none mb-1">Admin Empresa</p>
                  <p className="text-[10px] text-muted-foreground leading-none">admin@empresa.com</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start gap-2 h-auto py-2"
                onClick={() => { setEmail('joao@tecnico.com'); setPassword('123456'); }}
              >
                <UserIcon className="w-4 h-4 text-blue-500" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase leading-none mb-1">Usuário / Técnico</p>
                  <p className="text-[10px] text-muted-foreground leading-none">joao@tecnico.com</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; 2024 TechManager SaaS. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCompany, setActiveCompany] = useState<Company>({
    id: '1',
    name: 'Tech Assistência',
    cnpj: '12.345.678/0001-90',
    email: 'contato@techassist.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    fiscalEnabled: true,
  });
  const [viewingOSId, setViewingOSId] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<ServiceOrder[]>(MOCK_OS);
  const [customSubStatuses, setCustomSubStatuses] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('techmanager_substatuses');
    return saved ? JSON.parse(saved) : {
      'Aguardando peça': ['Peça encomendada', 'Aguardando peça pelo cliente', 'Peça em trânsito', 'Peça indisponível'],
      'Em reparo': ['Iniciado', 'Aguardando senha do sistema', 'Aguardando autorização extra', 'Reparo suspenso'],
      'Testes finais': ['Stress test', 'Verificando conexões', 'Limpeza interna', 'Aguardando validação do técnico']
    };
  });

  useEffect(() => {
    localStorage.setItem('techmanager_substatuses', JSON.stringify(customSubStatuses));
  }, [customSubStatuses]);

  const [tasks, setTasks] = useState<any[]>(() => {
    const saved = localStorage.getItem('techmanager_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Comprar telas para iPhone 13', note: 'Distribuidor X tem o melhor preço hoje', time: format(addDays(new Date(), 1), "yyyy-MM-dd'T'10:00"), completed: false, priority: 'Alta' },
      { id: '2', title: 'Ligar para cliente Sr. João', note: 'Confirmar orçamento da impressora', time: format(new Date(), "yyyy-MM-dd'T'15:00"), completed: false, priority: 'Média' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Reminder Logic
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.completed && task.time) {
          const taskTime = new Date(task.time);
          // Check if it's due now (within the last minute and hasn't notified yet)
          const diff = now.getTime() - taskTime.getTime();
          if (diff >= 0 && diff < 60000) { // If it's been due for less than a minute
            toast.info(`Lembrete: ${task.title}`, {
              description: task.note,
              duration: 10000,
              action: {
                label: "Concluir",
                onClick: () => {
                  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
                }
              }
            });
            // Sound alert
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log("Audio play blocked", e));
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [company, setCompany] = useState<Company>({
    id: '1',
    name: 'TechManager Assistência',
    razaoSocial: 'TechManager Serviços LTDA',
    cnpj: '12.345.678/0001-99',
    ie: '123.456.789.000',
    email: 'contato@techmanager.com',
    phone: '(11) 3333-4444',
    address: 'Rua das Tecnologias, 123 - Centro, São Paulo - SP',
    logo: undefined,
    labelPrinterName: '',
    a4PrinterName: '',
    osCopiesPerPage: 1
  });
  const [osSortOrder, setOsSortOrder] = useState<'number' | 'date' | 'priority'>(() => {
    const saved = localStorage.getItem('techmanager_os_sort');
    return (saved as any) || 'number';
  });

  useEffect(() => {
    localStorage.setItem('techmanager_os_sort', osSortOrder);
  }, [osSortOrder]);

  const [allProducts, setAllProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('techmanager_products');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Tela iPhone 13 Original', sku: 'TEL-IP13-ORG', price: 850.00, stock: 5, min: 2, cat: 'Peças' },
      { id: '2', name: 'Bateria Samsung S22', sku: 'BAT-S22-PREM', price: 120.00, stock: 12, min: 5, cat: 'Peças' },
      { id: '3', name: 'Cabo HDMI 2.0 2m', sku: 'CAB-HDMI-2M', price: 45.00, stock: 2, min: 10, cat: 'Acessórios' },
      { id: '4', name: 'Conector de Carga Moto G60', sku: 'CON-G60', price: 25.00, stock: 0, min: 5, cat: 'Peças' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_products', JSON.stringify(allProducts));
  }, [allProducts]);

  const [salesHistory, setSalesHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('techmanager_sales');
    return saved ? JSON.parse(saved) : [
      { id: '1', customer: 'João Silva', items: [{ id: 'p1', name: 'Tela iPhone 13 Original', price: 850, quantity: 1, sku: 'TEL-IP13-ORG' }], total: 850, date: new Date().toISOString(), type: 'Venda', status: 'Finalizada' },
      { id: '2', customer: 'Maria Oliveira', items: [{ id: 'p2', name: 'Bateria Samsung S22', price: 120, quantity: 1, sku: 'BAT-S22-PREM' }], total: 120, date: addDays(new Date(), -1).toISOString(), type: 'Venda', status: 'Finalizada' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  const [financeTransactions, setFinanceTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('techmanager_transactions');
    return saved ? JSON.parse(saved) : [
      { id: '1', desc: 'Venda OS-2024-003', val: 250.00, type: 'IN', date: '13/04/2026', status: 'Pago', category: 'Serviços' },
      { id: '2', desc: 'Compra de Telas - Fornecedor X', val: -1200.00, type: 'OUT', date: '12/04/2026', status: 'Pendente', category: 'Estoque' },
      { id: '3', desc: 'Aluguel Sala Comercial', val: -2500.00, type: 'OUT', date: '10/04/2026', status: 'Pago', category: 'Infraestrutura' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_transactions', JSON.stringify(financeTransactions));
  }, [financeTransactions]);

  const [teamUsers, setTeamUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('techmanager_team');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Admin Principal', email: 'admin@techmanager.com', role: 'ADMIN-USER', companyId: '1', privilege: 'Completo', allowedTabs: ['dashboard', 'os', 'kanban', 'tarefas', 'clientes', 'estoque', 'financeiro', 'calendario', 'vendas', 'config'] },
      { id: '2', name: 'Técnico João', email: 'joao@techmanager.com', role: 'USUARIO', companyId: '1', privilege: 'Profissional', allowedTabs: ['dashboard', 'os', 'tarefas'] },
      { id: '3', name: 'Atendente Maria', email: 'maria@techmanager.com', role: 'USUARIO', companyId: '1', privilege: 'Profissional', allowedTabs: ['dashboard', 'os', 'clientes', 'vendas'] },
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_team', JSON.stringify(teamUsers));
  }, [teamUsers]);

  const [rmaHistory, setRmaHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('techmanager_rma');
    return saved ? JSON.parse(saved) : [
      { id: '1', product: 'Tela iPhone 13', sku: 'TEL-IP13-ORG', reason: 'Defeito na imagem', supplier: 'ABC Peças', status: 'Enviado', date: '10/04/2026' },
      { id: '2', product: 'Bateria S22', sku: 'BAT-S22-PREM', reason: 'Não carrega', supplier: 'Z Peças', status: 'Concluído', date: '05/04/2026' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_rma', JSON.stringify(rmaHistory));
  }, [rmaHistory]);

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>(() => {
    const saved = localStorage.getItem('techmanager_equipments');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Smartphone', defaultDiagnosisDays: 1, defaultCompletionDays: 3, companyId: '1' },
      { id: '2', name: 'Notebook', defaultDiagnosisDays: 2, defaultCompletionDays: 5, companyId: '1' },
      { id: '3', name: 'Impressora', defaultDiagnosisDays: 3, defaultCompletionDays: 7, companyId: '1' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_equipments', JSON.stringify(equipmentTypes));
  }, [equipmentTypes]);

  const [globalCustomers, setGlobalCustomers] = useState<any[]>(() => {
    const saved = localStorage.getItem('techmanager_customers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'João Silva', doc: '123.456.789-00', email: 'joao@email.com', phone: '(11) 99999-8888', street: 'Rua A', number: '100', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zip: '01000-000' },
      { id: '2', name: 'Maria Oliveira', doc: '987.654.321-11', email: 'maria@email.com', phone: '(11) 97777-6666', street: 'Av B', number: '200', neighborhood: 'Jardins', city: 'Rio de Janeiro', state: 'RJ', zip: '20000-000' },
      { id: '3', name: 'Tech Solutions LTDA', doc: '12.345.678/0001-99', email: 'contato@tech.com', phone: '(11) 3333-4444', street: 'Rua C', number: '300', neighborhood: 'Industrial', city: 'Curitiba', state: 'PR', zip: '80000-000' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_customers', JSON.stringify(globalCustomers));
  }, [globalCustomers]);

  const [printTemplates, setPrintTemplates] = useState<PrintTemplate[]>(() => {
    const saved = localStorage.getItem('techmanager_print_templates');
    if (saved) return JSON.parse(saved);
    
    // Default Templates
    const defaultLabel: PrintTemplate = {
      id: 'default-label-os',
      name: 'Etiqueta de Entrada (O.S)',
      type: 'Etiqueta',
      width: 40,
      height: 25,
      companyId: '1',
      elements: [
        { id: '1', type: 'text', content: 'ENTRADA DE EQUIPAMENTO', x: 2, y: 2, fontSize: 8, fontWeight: 'bold' },
        { id: '2', type: 'variable', content: '{{os_number}}', x: 2, y: 6, fontSize: 14, fontWeight: 'bold' },
        { id: '3', type: 'variable', content: '{{customer_name}}', x: 2, y: 12, fontSize: 8 },
        { id: '4', type: 'variable', content: '{{equipment}}', x: 2, y: 16, fontSize: 8 },
        { id: '5', type: 'variable', content: '{{os_date}}', x: 2, y: 20, fontSize: 6 },
        { id: '6', type: 'qr', content: '{{os_number}}', x: 30, y: 12, width: 8, height: 8 }
      ]
    };

    const defaultReceipt: PrintTemplate = {
      id: 'default-receipt-nonfiscal',
      name: 'Comprovante Não Fiscal',
      type: 'Cupom',
      width: 80,
      height: 150,
      companyId: '1',
      elements: [
        { id: '1', type: 'text', content: 'TECHMANAGER ASSISTENCIA', x: 20, y: 5, fontSize: 12, fontWeight: 'bold' },
        { id: '2', type: 'line', content: '', x: 5, y: 12, width: 70, height: 1 },
        { id: '3', type: 'text', content: 'ORCAMENTO DE SERVICO', x: 22, y: 15, fontSize: 10, fontWeight: 'bold' },
        { id: '4', type: 'text', content: 'Nº O.S:', x: 5, y: 25, fontSize: 10 },
        { id: '5', type: 'variable', content: '{{os_number}}', x: 25, y: 25, fontSize: 10, fontWeight: 'bold' },
        { id: '6', type: 'text', content: 'CLIENTE:', x: 5, y: 32, fontSize: 10 },
        { id: '7', type: 'variable', content: '{{customer_name}}', x: 25, y: 32, fontSize: 10 },
        { id: '8', type: 'text', content: 'EQUIP:', x: 5, y: 39, fontSize: 10 },
        { id: '9', type: 'variable', content: '{{equipment}}', x: 25, y: 39, fontSize: 10 },
        { id: '10', type: 'line', content: '', x: 5, y: 46, width: 70, height: 1 },
        { id: '11', type: 'text', content: 'PROBLEMA RELATADO', x: 5, y: 52, fontSize: 10, fontWeight: 'bold' },
        { id: '12', type: 'variable', content: '{{problem}}', x: 5, y: 60, fontSize: 9 },
        { id: '13', type: 'text', content: 'ASSINATURA CLIENTE', x: 20, y: 120, fontSize: 10 },
        { id: '14', type: 'line', content: '', x: 5, y: 115, width: 70, height: 1 }
      ]
    };

    return [defaultLabel, defaultReceipt];
  });

  useEffect(() => {
    localStorage.setItem('techmanager_print_templates', JSON.stringify(printTemplates));
  }, [printTemplates]);

  // Reset viewingOSId when activeTab changes to fix persistence bug
  useEffect(() => {
    setViewingOSId(null);
  }, [activeTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('techmanager_darkmode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('techmanager_darkmode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN-SAAS') {
        setActiveTab('saas-dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  const menuItems = user?.role === 'ADMIN-SAAS' ? [
    { id: 'saas-dashboard', label: 'Painel SaaS', icon: LayoutDashboard },
    { id: 'empresas', label: 'Empresas', icon: Building2 },
    { id: 'planos', label: 'Planos', icon: PlansIcon },
    { id: 'logs', label: 'Logs do Sistema', icon: Activity },
    { id: 'config', label: 'Configurações', icon: Settings },
  ] : (user?.role === 'ADMIN-USER' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'os', label: 'Ordens de Serviço', icon: Wrench },
    { id: 'kanban', label: 'Quadro Kanban', icon: Filter },
    { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'vendas', label: 'PDV / Vendas', icon: ShoppingCart },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'equipe', label: 'Equipe / Usuários', icon: Users },
    { id: 'impressao', label: 'Personalizar Impressão', icon: PrinterIcon },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'config', label: 'Configurações', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'Meu Painel', icon: LayoutDashboard },
    { id: 'os', label: 'Minhas OS', icon: Wrench },
    { id: 'kanban', label: 'Quadro Kanban', icon: Filter },
    { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'config', label: 'Configurações', icon: Settings },
  ].filter(item => (user?.allowedTabs || []).includes(item.id)));

  const renderContent = () => {
    if (viewingOSId) {
      return (
        <ServiceOrderDetailsView 
          osId={viewingOSId} 
          onBack={() => setViewingOSId(null)} 
          allOrders={allOrders}
          setAllOrders={setAllOrders}
          customSubStatuses={customSubStatuses}
          allProducts={allProducts}
          teamUsers={teamUsers}
          user={user}
        />
      );
    }

    switch (activeTab) {
      case 'saas-dashboard':
      case 'empresas':
      case 'planos':
      case 'logs':
        return <SaaSAdminView activeTab={activeTab} activeCompany={activeCompany} setActiveCompany={setActiveCompany} allOrders={allOrders} />;
      case 'fornecedores':
        return <SupplierView />;
      case 'dashboard':
        return user?.role === 'USUARIO' 
          ? <TechnicianDashboardView onViewOS={(id) => setViewingOSId(id)} allOrders={allOrders} user={user} equipmentTypes={equipmentTypes} setAllOrders={setAllOrders} />
          : <DashboardView onViewOS={(id) => setViewingOSId(id)} onNavigate={setActiveTab} allOrders={allOrders} />;
      case 'os':
        return (
          <OSListView 
            onViewOS={(id) => setViewingOSId(id)} 
            allOrders={allOrders} 
            sortOrder={osSortOrder} 
            teamUsers={teamUsers} 
            user={user} 
            equipmentTypes={equipmentTypes} 
            setAllOrders={setAllOrders} 
            printTemplates={printTemplates} 
            company={company}
          />
        );
      case 'kanban':
        return <KanbanView onViewOS={(id) => setViewingOSId(id)} allOrders={allOrders} setAllOrders={setAllOrders} />;
      case 'tarefas':
        return <TasksView tasks={tasks} setTasks={setTasks} />;
      case 'clientes':
        return <CustomerView customers={globalCustomers} setCustomers={setGlobalCustomers} />;
      case 'estoque':
        return (
          <StockView 
            fiscalEnabled={!!activeCompany.fiscalEnabled} 
            allProducts={allProducts}
            setAllProducts={setAllProducts}
            rmaHistory={rmaHistory}
            setRmaHistory={setRmaHistory}
          />
        );
      case 'financeiro':
        return (
          <FinanceView 
            transactions={financeTransactions}
            setTransactions={setFinanceTransactions}
          />
        );
      case 'calendario':
        return <CalendarView allOrders={allOrders} tasks={tasks} onViewOS={(id) => setViewingOSId(id)} onNavigate={setActiveTab} />;
      case 'vendas':
        return (
          <POSView 
            fiscalEnabled={!!activeCompany.fiscalEnabled} 
            salesHistory={salesHistory}
            setSalesHistory={setSalesHistory}
            allProducts={allProducts}
            setAllProducts={setAllProducts}
            setFinanceTransactions={setFinanceTransactions}
            rmaHistory={rmaHistory}
            setRmaHistory={setRmaHistory}
            globalCustomers={globalCustomers}
            setGlobalCustomers={setGlobalCustomers}
          />
        );
      case 'equipe':
        return <UserManagementView users={teamUsers} setUsers={setTeamUsers} />;
      case 'impressao':
        return <PrintCustomizationView templates={printTemplates} setTemplates={setPrintTemplates} />;
      case 'whatsapp':
        return <WhatsAppView companyId={user?.companyId || 'default'} />;
      case 'config':
        return (
          <SettingsView 
            user={user} 
            companyLogo={companyLogo} 
            setCompanyLogo={setCompanyLogo} 
            customSubStatuses={customSubStatuses}
            setCustomSubStatuses={setCustomSubStatuses}
            osSortOrder={osSortOrder}
            setOsSortOrder={setOsSortOrder}
            equipmentTypes={equipmentTypes}
            setEquipmentTypes={setEquipmentTypes}
            teamUsers={teamUsers}
            setTeamUsers={setTeamUsers}
            company={company}
            setCompany={setCompany}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="p-4 mb-4 rounded-full bg-secondary">
              <Settings className="w-12 h-12 text-muted-foreground animate-spin-slow" />
            </div>
            <h2 className="text-xl font-semibold">Módulo em Desenvolvimento</h2>
            <p className="text-muted-foreground">Esta funcionalidade estará disponível em breve.</p>
          </div>
        );
    }
  };

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  return (
    <div className={cn("flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 transition-colors duration-300", darkMode && "dark")}>
      <Toaster position="top-right" richColors />
      
      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 bg-white border-r shadow-sm lg:relative",
          isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0 lg:w-20",
          !isSidebarOpen && !isMobile && "lg:w-20"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-bottom">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && <span className="text-lg font-bold tracking-tight">TechManager</span>}
          </div>
          {isMobile && isSidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={isSidebarOpen ? item.label : ""}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setIsSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        <div className="p-4 border-t">
          <SidebarItem
            icon={LogOut}
            label={isSidebarOpen ? "Sair" : ""}
            onClick={() => {
              setUser(null);
              toast.info('Você saiu do sistema.');
            }}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex"
            >
              <Menu className="w-5 h-5" />
            </Button>
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="h-8 max-w-[120px] object-contain" referrerPolicy="no-referrer" />
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'ADMIN-SAAS' && (
              <Badge variant="outline" className="hidden md:flex gap-1 border-indigo-200 bg-indigo-50 text-indigo-700">
                <ShieldCheck className="w-3 h-3" /> Modo Super Admin
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDarkMode(!darkMode)}
              className="mr-2"
              title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </Button>
            <div className="flex items-center gap-3 pl-3 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Views ---

function ServiceOrderDetailsView({ 
  osId, 
  onBack, 
  allOrders, 
  setAllOrders,
  customSubStatuses,
  allProducts,
  teamUsers,
  user
}: { 
  osId: string, 
  onBack: () => void, 
  allOrders: ServiceOrder[], 
  setAllOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>,
  customSubStatuses: Record<string, string[]>,
  allProducts: any[],
  teamUsers: User[],
  user: User | null
}) {
  const os = allOrders.find(o => o.id === osId);
  const [status, setStatus] = useState<OSStatus | string>(os?.status || '');
  const [subStatus, setSubStatus] = useState(os?.subStatus || '');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const isOwner = user?.role === 'ADMIN-USER' || user?.role === 'ADMIN-SAAS';

  // Reset sub-status if main status changes and it's not applicable
  useEffect(() => {
    if (!['Aguardando peça', 'Em reparo', 'Testes finais'].includes(status as string)) {
      setSubStatus('');
    }
  }, [status]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [arrivalDate, setArrivalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [completionDate, setCompletionDate] = useState(os?.completionDeadline ? format(new Date(os.completionDeadline), 'yyyy-MM-dd') : format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const products = allProducts;

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = () => {
    toast.info('Gerando PDF da Ordem de Serviço...');
    setTimeout(() => {
      toast.success('PDF gerado com sucesso!');
    }, 1500);
  };

  const handleEdit = () => {
    setIsUpdating(true);
    setActiveTab('geral');
    toast.info('Modo de edição ativado.');
  };

  const handleFinalize = () => {
    setAllOrders(prev => prev.map(o => o.id === osId ? { ...o, status: 'Entregue' as OSStatus, updatedAt: new Date().toISOString() } : o));
    setStatus('Entregue');
    toast.success('Ordem de Serviço marcada como Entregue! Realize a conferência para finalizar.');
  };

  const handleConfer = () => {
    setAllOrders(prev => prev.map(o => o.id === osId ? { ...o, status: 'Finalizada' as OSStatus, updatedAt: new Date().toISOString() } : o));
    setStatus('Finalizada');
    toast.success('Conferência realizada! OS Finalizada com sucesso.');
  };

  if (!os) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Ordem de Serviço não encontrada</h2>
        <Button onClick={onBack} variant="outline" className="mt-4">Voltar</Button>
      </div>
    );
  }

  const timeline = [
    { date: '14/04/2024 11:05', user: 'Sistema', action: 'Status alterado para Aguardando Aprovação', detail: 'Orçamento enviado para o cliente via WhatsApp.' },
    { date: '14/04/2024 11:00', user: 'Técnico João', action: 'Diagnóstico Concluído', detail: 'Identificada necessidade de substituição da tela frontal.' },
    { date: '14/04/2024 10:15', user: 'Técnico João', action: 'Início de Análise', detail: 'Equipamento desmontado para verificação interna.' },
    { date: '14/04/2024 09:30', user: 'Sistema', action: 'OS Aberta', detail: 'Entrada do equipamento na assistência.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{os.number}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                {os.status}
              </Badge>
              {os.subStatus && (
                <Badge variant="outline" className="border-primary/20 text-primary/70">
                  {os.subStatus}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Criada em {format(new Date(os.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {os.status === 'Entregue' && isOwner && (
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse" onClick={handleConfer}>
              <ShieldCheck className="w-4 h-4" /> Conferir e Finalizar
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsUpdating(true)}>
            <Settings className="w-4 h-4" /> Atualizar OS
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePDF}>
            <FileText className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleEdit}>
            <Edit className="w-4 h-4" /> Editar
          </Button>
           <Button size="sm" className="gap-2 bg-black hover:bg-black/90 text-white" onClick={handleFinalize} disabled={os.status === 'Entregue' || os.status === 'Finalizada'}>
            <CheckCircle2 className="w-4 h-4" /> {os.status === 'Entregue' || os.status === 'Finalizada' ? 'Finalizada' : 'Finalizar'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {isUpdating && (
            <Card className="border-primary shadow-md ring-1 ring-primary/20">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Ambiente de Atualização</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsUpdating(false)}>Fechar</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="status" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                    <TabsTrigger value="status">Status</TabsTrigger>
                    <TabsTrigger value="servicos">Serviços</TabsTrigger>
                    <TabsTrigger value="produtos">Produtos</TabsTrigger>
                    <TabsTrigger value="prazos">Prazos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="geral" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Equipamento</Label>
                        <Input 
                          defaultValue={os.equipment}
                          onChange={(e) => {
                            setAllOrders(prev => prev.map(o => o.id === osId ? { ...o, equipment: e.target.value } : o));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Marca</Label>
                        <Input 
                          defaultValue={os.brand}
                          onChange={(e) => {
                            setAllOrders(prev => prev.map(o => o.id === osId ? { ...o, brand: e.target.value } : o));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Input 
                          defaultValue={os.model}
                          onChange={(e) => {
                            setAllOrders(prev => prev.map(o => o.id === osId ? { ...o, model: e.target.value } : o));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nº de Série</Label>
                        <Input 
                          defaultValue={os.serialNumber}
                          onChange={(e) => {
                            setAllOrders(prev => prev.map(o => o.id === osId ? { ...o, serialNumber: e.target.value } : o));
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Defeito Relatado</Label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue={os.defect}
                        onChange={(e) => {
                          setAllOrders(prev => prev.map(o => o.id === osId ? { ...o, defect: e.target.value } : o));
                        }}
                      />
                    </div>
                    <Button onClick={() => {
                      toast.success('Informações do equipamento atualizadas!');
                      setIsUpdating(false);
                    }}>Finalizar Edição</Button>
                  </TabsContent>

                  <TabsContent value="status" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Alterar Status Atual</Label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o novo status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_COLUMNS.map(statusOption => (
                                <SelectItem key={statusOption} value={statusOption}>{statusOption}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {customSubStatuses[status as string] ? (
                          <div className="space-y-2">
                            <Label>Detalhamento (Sub-status)</Label>
                            <Select value={subStatus} onValueChange={setSubStatus}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o detalhamento..." />
                              </SelectTrigger>
                              <SelectContent>
                                {customSubStatuses[status as string].map(s => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-2 opacity-30 select-none">
                            <Label>Detalhamento (N/A)</Label>
                            <div className="h-10 border rounded-md bg-muted/20 px-3 flex items-center text-xs italic">
                              Sem sub-status
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Previsão de Conclusão</Label>
                          <Input 
                            type="date" 
                            className="h-10" 
                            value={completionDate}
                            onChange={(e) => setCompletionDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {status === 'Aguardando peça' && (
                        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
                          <Label className="text-xs font-bold uppercase text-amber-800 mb-2 block">Previsão Chegada Peça</Label>
                          <div className="flex gap-2">
                             <Button variant="outline" size="sm" className="text-[10px] h-9" onClick={() => setArrivalDate(format(new Date(), 'yyyy-MM-dd'))}>Hoje</Button>
                             <Input 
                               type="date" 
                               className="h-9 text-sm" 
                               value={arrivalDate}
                               onChange={(e) => setArrivalDate(e.target.value)}
                             />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Observação da Mudança</Label>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Descreva o que foi feito ou o motivo da mudança..."
                        />
                      </div>
                      <Button onClick={() => {
                        setAllOrders(prev => prev.map(o => o.id === osId ? {
                          ...o,
                          status: status as OSStatus,
                          subStatus: subStatus,
                          updatedAt: new Date().toISOString()
                        } : o));
                        toast.success('Status e Sub-status atualizados com sucesso!');
                        setIsUpdating(false);
                      }}>Salvar Alteração</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="servicos" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input placeholder="Nome do serviço..." className="flex-1" />
                        <Input type="number" placeholder="Valor R$" className="w-32" />
                        <Button size="icon"><Plus className="w-4 h-4" /></Button>
                      </div>
                      <div className="rounded-md border">
                        <div className="p-4 text-sm text-center text-muted-foreground italic">
                          Nenhum serviço adicional incluído ainda.
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="produtos" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Buscar no estoque..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Qtd" className="w-32" />
                        <Button size="icon" onClick={() => {
                          if (selectedProductId) {
                            toast.success('Produto adicionado à OS');
                            setSelectedProductId('');
                          } else {
                            toast.error('Selecione um produto');
                          }
                        }}><Plus className="w-4 h-4" /></Button>
                      </div>
                      <div className="rounded-md border">
                        <div className="p-4 text-sm text-center text-muted-foreground italic">
                          Nenhum produto/peça incluído ainda.
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="prazos" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Nova Previsão de Conclusão</Label>
                        <Input type="date" />
                      </div>
                      {status === 'Aguardando Peça' && (
                        <div className="space-y-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <Label className="text-amber-800">Previsão de Chegada da Peça</Label>
                          <Input type="date" className="border-amber-300" />
                          <p className="text-[10px] text-amber-700 mt-1 italic">* Campo obrigatório para status "Aguardando Peça"</p>
                        </div>
                      )}
                      <Button onClick={() => {
                        toast.success('Prazos atualizados com sucesso!');
                        setIsUpdating(false);
                      }}>Confirmar Prazos</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Informações do Equipamento */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">Informações do Equipamento</CardTitle>
              <Smartphone className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Equipamento</p>
                  <p className="text-sm font-medium">{os.equipment}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Marca / Modelo</p>
                  <p className="text-sm font-medium">{os.brand} {os.model}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Nº de Série</p>
                  <p className="text-sm font-medium font-mono">{os.serialNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Técnico Atribuído</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-primary">{os.technicianName || 'Não atribuído'}</p>
                    <Dialog>
                      <DialogTrigger render={
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="w-3 h-3" /></Button>
                      } />
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Alterar Técnico</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Label className="mb-2 block">Selecione o técnico responsável</Label>
                          <Select 
                            defaultValue={os.technicianId} 
                            onValueChange={(val) => {
                              const tech = teamUsers.find(u => u.id === val);
                              setAllOrders(prev => prev.map(o => o.id === osId ? {
                                ...o,
                                technicianId: val,
                                technicianName: tech?.name || ''
                              } : o));
                              toast.success(`Técnico ${tech?.name || 'Não identificado'} atribuído com sucesso!`);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Escolher técnico..." />
                            </SelectTrigger>
                            <SelectContent>
                              {teamUsers.filter(u => u.role === 'USUARIO').map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Defeito Relatado</p>
                  <div className="p-3 bg-secondary/30 rounded-lg text-sm italic">
                    "{os.defect}"
                  </div>
                </div>
                {os.diagnosis && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Diagnóstico Técnico</p>
                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-sm">
                      {os.diagnosis}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Histórico / Timeline */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">Histórico da OS</CardTitle>
              <History className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 pt-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative flex items-start pl-10">
                    <div className="absolute left-2 mt-1 h-6 w-6 rounded-full border-4 border-white bg-primary shadow-sm flex items-center justify-center z-10">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold">{item.action}</p>
                        <time className="text-[10px] text-muted-foreground font-medium">{item.date}</time>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">Por: <span className="font-medium text-foreground">{item.user}</span></p>
                      <p className="text-xs bg-secondary/20 p-2 rounded border border-secondary/50">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Cliente */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {os.customerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold">{os.customerName}</p>
                  <p className="text-xs text-muted-foreground">ID: {os.customerId}</p>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <MessageSquare className="w-3 h-3 text-muted-foreground" />
                  <span>(11) 99999-8888</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <span>123.456.789-00</span>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs h-8 gap-2">
                <MessageSquare className="w-3 h-3" /> WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Mão de Obra</span>
                <span className="font-bold">R$ {os.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Peças</span>
                <span className="font-bold">R$ 0,00</span>
              </div>
              <div className="pt-2 border-t border-primary-foreground/20 flex items-center justify-between">
                <span className="text-base font-bold">Total</span>
                <span className="text-xl font-black">R$ {os.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <Button variant="secondary" className="w-full gap-2 font-bold" onClick={() => setShowPaymentDialog(true)} disabled={os.status === 'Entregue' || os.status === 'Finalizada'}>
                <CreditCard className="w-4 h-4" /> Registrar Pagamento
              </Button>
            </CardContent>
          </Card>

          {/* Dialog de Pagamento */}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Pagamento</DialogTitle>
                <DialogDescription>Selecione a forma de pagamento para liquidar esta OS.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-4">
                {['PIX', 'Cartão Crédito', 'Cartão Débito', 'Dinheiro', 'Boleto', 'Transferência'].map(method => (
                  <Button 
                    key={method} 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1 font-bold"
                    onClick={() => {
                      setAllOrders(prev => prev.map(o => o.id === osId ? { 
                        ...o, 
                        status: 'Entregue' as OSStatus, 
                        paymentStatus: 'Pago',
                        updatedAt: new Date().toISOString() 
                      } : o));
                      setStatus('Entregue');
                      setShowPaymentDialog(false);
                      toast.success(`Pagamento via ${method} confirmado! OS marcada como Entregue.`);
                    }}
                  >
                    <Wallet className="w-5 h-5 text-primary" />
                    <span className="text-xs uppercase">{method}</span>
                  </Button>
                ))}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Ações Rápidas */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Ações Administrativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-xs h-8 gap-2 text-muted-foreground hover:text-foreground">
                <Share2 className="w-3 h-3" /> Compartilhar Link
              </Button>
              <Button variant="ghost" className="w-full justify-start text-xs h-8 gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-3 h-3" /> Excluir Ordem de Serviço
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TechnicianDashboardView({ 
  onViewOS, 
  allOrders,
  user,
  equipmentTypes,
  setAllOrders
}: { 
  onViewOS: (id: string) => void, 
  allOrders: ServiceOrder[],
  user: User | null,
  equipmentTypes: EquipmentType[],
  setAllOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>
}) {
  const isTech = user?.role === 'USUARIO';
  const allowedEquipmentNames = equipmentTypes
    .filter(eq => (user?.allowedEquipmentIds || []).includes(eq.id))
    .map(eq => eq.name.toLowerCase());

  const myOrders = allOrders.filter(o => o.technicianId === user?.id);
  
  // OS disponíveis: Não atribuídas mas do tipo que o técnico atende
  const availableOrders = allOrders.filter(o => 
    !o.technicianId && 
    allowedEquipmentNames.includes(o.equipment.toLowerCase()) &&
    o.status === 'Aberta'
  );

  const openOrders = myOrders.filter(o => o.status !== 'Finalizada' && o.status !== 'Cancelada' && o.status !== 'Entregue');
  const monthDone = myOrders.filter(o => o.status === 'Finalizada' || o.status === 'Entregue').length;
  const waitingParts = myOrders.filter(o => o.status === 'Aguardando peça').length;
  const urgentOrders = myOrders.filter(o => o.priority === 'Urgente').length;

  const productivityData = [
    { name: 'Equipe', abertas: allOrders.filter(o => o.status === 'Aberta').length, concluídas: allOrders.filter(o => o.status === 'Finalizada').length },
    { name: 'Minhas', abertas: openOrders.length, concluídas: monthDone },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Meu Painel Técnico</h1>
        <p className="text-muted-foreground">Olá! Aqui estão suas ordens de serviço e metas para hoje.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Minhas OS Abertas" value={openOrders.length.toString()} icon={Wrench} color="bg-blue-500" />
        <StatCard title="Concluídas (Mês)" value={monthDone.toString()} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard title="Aguardando Peça" value={waitingParts.toString()} icon={Clock} color="bg-amber-500" />
        <StatCard title="Urgências" value={urgentOrders.toString()} icon={AlertCircle} color="bg-rose-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Minha Produtividade</CardTitle>
            <CardDescription>OS concluídas vs. novas OS atribuídas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="concluídas" fill="#10b981" radius={[4, 4, 0, 0]} name="Concluídas" />
                <Bar dataKey="abertas" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Novas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Status das Minhas OS</CardTitle>
            <CardDescription>Distribuição por fase de reparo</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Em Reparo', value: 5, color: '#3b82f6' },
                    { name: 'Testes', value: 3, color: '#8b5cf6' },
                    { name: 'Aguardando', value: 4, color: '#f59e0b' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Minhas Próximas Tarefas</CardTitle>
            <CardDescription>Ordens de serviço prioritárias atribuídas a você</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders.length > 0 ? myOrders.slice(0, 5).map((os) => (
                <div 
                  key={os.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer"
                  onClick={() => onViewOS(os.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{os.number} - {os.equipment}</p>
                      <p className="text-xs text-muted-foreground">{os.customerName} • {os.defect}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{os.status}</Badge>
                    <Badge variant={os.priority === 'Urgente' ? 'destructive' : 'outline'}>
                      {os.priority}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-muted-foreground italic">
                  Nenhuma OS atribuída a você no momento.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>O.S. Disponíveis para Assumir</CardTitle>
            <CardDescription>Ordens do seu setor de especialidade sem técnico atribuído</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableOrders.length > 0 ? availableOrders.slice(0, 5).map((os) => (
                <div 
                  key={os.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{os.number} - {os.equipment}</p>
                      <p className="text-xs text-muted-foreground">{os.customerName} • {os.brand}</p>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2" onClick={(e) => {
                    e.stopPropagation();
                    setAllOrders(prev => prev.map(o => o.id === os.id ? { ...o, technicianId: user?.id || '', technicianName: user?.name || '' } : o));
                    toast.success('Você assumiu esta Ordem de Serviço!');
                  }}>
                    Assumir OS
                  </Button>
                </div>
              )) : (
                <div className="py-8 text-center text-muted-foreground italic">
                  Nenhuma OS disponível para sua especialidade.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SaaSAdminView({ 
  activeTab, 
  activeCompany, 
  setActiveCompany,
  allOrders
}: { 
  activeTab: string, 
  activeCompany: Company, 
  setActiveCompany: (c: Company) => void,
  allOrders: ServiceOrder[]
}) {
  const [companies, setCompanies] = useState([
    { id: '1', name: 'Tech Assistência', cnpj: '12.345.678/0001-90', plan: 'Premium', status: 'Ativo', users: 5, os: 156, fiscal: true },
    { id: '2', name: 'Smart Fix', cnpj: '98.765.432/0001-21', plan: 'Basic', status: 'Ativo', users: 2, os: 45, fiscal: false },
    { id: '3', name: 'Mega Reparos', cnpj: '11.222.333/0001-44', plan: 'Enterprise', status: 'Inativo', users: 12, os: 890, fiscal: true },
  ]);

  const toggleFiscal = (id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, fiscal: !c.fiscal } : c));
    if (activeCompany && id === activeCompany.id) {
      setActiveCompany({ ...activeCompany, fiscalEnabled: !activeCompany.fiscalEnabled });
    }
    toast.success('Módulo fiscal atualizado!');
  };

  const renderSaaSContent = () => {
    switch (activeTab) {
      case 'planos':
        return (
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Basic', price: 'R$ 99/mês', features: ['Até 2 usuários', '100 OS/mês', 'Suporte via Chat'] },
              { name: 'Premium', price: 'R$ 199/mês', features: ['Até 10 usuários', 'OS Ilimitadas', 'Gestão Financeira', 'Suporte Prioritário'] },
              { name: 'Enterprise', price: 'Sob consulta', features: ['Usuários Ilimitados', 'API de Integração', 'Backup Diário', 'Gerente de Conta'] },
            ].map((plan, i) => (
              <Card key={i} className={cn("border-none shadow-sm", plan.name === 'Premium' ? "ring-2 ring-primary" : "")}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-primary">{plan.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.name === 'Premium' ? 'default' : 'outline'}>Editar Plano</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 'logs':
        return (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
              <CardDescription>Monitoramento de atividades globais.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '10:45', user: 'Admin SaaS', action: 'Nova empresa cadastrada: Tech Assistência', type: 'info' },
                  { time: '09:30', user: 'Sistema', action: 'Backup diário concluído com sucesso', type: 'success' },
                  { time: '08:15', user: 'Admin Empresa', action: 'Alteração de plano: Smart Fix (Basic -> Premium)', type: 'warning' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 text-xs">
                    <span className="font-mono text-muted-foreground">{log.time}</span>
                    <Badge variant="outline" className="text-[10px]">{log.user}</Badge>
                    <span className="flex-1">{log.action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Empresas Cadastradas</CardTitle>
                <CardDescription>Lista de todos os tenants ativos no sistema.</CardDescription>
              </div>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Empresa</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Empresa</th>
                      <th className="px-6 py-4 font-semibold">CNPJ</th>
                      <th className="px-6 py-4 font-semibold">Plano</th>
                      <th className="px-6 py-4 font-semibold text-center">Usuários</th>
                      <th className="px-6 py-4 font-semibold text-center">Total OS</th>
                      <th className="px-6 py-4 font-semibold">Mód. Fiscal</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-medium">{company.name}</td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{company.cnpj}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-medium">{company.plan}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center">{company.users}</td>
                        <td className="px-6 py-4 text-center font-semibold">{company.os}</td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn("gap-2 font-bold", company.fiscal ? "text-emerald-600" : "text-muted-foreground")}
                            onClick={() => toggleFiscal(company.id)}
                          >
                            {company.fiscal ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                            {company.fiscal ? 'ATIVO' : 'INATIVO'}
                          </Button>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={company.status === 'Ativo' ? 'success' : 'destructive'}>
                            {company.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Globe className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeTab === 'saas-dashboard' ? 'Painel SaaS' : 
           activeTab === 'empresas' ? 'Gestão de Empresas' :
           activeTab === 'planos' ? 'Planos e Assinaturas' : 'Logs do Sistema'}
        </h1>
        <p className="text-muted-foreground">Gerenciamento global do sistema e empresas parceiras.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Empresas" value="128" icon={Building2} trend={15} color="bg-indigo-500" />
        <StatCard title="Usuários Ativos" value="1.240" icon={Users} trend={8} color="bg-blue-500" />
        <StatCard title="Faturamento SaaS" value="R$ 45.800,00" icon={DollarSign} trend={12} color="bg-emerald-500" />
        <StatCard title="Aguardando Conferência" value={allOrders.filter(o => o.status === 'Entregue').length.toString()} icon={ShieldCheck} color="bg-amber-500" />
      </div>

      {renderSaaSContent()}

      {activeTab === 'saas-dashboard' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Crescimento de Tenants</CardTitle>
              <CardDescription>Novas empresas nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Jan', value: 12 },
                  { name: 'Fev', value: 18 },
                  { name: 'Mar', value: 15 },
                  { name: 'Abr', value: 25 },
                  { name: 'Mai', value: 32 },
                  { name: 'Jun', value: 40 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Distribuição de Planos</CardTitle>
              <CardDescription>Porcentagem de empresas por nível de assinatura</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Basic', value: 45, color: '#94a3b8' },
                      { name: 'Premium', value: 35, color: '#6366f1' },
                      { name: 'Enterprise', value: 20, color: '#10b981' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Basic', value: 45, color: '#94a3b8' },
                      { name: 'Premium', value: 35, color: '#6366f1' },
                      { name: 'Enterprise', value: 20, color: '#10b981' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function DashboardView({ 
  onViewOS, 
  onNavigate, 
  allOrders 
}: { 
  onViewOS: (id: string) => void, 
  onNavigate: (tab: string) => void,
  allOrders: ServiceOrder[]
}) {
  const [hasPlayedAlert, setHasPlayedAlert] = useState(false);

  const reminders = [
    { id: '1', type: 'Vencido', desc: 'Boleto Fornecedor Telas', val: 1200.00, date: '12/04/2026', entity: 'Distribuidora X' },
    { id: '2', type: 'Vencendo Hoje', desc: 'Aluguel Sala', val: 2500.00, date: '15/04/2026', entity: 'Imobiliária Central' },
    { id: '3', type: 'Atrasado', desc: 'Energia Elétrica', val: 350.00, date: '10/04/2026', entity: 'Equatorial Energia' },
  ];

  useEffect(() => {
    if (reminders.length > 0 && !hasPlayedAlert) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log("Audio play blocked by browser", e));
      setHasPlayedAlert(true);
    }
  }, [hasPlayedAlert]);

  const data = [
    { name: 'Seg', os: 12, vendas: 8 },
    { name: 'Ter', os: 19, vendas: 12 },
    { name: 'Qua', os: 15, vendas: 10 },
    { name: 'Qui', os: 22, vendas: 15 },
    { name: 'Sex', os: 30, vendas: 20 },
    { name: 'Sáb', os: 18, vendas: 25 },
    { name: 'Dom', os: 5, vendas: 10 },
  ];

  const pieData = [
    { name: 'Celulares', value: 400, color: '#3b82f6' },
    { name: 'Impressoras', value: 300, color: '#10b981' },
    { name: 'Informática', value: 300, color: '#f59e0b' },
    { name: 'Scanners', value: 200, color: '#8b5cf6' },
  ];

  const financialData = [
    { name: 'Jan', receita: 4000, despesa: 2400, lucro: 1600 },
    { name: 'Fev', receita: 3000, despesa: 1398, lucro: 1602 },
    { name: 'Mar', receita: 2000, despesa: 9800, lucro: -7800 },
    { name: 'Abr', receita: 2780, despesa: 3908, lucro: -1128 },
    { name: 'Mai', receita: 1890, despesa: 4800, lucro: -2910 },
    { name: 'Jun', receita: 2390, despesa: 3800, lucro: -1410 },
    { name: 'Jul', receita: 3490, despesa: 4300, lucro: -810 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo da sua assistência hoje.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard title="OS Abertas" value={allOrders.filter(o => o.status === 'Aberta').length.toString()} icon={Wrench} trend={12} color="bg-blue-500" description="Total de ordens de serviço em andamento no sistema." />
        <StatCard title="Faturamento Mensal" value="R$ 12.450,00" icon={DollarSign} trend={8} color="bg-emerald-500" description="Soma de todas as vendas e OS finalizadas este mês." />
        <StatCard title="Prontas / Retirada" value={allOrders.filter(o => o.status === 'Pronta').length.toString()} icon={CheckCircle2} color="bg-emerald-600" description="Equipamentos aguardando o cliente retirar." />
        <StatCard title="Entregue p/ Conferência" value={allOrders.filter(o => o.status === 'Entregue').length.toString()} icon={ShieldCheck} color="bg-amber-500" description="OS entregues que aguardam conferência administrativa." />
        <StatCard title="Vendas Hoje" value="15" icon={ShoppingCart} trend={-2} color="bg-indigo-500" description="Quantidade de vendas realizadas no PDV hoje." />
        <StatCard title="Estoque Baixo" value="8" icon={Package} color="bg-rose-500" description="Produtos com quantidade abaixo do limite mínimo." />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Movimentação Semanal</CardTitle>
            <CardDescription>Comparativo entre Ordens de Serviço e Vendas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="os" fill="#3b82f6" radius={[4, 4, 0, 0]} name="OS" />
                <Bar dataKey="vendas" fill="#10b981" radius={[4, 4, 0, 0]} name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Serviços por Categoria</CardTitle>
            <CardDescription>Distribuição de atendimentos</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-7 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Desempenho Financeiro</CardTitle>
                <CardDescription>Receita, Despesas e Lucro Líquido</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Receita</Badge>
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Despesa</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Lucro</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDespesa)" name="Despesa" />
                <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Lucro" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-sm border-l-4 border-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500 animate-pulse" />
                Lembretes Financeiros
              </CardTitle>
              <CardDescription>Contas vencidas ou próximas do vencimento</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => onNavigate('financeiro')}>
              Ver Tudo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminders.map((rem) => (
                <div key={rem.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-secondary/50 group hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-10 rounded-full",
                      rem.type === 'Vencido' || rem.type === 'Atrasado' ? "bg-rose-500" : "bg-amber-500"
                    )} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{rem.desc}</span>
                        <Badge variant={rem.type === 'Vencendo Hoje' ? 'warning' : 'destructive'} className="text-[9px] px-1 py-0 h-4">
                          {rem.type}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{rem.entity} • Vence em: {rem.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-rose-600">R$ {rem.val.toFixed(2)}</p>
                    <Button 
                      size="sm" 
                      variant="link" 
                      className="h-auto p-0 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onNavigate('financeiro')}
                    >
                      Ir para pagamento
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Próximos Atendimentos</CardTitle>
              <CardDescription>Prioridade Alta e Urgente no topo</CardDescription>
            </div>
            <Wrench className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...allOrders]
                .sort((a, b) => {
                  const priorityMap = { 'Urgente': 4, 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                  return priorityMap[b.priority] - priorityMap[a.priority];
                })
                .slice(0, 5)
                .map((os) => (
                <div 
                  key={os.id} 
                  className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-secondary/50 cursor-pointer"
                  onClick={() => onViewOS(os.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-10 rounded-full",
                      os.priority === 'Urgente' ? "bg-rose-600" : 
                      os.priority === 'Alta' ? "bg-rose-400" : "bg-primary/20"
                    )}></div>
                    <div>
                      <p className="text-sm font-bold">{os.number} - {os.equipment}</p>
                      <p className="text-xs text-muted-foreground">{os.customerName} • {os.priority}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {os.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Equipamentos Prontos</CardTitle>
              <CardDescription>Aguardando retirada do cliente</CardDescription>
            </div>
            <Package className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_OS.filter(os => os.status === 'Pronta').map((os) => (
                <div key={os.id} className="flex items-center justify-between p-3 border rounded-lg bg-emerald-50/30 border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{os.equipment}</p>
                      <p className="text-xs text-muted-foreground">{os.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-700">R$ {os.value.toFixed(2)}</p>
                    <Badge variant={os.paymentStatus === 'Pago' ? 'success' : 'warning'} className="text-[9px] h-4">
                      {os.paymentStatus || 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
              {MOCK_OS.filter(os => os.status === 'Pronta').length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8 italic">Nenhum equipamento pronto no momento.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OSPrintView({ os, onClose, company }: { os: ServiceOrder, onClose: () => void, company: Company }) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.success('Gerando PDF para download...');
    setTimeout(() => {
      toast.success('PDF baixado com sucesso!');
    }, 1500);
  };

  const OSContent = () => (
    <div className="p-4 md:p-8 print:p-0 bg-white text-black font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b-2 border-black pb-6 mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-black text-white rounded-lg flex items-center justify-center text-xl font-bold shrink-0">TM</div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">{company.name}</h1>
            <p className="text-[10px] md:text-xs uppercase font-bold text-gray-600">{company.address}</p>
            <p className="text-[10px] md:text-xs font-bold text-gray-600">{company.cnpj} • {company.phone}</p>
          </div>
        </div>
        <div className="text-left md:text-right shrink-0 w-full md:w-auto">
          <div className="bg-black text-white px-4 py-2 rounded-md mb-2 inline-block md:block w-full md:w-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Ordem de Serviço</p>
            <p className="text-xl font-black">{os.number}</p>
          </div>
          <p className="text-[10px] font-bold text-gray-600 italic">Data de Entrada: {format(new Date(os.createdAt), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </div>

      {/* Customer & Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
        <div className="space-y-2 md:space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-gray-200 pb-1">Dados do Cliente</h3>
          <div>
            <p className="text-sm font-black">{os.customerName}</p>
            <p className="text-xs text-gray-600">ID Cliente: {os.customerId}</p>
          </div>
        </div>
        <div className="space-y-2 md:space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-gray-200 pb-1">Equipamento</h3>
          <div>
            <p className="text-sm font-black">{os.equipment}</p>
            <p className="text-xs text-gray-600">{os.brand} {os.model}</p>
            <p className="text-xs text-gray-600 font-mono">S/N: {os.serialNumber}</p>
          </div>
        </div>
      </div>

      {/* Defect & Diagnosis */}
      <div className="space-y-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-xs font-black uppercase tracking-widest mb-2">Defeito Informado</h3>
          <p className="text-sm italic text-gray-700">"{os.defect}"</p>
        </div>
        {os.diagnosis && (
          <div className="p-4 rounded-lg border border-black/10">
            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Diagnóstico Técnico</h3>
            <p className="text-sm">{os.diagnosis}</p>
          </div>
        )}
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
        <div className="border p-2 md:p-3 rounded-lg text-center">
          <p className="text-[9px] uppercase font-bold text-gray-500 mb-1 leading-none">Status</p>
          <p className="text-xs md:text-sm font-black">{os.status}</p>
        </div>
        <div className="border p-2 md:p-3 rounded-lg text-center">
          <p className="text-[9px] uppercase font-bold text-gray-500 mb-1 leading-none">Prioridade</p>
          <p className="text-xs md:text-sm font-black">{os.priority}</p>
        </div>
        <div className="border p-2 md:p-3 rounded-lg text-center">
          <p className="text-[9px] uppercase font-bold text-gray-500 mb-1 leading-none">Prazo Diag.</p>
          <p className="text-xs md:text-sm font-black">
            {os.diagnosisDeadline ? format(new Date(os.diagnosisDeadline), 'dd/MM/yyyy') : '--/--/----'}
          </p>
        </div>
        <div className="border p-2 md:p-3 rounded-lg text-center">
          <p className="text-[9px] uppercase font-bold text-gray-500 mb-1 leading-none">Prazo Entrega</p>
          <p className="text-xs md:text-sm font-black">
            {os.completionDeadline ? format(new Date(os.completionDeadline), 'dd/MM/yyyy') : '--/--/----'}
          </p>
        </div>
      </div>

      {/* Items / Parts / Services */}
      <div className="mb-8 border rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px] md:min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-[10px] uppercase font-black">Descrição</th>
              <th className="px-4 py-2 text-center text-[10px] uppercase font-black">Tipo</th>
              <th className="px-4 py-2 text-center text-[10px] uppercase font-black">Qtd</th>
              <th className="px-4 py-2 text-right text-[10px] uppercase font-black">Unitário</th>
              <th className="px-4 py-2 text-right text-[10px] uppercase font-black">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {os.items && os.items.length > 0 ? os.items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-medium">{item.description}</td>
                <td className="px-4 py-3 text-center text-xs">{item.type}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold">R$ {item.totalPrice.toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">
                  Nenhum item ou serviço registrado até o momento.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50 font-black">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right uppercase tracking-widest text-xs">Valor Total da OS:</td>
              <td className="px-4 py-3 text-right text-lg">R$ {os.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Terms & Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-12">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-gray-200 pb-1">Termos e Condições</h3>
          <p className="text-[9px] text-gray-500 leading-relaxed">
            1. O prazo para diagnóstico é de até 48h úteis.<br />
            2. Equipamentos não retirados em até 90 dias após a notificação serão considerados abandonados.<br />
            3. A garantia de peças é de 90 dias conforme CDC, exceto para danos causados por mau uso, umidade ou intervenção de terceiros.
          </p>
        </div>
        <div className="flex flex-col justify-end gap-12">
          <div className="border-t border-black pt-2 text-center">
            <p className="text-[9px] uppercase font-bold">Assinatura do Cliente</p>
          </div>
          <div className="border-t border-black pt-2 text-center">
            <p className="text-[9px] uppercase font-bold">{company.name}</p>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-12 text-center border-t pt-4">
        <p className="text-[10px] text-gray-400">Este documento é uma representação digital da Ordem de Serviço {os.number}. Gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}.</p>
      </div>
    </div>
  );

  return (
    <Dialog open={!!os} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[850px] w-[95vw] max-h-[95vh] overflow-y-auto p-0 border-none bg-white">
        <div id="os-print-area">
          <OSContent />
          
          {company.osCopiesPerPage === 2 && (
            <>
              <div className="border-y-2 border-dashed border-gray-300 my-8 py-4 text-center print:my-4 print:py-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Scissors className="w-3 h-3" /> Cortar aqui - Via do {company.name} / Via do Cliente
                </p>
              </div>
              <OSContent />
            </>
          )}
        </div>

        <div className="p-4 bg-gray-100 border-t flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}><Download className="w-4 h-4" /> Baixar PDF</Button>
          <Button className="gap-2" onClick={handlePrint}><Printer className="w-4 h-4" /> Imprimir</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const OSBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string, icon: any, label: string }> = {
    'Aberta': { color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: Clock, label: 'ABERTA' },
    'Em análise': { color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: Search, label: 'EM ANÁLISE' },
    'Aguardando aprovação': { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: Clock, label: 'AGUARDANDO APROVAÇÃO' },
    'Aguardando peça': { color: 'bg-orange-500/10 text-orange-600 border-orange-200', icon: Package, label: 'AGUARDANDO PEÇA' },
    'Em reparo': { color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', icon: Wrench, label: 'EM REPARO' },
    'Testes finais': { color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200', icon: Activity, label: 'TESTES FINAIS' },
    'Pronta': { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle2, label: 'PRONTA' },
    'Entregue': { color: 'bg-slate-500/10 text-slate-600 border-slate-200', icon: ShoppingCart, label: 'ENTREGUE' },
    'Finalizada': { color: 'bg-green-500/10 text-green-600 border-green-200', icon: Check, label: 'FINALIZADA' },
    'Cancelada': { color: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: XCircle, label: 'CANCELADA' }
  };

  const config = configs[status] || { color: 'bg-gray-500/10 text-gray-600 border-gray-200', icon: Clock, label: status.toUpperCase() };
  const Icon = config.icon;

  return (
    <div className={cn("px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 w-fit shadow-sm", config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
};

function OSListView({ 
  onViewOS, 
  allOrders, 
  sortOrder,
  teamUsers,
  user,
  equipmentTypes,
  setAllOrders,
  printTemplates,
  company
}: { 
  onViewOS: (id: string) => void, 
  allOrders: ServiceOrder[], 
  sortOrder: 'number' | 'date' | 'priority',
  teamUsers: User[],
  user: User | null,
  equipmentTypes: EquipmentType[],
  setAllOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>,
  printTemplates: PrintTemplate[],
  company: Company
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [showPostSavePrintDialog, setShowPostSavePrintDialog] = useState(false);
  const [lastCreatedOS, setLastCreatedOS] = useState<ServiceOrder | null>(null);
  const [printCheckboxes, setPrintCheckboxes] = useState({
    label: true,
    entry: true,
    warranty: false
  });
  const [osSearch, setOsSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedOSForA4Print, setSelectedOSForA4Print] = useState<ServiceOrder | null>(null);
  const [selectedOSForTemplatePrint, setSelectedOSForTemplatePrint] = useState<ServiceOrder | null>(null);
  const [isPrintTemplateDialogOpen, setIsPrintTemplateDialogOpen] = useState(false);
  const [isTemplatePreviewOpen, setIsTemplatePreviewOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const handleTemplatePrint = (os: ServiceOrder) => {
    if (printTemplates.length === 0) {
      toast.error('Nenhum layout cadastrado. Crie um template em Personalizar Impressão.');
      return;
    }
    setSelectedOSForTemplatePrint(os);
    setSelectedTemplateId(prev => (printTemplates.some(t => t.id === prev) ? prev : printTemplates[0].id));
    setIsTemplatePreviewOpen(false);
    setIsPrintTemplateDialogOpen(true);
  };

  const selectedTemplate = useMemo(
    () => printTemplates.find(t => t.id === selectedTemplateId) || null,
    [printTemplates, selectedTemplateId]
  );
  const [newOsItems, setNewOsItems] = useState<OSItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('0');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemType, setNewItemType] = useState<'Produto' | 'Serviço'>('Serviço');

  const addItem = () => {
    if (!newItemDesc.trim()) return;
    const price = parseFloat(newItemPrice);
    const qty = parseInt(newItemQty);
    const item: OSItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newItemDesc,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
      type: newItemType
    };
    setNewOsItems([...newOsItems, item]);
    setNewItemDesc('');
    setNewItemPrice('0');
    setNewItemQty('1');
  };

  const removeItem = (id: string) => {
    setNewOsItems(newOsItems.filter(i => i.id !== id));
  };

  const totalOSValue = newOsItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const customers = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Oliveira' },
    { id: '3', name: 'Tech Solutions LTDA' }
  ];

  const filteredCustomers = customers.filter(c => 
    fuzzyMatch(c.name, customerSearch)
  );

  const filteredOrders = allOrders.filter(os => {
    const matchesSearch = 
      fuzzyMatch(os.customerName, osSearch) ||
      fuzzyMatch(os.equipment, osSearch) ||
      os.number.toLowerCase().includes(osSearch.toLowerCase()) ||
      fuzzyMatch(os.brand, osSearch) ||
      fuzzyMatch(os.model, osSearch);
    
    const matchesStatus = statusFilter === 'todos' || os.status === statusFilter;

    // Filtro por equipamento permitido para técnicos
    const isTech = user?.role === 'USUARIO';
    const allowedEquipmentNames = equipmentTypes
      .filter(eq => (user?.allowedEquipmentIds || []).includes(eq.id))
      .map(eq => eq.name.toLowerCase());
    
    const matchesEquipPerm = !isTech || allowedEquipmentNames.includes(os.equipment.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesEquipPerm;
  });

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      switch (sortOrder) {
        case 'number':
          return b.number.localeCompare(a.number);
        case 'date':
          const dateA = a.diagnosisDate ? new Date(a.diagnosisDate).getTime() : new Date(a.createdAt).getTime();
          const dateB = b.diagnosisDate ? new Date(b.diagnosisDate).getTime() : new Date(b.createdAt).getTime();
          return dateB - dateA;
        case 'priority':
          const priorityScore: Record<string, number> = { 'Urgente': 4, 'Alta': 3, 'Média': 2, 'Baixa': 1 };
          return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
        default:
          return 0;
      }
    });
  }, [filteredOrders, sortOrder]);

  const handleSaveOS = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eqTypeId = formData.get('equipmentType') as string;
    const equipment = formData.get('equipment') as string;
    const eqType = equipmentTypes.find(et => et.id === eqTypeId);

    const now = new Date();
    const diagDays = eqType?.defaultDiagnosisDays || 1;
    const compDays = eqType?.defaultCompletionDays || 3;

    const diagDeadline = addDays(now, diagDays).toISOString();
    const compDeadline = addDays(now, compDays).toISOString();

    const newOS: ServiceOrder = {
      id: Math.random().toString(36).substr(2, 9),
      number: `OS-${new Date().getFullYear()}-${(allOrders.length + 1).toString().padStart(3, '0')}`,
      customerId: 'custom-id', // Simplified
      customerName: customerSearch,
      equipment: (equipment || '').toUpperCase(),
      brand: (formData.get('brand') as string || '').toUpperCase(),
      model: (formData.get('model') as string || '').toUpperCase(),
      serialNumber: (formData.get('serial') as string || '').toUpperCase(),
      defect: (formData.get('defeito') as string || '').toUpperCase(),
      details: (formData.get('defeito_balcao') as string || '').toUpperCase(),
      accessories: (formData.get('acessorios') as string || '').toUpperCase(),
      status: formData.get('status') as any || 'Aberta',
      serviceType: formData.get('serviceType') as any,
      isApproved: formData.get('isApproved') === 'Sim',
      priority: formData.get('priority') as any,
      value: totalOSValue,
      items: newOsItems,
      technicianId: formData.get('technicianId') as string,
      technicianName: teamUsers.find(u => u.id === formData.get('technicianId'))?.name || '',
      diagnosisDeadline: diagDeadline,
      completionDeadline: compDeadline,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      companyId: '1'
    };

    setAllOrders(prev => [newOS, ...prev]);
    setIsDialogOpen(false);
    
    // Clear form
    setNewOsItems([]);
    setCustomerSearch('');
    
    // Open Print Selection Dialog
    setLastCreatedOS(newOS);
    setShowPostSavePrintDialog(true);
  };

  const handleShareLink = (os: ServiceOrder) => {
    const text = `Olá ${os.customerName}! A Ordem de Serviço ${os.number} para o seu ${os.equipment} já está em andamento. Status atual: ${os.status}. Você pode acompanhar as novidades por este canal.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    toast.success('Link de acompanhamento gerado!');
  };

  const handleDeleteOS = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta Ordem de Serviço? Esta ação não pode ser desfeita.')) {
      setAllOrders(prev => prev.filter(o => o.id !== id));
      if (selectedOSForA4Print?.id === id) {
        setSelectedOSForA4Print(null);
      }
      if (selectedOSForTemplatePrint?.id === id) {
        setSelectedOSForTemplatePrint(null);
      }
      if (lastCreatedOS?.id === id) {
        setLastCreatedOS(null);
      }
      setIsTemplatePreviewOpen(false);
      setSelectedTemplateId('');
      toast.success('OS excluída com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie todos os atendimentos técnicos da sua empresa.</p>
        </div>
        
        <div className="flex gap-2">
          <ImportDataModal 
            title="O.S." 
            type="Ordens de Serviço" 
            onImport={(data) => console.log('Importing OS', data)} 
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button className="gap-2"><Plus className="w-4 h-4" /> Nova OS</Button>
            } />
            <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
              <DialogDescription>
                Preencha os dados para iniciar um novo atendimento técnico.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveOS} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Pesquisar cliente..." 
                        className="pl-9 uppercase"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        onFocus={() => setShowCustomerResults(true)}
                      />
                      {showCustomerResults && customerSearch && filteredCustomers.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {filteredCustomers.map(c => (
                            <div 
                              key={c.id} 
                              className="px-4 py-2 hover:bg-secondary cursor-pointer text-sm"
                              onClick={() => {
                                setCustomerSearch(c.name);
                                setShowCustomerResults(false);
                              }}
                            >
                              {c.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
                      <DialogTrigger render={
                        <Button variant="outline" size="icon" title="Adicionar Novo Cliente">
                          <Plus className="w-4 h-4" />
                        </Button>
                      } />
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome / Razão Social</Label>
                              <Input placeholder="Nome do cliente" />
                            </div>
                            <div className="space-y-2">
                              <Label>CPF / CNPJ</Label>
                              <Input placeholder="Documento" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>E-mail</Label>
                              <Input type="email" placeholder="email@exemplo.com" />
                            </div>
                            <div className="space-y-2">
                              <Label>Telefone</Label>
                              <Input placeholder="(00) 00000-0000" />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsNewCustomerOpen(false)}>Cancelar</Button>
                          <Button onClick={() => {
                            toast.success('Cliente cadastrado!');
                            setIsNewCustomerOpen(false);
                          }}>Salvar e Continuar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipamento">Equipamento</Label>
                  <Select name="equipmentType" onValueChange={(val) => {
                    const eqType = equipmentTypes.find(e => e.id === val);
                    const equipmentInput = document.getElementById('equipamento') as HTMLInputElement;
                    if(equipmentInput) equipmentInput.value = (eqType?.name || '').toUpperCase();
                  }}>
                    <SelectTrigger className="h-10 text-xs w-full">
                      <SelectValue placeholder="SELECIONE O TIPO..." />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map(eq => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.name.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input id="equipamento" name="equipment" placeholder="DESCRIÇÃO (EX: IPHONE 13)" required className="uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold">Técnico Responsável</Label>
                  <Select name="technicianId">
                    <SelectTrigger className="h-10 text-xs w-full">
                      <SelectValue placeholder="SELECIONE UM TÉCNICO..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamUsers.filter(u => u.role === 'USUARIO').map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca" className="uppercase text-[10px] font-bold">Marca</Label>
                  <Input id="marca" name="brand" placeholder="EX: APPLE" required className="uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold">Prioridade</Label>
                  <Select name="priority" defaultValue="Média">
                    <SelectTrigger className="h-10 text-xs text-left w-full uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">BAIXA</SelectItem>
                      <SelectItem value="Média">MÉDIA</SelectItem>
                      <SelectItem value="Alta">ALTA</SelectItem>
                      <SelectItem value="Urgente">URGENTE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelo" className="uppercase text-[10px] font-bold">Modelo</Label>
                  <Input id="modelo" name="model" placeholder="EX: PRO MAX" required className="uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial" className="uppercase text-[10px] font-bold">Nº de Série / IMEI</Label>
                  <Input id="serial" name="serial" placeholder="OPCIONAL" className="uppercase" onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defeito_balcao" className="uppercase text-[10px] font-bold">Defeito Balcão (Observado na Entrada)</Label>
                <textarea 
                  id="defeito_balcao" 
                  name="defeito_balcao"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="O QUE O ATENDENTE OBSERVOU AO RECEBER O EQUIPAMENTO..."
                  onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defeito" className="uppercase text-[10px] font-bold">Defeito Relatado (Pelo Cliente)</Label>
                <textarea 
                  id="defeito" 
                  name="defeito"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="DESCREVA O PROBLEMA INFORMADO PELO CLIENTE..."
                  required
                  onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acessorios" className="uppercase text-[10px] font-bold">Acessórios / Observações</Label>
                <textarea 
                  id="acessorios" 
                  name="acessorios"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="EX: CAPINHA, CARREGADOR, CARTÃO DE MEMÓRIA..."
                  onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                />
              </div>
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Serviços e Produtos</h3>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] uppercase font-bold text-emerald-600">Serviço Aprovado</Label>
                    <input type="checkbox" name="isApproved" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Input 
                      placeholder="Descrição..." 
                      value={newItemDesc} 
                      onChange={(e) => setNewItemDesc(e.target.value)} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Select value={newItemType} onValueChange={(v: any) => setNewItemType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Produto">Prod.</SelectItem>
                        <SelectItem value="Serviço">Serv.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="Qtd" 
                      value={newItemQty} 
                      onChange={(e) => setNewItemQty(e.target.value)} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      placeholder="Valor" 
                      value={newItemPrice} 
                      onChange={(e) => setNewItemPrice(e.target.value)} 
                    />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" size="icon" onClick={addItem}><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {newOsItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-secondary/30 p-2 rounded-lg text-xs">
                      <div className="flex-1">
                        <span className="font-bold">[{item.type}]</span> {item.description}
                        <p className="text-muted-foreground">{item.quantity}x R$ {item.unitPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">R$ {item.totalPrice.toFixed(2)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={() => removeItem(item.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor" className="uppercase text-[10px] font-bold">Valor Total da OS (R$)</Label>
                  <Input id="valor" type="number" step="0.01" placeholder="0,00" value={totalOSValue} disabled className="font-bold text-primary uppercase" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prazo_diagnostico" className="uppercase text-[10px] font-bold">Prazo Diagnóstico</Label>
                  <Input id="prazo_diagnostico" type="date" defaultValue={format(addDays(new Date(), 2), 'yyyy-MM-dd')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prazo_conclusao" className="uppercase text-[10px] font-bold">Prazo Conclusão</Label>
                  <Input id="prazo_conclusao" type="date" defaultValue={format(addDays(new Date(), 5), 'yyyy-MM-dd')} />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold">Tipo de Atendimento</Label>
                  <Select name="serviceType" defaultValue="Normal">
                    <SelectTrigger className="h-10 text-xs text-left w-full uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">NORMAL</SelectItem>
                      <SelectItem value="Garantia">GARANTIA</SelectItem>
                      <SelectItem value="Retorno">RETORNO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold">Status Inicial</Label>
                  <Select name="status" defaultValue="Aberta">
                    <SelectTrigger className="h-10 text-xs text-left w-full uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_COLUMNS.map(status => (
                        <SelectItem key={status} value={status}>{status.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {totalOSValue > 0 && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary">Serviço Aprovado?</p>
                    <p className="text-[10px] text-muted-foreground">Marque se o cliente já autorizou a execução pelo valor acima.</p>
                  </div>
                  <Select name="isApproved" defaultValue="Não">
                    <SelectTrigger className="w-24 h-8 text-xs text-left">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim (APROVADO)</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Ordem de Serviço</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Filtrar por cliente, equipamento ou número..." 
            className="pl-9" 
            value={osSearch}
            onChange={(e) => setOsSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>{statusFilter === 'todos' ? 'Todos Status' : statusFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              {STATUS_COLUMNS.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Imprimir Lista
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">OS</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Equipamento</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Prazo Diag.</th>
                <th className="px-6 py-4 font-semibold">Prazo Conc.</th>
                <th className="px-6 py-4 font-semibold text-right">Valor</th>
                <th className="px-6 py-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedOrders.length > 0 ? sortedOrders.map((os) => {
                const getDeadlineColor = (deadline?: string) => {
                  if (!deadline) return "text-muted-foreground";
                  const today = startOfDay(new Date());
                  const date = startOfDay(new Date(deadline));
                  const diff = differenceInDays(date, today);
                  
                  if (diff < 0) return "text-rose-600 font-bold"; // Vencido
                  if (diff === 0 || diff === 1) return "text-amber-500 font-bold"; // Hoje ou Amanhã (1 dia)
                  return "text-emerald-600 font-bold"; // Em dia
                };

                const getStatusColor = (status: OSStatus) => {
                  switch (status) {
                    case 'Aberta': return 'bg-blue-50/60';
                    case 'Em análise': return 'bg-purple-50/60';
                    case 'Aguardando aprovação': return 'bg-yellow-50/60';
                    case 'Aguardando peça': return 'bg-orange-50/60';
                    case 'Em reparo': return 'bg-indigo-50/60';
                    case 'Testes finais': return 'bg-cyan-50/60';
                    case 'Pronta': return 'bg-emerald-50/60';
                    case 'Entregue': return 'bg-slate-50/60';
                    case 'Finalizada': return 'bg-green-50/60';
                    case 'Cancelada': return 'bg-rose-50/60';
                    default: return '';
                  }
                };

                const getStatusIndicatorColor = (status: OSStatus) => {
                  switch (status) {
                    case 'Aberta': return 'bg-blue-600';
                    case 'Em análise': return 'bg-purple-600';
                    case 'Aguardando aprovação': return 'bg-yellow-600';
                    case 'Aguardando peça': return 'bg-orange-600';
                    case 'Em reparo': return 'bg-indigo-600';
                    case 'Testes finais': return 'bg-cyan-600';
                    case 'Pronta': return 'bg-emerald-600';
                    case 'Entregue': return 'bg-slate-600';
                    case 'Finalizada': return 'bg-green-600';
                    case 'Cancelada': return 'bg-rose-600';
                    default: return 'bg-gray-400';
                  }
                };

                return (
                  <tr key={os.id} className={cn("hover:bg-secondary/20 transition-all border-b group/row", getStatusColor(os.status))}>
                    <td className="px-6 py-4 font-bold text-primary">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", getStatusIndicatorColor(os.status))}></div>
                        {os.number}
                      </div>
                    </td>
                    <td className="px-6 py-4">{os.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{os.equipment}</span>
                        <span className="text-xs text-muted-foreground">{os.brand} {os.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <OSBadge status={os.status} />
                        {os.subStatus && (
                          <span className="text-[10px] bg-white/50 px-1 py-0.5 rounded text-primary font-bold border border-primary/20 leading-none">
                            {os.subStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={cn("px-6 py-4 text-xs", getDeadlineColor(os.diagnosisDeadline))}>
                      {os.diagnosisDeadline ? format(new Date(os.diagnosisDeadline), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className={cn("px-6 py-4 text-xs", getDeadlineColor(os.completionDeadline))}>
                      {os.completionDeadline ? format(new Date(os.completionDeadline), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      R$ {os.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {!os.technicianId && user?.role === 'USUARIO' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            if(!user) return;
                            setAllOrders(prev => prev.map(o => o.id === os.id ? { ...o, technicianId: user.id, technicianName: user.name } : o));
                            toast.success('Você assumiu esta OS!');
                          }}
                        >
                          <Wrench className="w-3 h-3" /> Assumir
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary"
                        onClick={() => onViewOS(os.id)}
                        title="Ver Detalhes / Gerenciar O.S"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ações da OS">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-48 shadow-xl border-none p-1">
                          <DropdownMenuLabel>Ações da OS</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onViewOS(os.id)}>
                            <Edit className="w-4 h-4 mr-2" /> Editar OS
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedOSForA4Print(os)}>
                            <FileText className="w-4 h-4 mr-2" /> PDF / Impressão A4
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTemplatePrint(os)}>
                            <Printer className="w-4 h-4 mr-2" /> Etiqueta / Cupom
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareLink(os)}>
                            <Share2 className="w-4 h-4 mr-2" /> Compartilhar Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-600" onClick={() => handleDeleteOS(os.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir OS
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                  Nenhuma ordem de serviço encontrada para os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </Card>

      {selectedOSForA4Print && (
        <OSPrintView 
          os={selectedOSForA4Print} 
          onClose={() => setSelectedOSForA4Print(null)} 
          company={company}
        />
      )}

      {/* Dialog para Selecionar Template de Impressão */}
      <Dialog
        open={isPrintTemplateDialogOpen}
        onOpenChange={(open) => {
          setIsPrintTemplateDialogOpen(open);
          if (!open && !isTemplatePreviewOpen) {
            setSelectedTemplateId('');
            setSelectedOSForTemplatePrint(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Imprimir Etiqueta / Cupom</DialogTitle>
            <DialogDescription>
              Selecione o layout que deseja usar para esta impressão.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Escolha o Layout</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template..." />
                </SelectTrigger>
                <SelectContent>
                  {printTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.type})</SelectItem>
                  ))}
                  {printTemplates.length === 0 && (
                    <SelectItem value="none" disabled>Nenhum layout cadastrado</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPrintTemplateDialogOpen(false);
                setIsTemplatePreviewOpen(false);
                setSelectedTemplateId('');
                setSelectedOSForTemplatePrint(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              disabled={!selectedTemplateId} 
              onClick={() => {
                setIsTemplatePreviewOpen(true);
                setIsPrintTemplateDialogOpen(false);
              }}
            >
              Visualizar Impressão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dynamic Print Rendering */}
      {isTemplatePreviewOpen && selectedTemplate && selectedOSForTemplatePrint && (
        <DynamicPrintView 
          template={selectedTemplate} 
          data={selectedOSForTemplatePrint} 
          onClose={() => {
            setIsTemplatePreviewOpen(false);
            setSelectedTemplateId('');
            setSelectedOSForTemplatePrint(null);
          }} 
        />
      )}

      {/* Diálogo de Opções de Impressão Pós-Salvamento */}
      <Dialog open={showPostSavePrintDialog} onOpenChange={setShowPostSavePrintDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-primary p-6 text-white flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black flex items-center gap-2 text-white">
                <CheckCircle2 className="w-6 h-6 text-white" />
                OS SALVA COM SUCESSO!
              </DialogTitle>
              <DialogDescription className="text-white/70 font-medium">
                A ordem de serviço <strong>{lastCreatedOS?.number}</strong> foi registrada.
              </DialogDescription>
            </div>
            <PrinterIcon className="w-10 h-10 text-white/20" />
          </div>

          <div className="p-8 space-y-4">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">Selecione o que deseja imprimir:</h4>
            
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:shadow-md",
                printCheckboxes.label ? "border-primary bg-primary/5 shadow-sm" : "border-muted/20 bg-muted/5 hover:border-primary/30"
              )}
              onClick={() => setPrintCheckboxes(prev => ({ ...prev, label: !prev.label }))}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  printCheckboxes.label ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Tags className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase">Etiqueta de Entrada</p>
                  <p className="text-[10px] text-muted-foreground font-bold">Impressão Térmica (60x40 / 40x25)</p>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                printCheckboxes.label ? "bg-primary border-primary" : "border-muted-foreground/30"
              )}>
                {printCheckboxes.label && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
              </div>
            </div>

            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:shadow-md",
                printCheckboxes.entry ? "border-primary bg-primary/5 shadow-sm" : "border-muted/20 bg-muted/5 hover:border-primary/30"
              )}
              onClick={() => setPrintCheckboxes(prev => ({ ...prev, entry: !prev.entry }))}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  printCheckboxes.entry ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase">Comprovante de Entrada</p>
                  <p className="text-[10px] text-muted-foreground font-bold">Impressão A4 / Térmica 80mm</p>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                printCheckboxes.entry ? "bg-primary border-primary" : "border-muted-foreground/30"
              )}>
                {printCheckboxes.entry && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
              </div>
            </div>

            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:shadow-md",
                printCheckboxes.warranty ? "border-primary bg-primary/5 shadow-sm" : "border-muted/20 bg-muted/5 hover:border-primary/30"
              )}
              onClick={() => setPrintCheckboxes(prev => ({ ...prev, warranty: !prev.warranty }))}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  printCheckboxes.warranty ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase">Termo de Garantia</p>
                  <p className="text-[10px] text-muted-foreground font-bold">Contrato de Serviço / Garantia</p>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                printCheckboxes.warranty ? "bg-primary border-primary" : "border-muted-foreground/30"
              )}>
                {printCheckboxes.warranty && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button variant="ghost" className="flex-1 h-12 font-bold uppercase" onClick={() => setShowPostSavePrintDialog(false)}>
                Sair sem imprimir
              </Button>
              <Button 
                className="flex-1 h-12 font-black bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-lg shadow-emerald-200" 
                onClick={() => {
                  toast.success('Gerando impressões selecionadas...');
                  setShowPostSavePrintDialog(false);
                  if (lastCreatedOS) {
                    setSelectedOSForA4Print(lastCreatedOS);
                  }
                }}
              >
                <Printer className="w-5 h-5" strokeWidth={3} /> IMPRIMIR SELECIONADOS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomerView({ 
  customers, 
  setCustomers 
}: { 
  customers: any[], 
  setCustomers: React.Dispatch<React.SetStateAction<any[]>> 
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustomer, setNewCustomer] = useState<any>({
    name: '',
    doc: '',
    email: '',
    phone: '',
    zip: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP'
  });
  
  const filteredCustomers = customers.filter(c => 
    fuzzyMatch(c.name, customerSearch) ||
    fuzzyMatch(c.doc || '', customerSearch) ||
    fuzzyMatch(c.phone || '', customerSearch) ||
    fuzzyMatch(c.email || '', customerSearch)
  );

  const handleSaveCustomer = () => {
    if (!newCustomer.name) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    const customer = {
      ...newCustomer,
      id: Math.random().toString(36).substr(2, 9)
    };
    setCustomers(prev => [...prev, customer]);
    toast.success('Cliente cadastrado com sucesso!');
    setIsDialogOpen(false);
    setNewCustomer({
      name: '', doc: '', email: '', phone: '', zip: '',
      street: '', number: '', complement: '', neighborhood: '',
      city: '', state: 'SP'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Base de dados de clientes e histórico de atendimentos.</p>
        </div>
        
        <div className="flex gap-2">
          <ImportDataModal 
            title="Clientes" 
            type="Clientes" 
            onImport={(data) => {
              setCustomers(prev => [...prev, ...data]);
              toast.success('Clientes importados com sucesso!');
            }} 
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Cliente</Button>
            } />
            <DialogContent className="max-w-2xl px-0 overflow-hidden shadow-2xl rounded-3xl">
              <div className="bg-primary p-6 text-white">
                <DialogTitle className="text-2xl font-black">Cadastrar Novo Cliente</DialogTitle>
                <DialogDescription className="text-white/70">Preencha os dados abaixo para registrar um novo cliente no sistema.</DialogDescription>
              </div>
              
              <div className="grid gap-6 p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold">Nome Completo / Razão Social</Label>
                    <Input id="name" placeholder="Ex: João da Silva" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc" className="font-bold">CPF / CNPJ</Label>
                    <Input id="doc" placeholder="000.000.000-00" value={newCustomer.doc} onChange={e => setNewCustomer({...newCustomer, doc: e.target.value})} />
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold">E-mail</Label>
                  <Input id="email" type="email" placeholder="cliente@email.com" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold">Telefone / WhatsApp</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Informações de Endereço</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="font-bold">CEP</Label>
                    <Input id="cep" placeholder="00000-000" value={newCustomer.zip} onChange={e => setNewCustomer({...newCustomer, zip: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address" className="font-bold">Logradouro (Rua, Av.)</Label>
                    <Input id="address" placeholder="Ex: Rua das Flores" value={newCustomer.street} onChange={e => setNewCustomer({...newCustomer, street: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number" className="font-bold">Número</Label>
                    <Input id="number" placeholder="123" value={newCustomer.number} onChange={e => setNewCustomer({...newCustomer, number: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="complement" className="font-bold">Complemento</Label>
                    <Input id="complement" placeholder="Apto, Bloco, etc." value={newCustomer.complement} onChange={e => setNewCustomer({...newCustomer, complement: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood" className="font-bold">Bairro</Label>
                    <Input id="neighborhood" placeholder="Centro" value={newCustomer.neighborhood} onChange={e => setNewCustomer({...newCustomer, neighborhood: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-bold">Cidade</Label>
                    <Input id="city" placeholder="São Paulo" value={newCustomer.city} onChange={e => setNewCustomer({...newCustomer, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="font-bold">Estado</Label>
                    <Select value={newCustomer.state} onValueChange={val => setNewCustomer({...newCustomer, state: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-secondary/10 flex justify-end gap-3 border-t">
              <Button variant="outline" className="font-bold h-12 px-6" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="font-black h-12 px-8" onClick={handleSaveCustomer}>Salvar Cliente</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <Card className="border-none shadow-sm">
      <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, CPF/CNPJ ou telefone..." 
              className="pl-9" 
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">Nome / Razão Social</th>
                <th className="px-6 py-3">Documento</th>
                <th className="px-6 py-3">Contato</th>
                <th className="px-6 py-3">Cidade</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.doc}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{c.phone}</span>
                      <span className="text-xs text-muted-foreground">{c.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{c.city}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><FileText className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StockView({ 
  fiscalEnabled, 
  allProducts, 
  setAllProducts,
  rmaHistory,
  setRmaHistory
}: { 
  fiscalEnabled: boolean, 
  allProducts: any[], 
  setAllProducts: React.Dispatch<React.SetStateAction<any[]>>,
  rmaHistory: any[],
  setRmaHistory: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [buySearch, setBuySearch] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [bestSellersPeriod, setBestSellersPeriod] = useState('30d');
  const [bestSellersDisplayCount, setBestSellersDisplayCount] = useState(10);
  
  const [categories, setCategories] = useState([
    { id: '1', name: 'Peças', type: 'Produto' },
    { id: '2', name: 'Acessórios', type: 'Produto' },
    { id: '3', name: 'Mão de Obra', type: 'Serviço' },
    { id: '4', name: 'Software', type: 'Serviço' },
  ]);

  const [editingCategory, setEditingCategory] = useState<{id: string, name: string, type: string} | null>(null);

  const [stockSearch, setStockSearch] = useState('');
  const [stockFilterCategory, setStockFilterCategory] = useState('todas');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const products = allProducts; // For compatibility with existing bestSellers calculation if needed

  const bestSellers = [
    { id: '1', name: 'Tela iPhone 13 Original', totalSales: 45, value: 38250, cat: 'Peças', cost: 22500 },
    { id: '2', name: 'Bateria Samsung S22', totalSales: 38, value: 4560, cat: 'Peças', cost: 3040 },
    { id: '3', name: 'Mão de Obra Reparo Placa', totalSales: 32, value: 9600, cat: 'Mão de Obra', cost: 0 },
    { id: '4', name: 'Película 3D iPhone', totalSales: 28, value: 840, cat: 'Acessórios', cost: 280 },
    { id: '5', name: 'Cabo Lightning 1m', totalSales: 25, value: 1250, cat: 'Acessórios', cost: 500 },
    { id: '6', name: 'Conector de Carga Moto G60', totalSales: 22, value: 550, cat: 'Peças', cost: 220 },
    { id: '7', name: 'Mão de Obra Troca de Tela', totalSales: 20, value: 4000, cat: 'Mão de Obra', cost: 0 },
    { id: '8', name: 'Fone de Ouvido Bluetooth', totalSales: 18, value: 2700, cat: 'Acessórios', cost: 1350 },
    { id: '9', name: 'Capa Silicone iPhone 13', totalSales: 15, value: 750, cat: 'Acessórios', cost: 225 },
    { id: '10', name: 'Carregador 20W USB-C', totalSales: 12, value: 1800, cat: 'Acessórios', cost: 900 },
    { id: '11', name: 'Tela iPhone 12', totalSales: 10, value: 7500, cat: 'Peças', cost: 4500 },
    { id: '12', name: 'Bateria iPhone 11', totalSales: 8, value: 1600, cat: 'Peças', cost: 800 },
  ].sort((a,b) => b.totalSales - a.totalSales);

  const lowStockProducts = allProducts.filter(p => p.stock <= p.min);
  const filteredBuyProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(buySearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(buySearch.toLowerCase())
  );

  const filteredStockProducts = allProducts.filter(p => {
    const matchesSearch = fuzzyMatch(p.name, stockSearch) || fuzzyMatch(p.sku, stockSearch);
    const matchesCategory = stockFilterCategory === 'todas' || p.cat === stockFilterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (id: string) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      setAllProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Produto excluído com sucesso');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">Controle de peças, produtos e suprimentos.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="gap-2"><ShoppingCart className="w-4 h-4" /> Compras / Reposição</Button>
            } />
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Gestão de Compras e Reposição</DialogTitle>
                <DialogDescription>Gerencie itens para compra e reposição de estoque.</DialogDescription>
              </DialogHeader>
              
              <div className="flex gap-2 my-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Pesquisar produto para adicionar à lista..." 
                    className="pl-9"
                    value={buySearch}
                    onChange={(e) => setBuySearch(e.target.value)}
                  />
                  {buySearch && filteredBuyProducts.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredBuyProducts.map(p => (
                        <div 
                          key={p.id} 
                          className="px-4 py-2 hover:bg-secondary cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            toast.success(`${p.name} adicionado à lista de compras`);
                            setBuySearch('');
                          }}
                        >
                          <span className="text-sm">{p.name}</span>
                          <Plus className="w-3 h-3 text-primary" />
                        </div>
                      ))}
                    </div>
                  )}
                  {buySearch && filteredBuyProducts.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Produto não encontrado</p>
                      <Button size="sm" className="gap-2" onClick={() => setIsProductModalOpen(true)}>
                        <Plus className="w-3 h-3" /> Cadastrar Novo Produto
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Itens com Estoque Crítico
                  </h3>
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="px-4 py-2 text-left">Produto</th>
                          <th className="px-4 py-2 text-center">Estoque</th>
                          <th className="px-4 py-2 text-center">Mínimo</th>
                          <th className="px-4 py-2 text-center w-24">Qtd Compra</th>
                          <th className="px-4 py-2 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {lowStockProducts.map(p => (
                          <tr key={p.id} className="hover:bg-secondary/10">
                            <td className="px-4 py-2">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{p.sku}</div>
                            </td>
                            <td className="px-4 py-2 text-center text-rose-600 font-bold">{p.stock}</td>
                            <td className="px-4 py-2 text-center">{p.min}</td>
                            <td className="px-4 py-2">
                              <Input type="number" defaultValue={p.min * 2} className="h-7 text-center text-xs" />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-primary"><Edit className="w-3 h-3" /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500"><Trash2 className="w-3 h-3" /></Button>
                                <Button size="sm" variant="outline" className="h-7 text-[10px]">Comprado</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsBuyModalOpen(false)}>Fechar</Button>
                <Button className="gap-2"><Printer className="w-4 h-4" /> Imprimir Lista de Compras</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCategoryModalOpen} onOpenChange={(open) => {
            setIsCategoryModalOpen(open);
            if (!open) setEditingCategory(null);
          }}>
            <DialogTrigger render={
              <Button variant="outline" className="gap-2"><Tags className="w-4 h-4" /> Categorias</Button>
            } />
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Gerenciar Categorias</DialogTitle>
                <DialogDescription>Defina e organize as categorias de seus produtos e serviços.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2 p-3 bg-secondary/20 rounded-lg border border-dashed">
                  <Input 
                    placeholder={editingCategory ? "Editar categoria..." : "Nova categoria..."} 
                    className="flex-1 bg-white" 
                    id="cat-name-input"
                    defaultValue={editingCategory?.name || ''}
                  />
                  <Select defaultValue={editingCategory?.type || "Produto"}>
                    <SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Produto">Produto</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" onClick={() => {
                    const nameInput = document.getElementById('cat-name-input') as HTMLInputElement;
                    if (!nameInput.value) return;
                    
                    if (editingCategory) {
                      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: nameInput.value } : c));
                      toast.success('Categoria atualizada!');
                      setEditingCategory(null);
                    } else {
                      setCategories(prev => [...prev, { id: Math.random().toString(), name: nameInput.value, type: 'Produto' }]);
                      toast.success('Categoria criada!');
                    }
                    nameInput.value = '';
                  }}>
                    {editingCategory ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
                  {editingCategory && (
                    <Button size="icon" variant="ghost" onClick={() => setEditingCategory(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="rounded-md border overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3 text-left">Nome</th>
                        <th className="px-4 py-3 text-center">Tipo</th>
                        <th className="px-4 py-3 text-center">Produtos</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {categories.map(cat => {
                        const productCount = products.filter(p => p.cat === cat.name).length;
                        return (
                          <tr key={cat.id} className="hover:bg-secondary/5 transition-colors">
                            <td className="px-4 py-2 font-medium">{cat.name}</td>
                            <td className="px-4 py-2 text-center">
                              <Badge variant="outline" className="text-[10px] uppercase font-bold">{cat.type}</Badge>
                            </td>
                            <td className="px-4 py-2 text-center text-xs text-muted-foreground">{productCount} itens</td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => setEditingCategory(cat)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => {
                                  setCategories(prev => prev.filter(c => c.id !== cat.id));
                                  toast.success('Categoria removida');
                                }}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsCategoryModalOpen(false)}>Concluir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isProductModalOpen} onOpenChange={(open) => {
            setIsProductModalOpen(open);
            if (!open) {
              setEditingProduct(null);
              setProductImage(null);
            }
          }}>
            <DialogTrigger render={
              <Button className="gap-2" onClick={() => {
                setEditingProduct(null);
                setProductImage(null);
              }}><Plus className="w-4 h-4" /> Novo Produto</Button>
            } />
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}</DialogTitle>
                <DialogDescription>Preencha os dados abaixo para {editingProduct ? 'atualizar' : 'cadastrar'} um item no estoque.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const prodData: any = {
                  id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
                  name: formData.get('name') as string,
                  sku: formData.get('sku') as string,
                  price: Number(formData.get('price')),
                  stock: Number(formData.get('stock')),
                  min: Number(formData.get('min')),
                  cat: formData.get('cat') as string,
                };

                if (editingProduct) {
                  setAllProducts(prev => prev.map(p => p.id === editingProduct.id ? prodData : p));
                  toast.success('Produto atualizado');
                } else {
                  setAllProducts(prev => [...prev, prodData]);
                  toast.success('Produto cadastrado');
                }
                setIsProductModalOpen(false);
                setEditingProduct(null);
                setProductImage(null);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Imagem do Produto</Label>
                      <div 
                        className="border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-2 bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer relative overflow-hidden group"
                        onClick={() => document.getElementById('product-image-upload')?.click()}
                      >
                        {productImage || editingProduct?.image ? (
                          <>
                            <img src={productImage || editingProduct?.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                            <p className="text-xs text-muted-foreground">Clique para fazer upload</p>
                          </>
                        )}
                        <input 
                          id="product-image-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setProductImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prod-name">Nome do Produto</Label>
                      <Input id="prod-name" name="name" defaultValue={editingProduct?.name} placeholder="Ex: Tela iPhone 14" required />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prod-sku">SKU / Código</Label>
                        <Input id="prod-sku" name="sku" defaultValue={editingProduct?.sku} placeholder="IPH-14-TEL" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prod-cat">Categoria</Label>
                        <Select name="cat" defaultValue={editingProduct?.cat || 'Peças'}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor de Custo (R$)</Label>
                        <Input type="number" step="0.01" placeholder="0,00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor de Frete (R$)</Label>
                        <Input type="number" step="0.01" placeholder="0,00" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prod-price">Preço de Venda (R$)</Label>
                      <Input id="prod-price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} placeholder="0,00" className="font-bold text-primary" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prod-stock">Qtd Atual</Label>
                        <Input id="prod-stock" name="stock" type="number" defaultValue={editingProduct?.stock || 0} placeholder="0" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prod-min">Qtd Mínima</Label>
                        <Input id="prod-min" name="min" type="number" defaultValue={editingProduct?.min || 5} placeholder="5" required />
                      </div>
                    </div>

                    {fiscalEnabled && (
                      <div className="pt-4 border-t mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                         <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                           <ShieldCheck className="w-3 h-3" /> Dados Fiscais (NFC-e)
                         </h4>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">NCM</Label>
                             <Input name="ncm" placeholder="Ex: 8517.13.00" className="h-8 text-xs" />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">CEST</Label>
                             <Input name="cest" placeholder="Ex: 21.053.01" className="h-8 text-xs" />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <Label className="text-xs">Origem da Mercadoria</Label>
                           <Select name="origin" defaultValue="0">
                             <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="0">0 - Nacional</SelectItem>
                               <SelectItem value="1">1 - Estrangeira - Direta</SelectItem>
                               <SelectItem value="2">2 - Estrangeira - Interna</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                    setProductImage(null);
                  }}>Cancelar</Button>
                  <Button type="submit">Salvar Produto</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-none shadow-lg text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-80">Valor Total em Estoque</p>
                <h3 className="text-3xl font-black mt-1">R$ 45.200,00</h3>
                <div className="flex items-center gap-2 mt-4 bg-white/20 px-3 py-1 rounded-full w-fit">
                   <TrendingUp className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase">Saúde: Excelente</span>
                </div>
                <p className="text-[10px] text-white/70 mt-3 leading-tight">
                  Valor total investido em mercadorias disponíveis para venda.
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <StatCard 
          title="Giro de Estoque" 
          value="4.2x / mês" 
          icon={RefreshCw} 
          color="bg-blue-600" 
          description="Velocidade com que o estoque é renovado. Ideal entre 3x e 6x." 
        />
        
        <StatCard 
          title="Itens Críticos" 
          value={lowStockProducts.length.toString()} 
          icon={AlertCircle} 
          trend={-15} 
          color="bg-rose-500" 
          description="Produtos abaixo da quantidade mínima de segurança." 
        />

        <StatCard 
          title="Produtos Ativos" 
          value={products.length.toString()} 
          icon={Package} 
          color="bg-indigo-600" 
          description="Total de SKUs diferentes cadastrados no sistema." 
        />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="lista">Lista de Produtos</TabsTrigger>
          <TabsTrigger value="inventario">Inventário Geral</TabsTrigger>
          <TabsTrigger value="mais-vendidos">Mais Vendidos</TabsTrigger>
          <TabsTrigger value="rma">Gestão de RMA</TabsTrigger>
        </TabsList>

        <TabsContent value="rma" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <div className="p-4 border-b flex justify-between items-center bg-secondary/10">
              <div>
                <h3 className="text-lg font-bold">Processos de Garantia (RMA)</h3>
                <p className="text-xs text-muted-foreground">Monitore o envio e retorno de peças defeituosas aos fornecedores.</p>
              </div>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Novo RMA</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Produto</th>
                    <th className="px-6 py-3">Fornecedor</th>
                    <th className="px-6 py-3">Motivo</th>
                    <th className="px-6 py-3">Data Envio</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {rmaHistory.map((rma) => (
                    <tr key={rma.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold">{rma.product}</p>
                        <p className="text-[10px] text-muted-foreground">{rma.sku}</p>
                      </td>
                      <td className="px-6 py-4">{rma.supplier}</td>
                      <td className="px-6 py-4 text-xs italic">{rma.reason}</td>
                      <td className="px-6 py-4 text-xs font-mono">{rma.date}</td>
                      <td className="px-6 py-4">
                        <Badge variant={rma.status === 'Concluído' ? 'success' : 'warning'}>
                          {rma.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {rmaHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                        Nenhum registro de RMA encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mais-vendidos" className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold tracking-tight">Produtos Mais Vendidos</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={bestSellersPeriod} onValueChange={setBestSellersPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="15d">Últimos 15 Dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 Dias</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="ano">Este Ano</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {bestSellersPeriod === 'personalizado' && (
                <div className="flex items-center gap-2">
                  <Input type="date" className="h-9 w-36 text-xs" />
                  <span className="text-muted-foreground">até</span>
                  <Input type="date" className="h-9 w-36 text-xs" />
                </div>
              )}
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Relatório
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Pos.</th>
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4 text-center">Qtd. Vendas</th>
                    <th className="px-6 py-4 text-right">Faturamento</th>
                    <th className="px-6 py-4 text-right">Lucro Total</th>
                    <th className="px-6 py-4 text-center">% Lucro</th>
                    <th className="px-6 py-4 text-center">Desempenho</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {bestSellers.slice(0, bestSellersDisplayCount).map((p, idx) => {
                    const profit = p.value - p.cost;
                    const profitPercentage = p.value > 0 ? (profit / p.value) * 100 : 0;
                    
                    return (
                      <tr key={p.id} className="group hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 font-black text-muted-foreground/30 italic">{idx + 1}º</td>
                        <td className="px-6 py-4 font-bold">{p.name}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[10px] font-medium">{p.cat}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 text-primary font-bold">
                            {p.totalSales}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                          R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold">
                            {profitPercentage.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${(p.totalSales / bestSellers[0].totalSales) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {Math.round((p.totalSales / bestSellers[0].totalSales) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {bestSellersDisplayCount < bestSellers.length && (
              <div className="p-4 bg-secondary/5 border-t text-center">
                <Button 
                  variant="ghost" 
                  className="text-primary hover:text-primary-foreground hover:bg-primary gap-2"
                  onClick={() => setBestSellersDisplayCount(prev => prev + 10)}
                >
                  <Plus className="w-4 h-4" /> Ver Mais Resultados
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

          <TabsContent value="lista" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <div className="p-4 border-b flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar produto por nome ou SKU..." 
                  className="pl-9" 
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={stockFilterCategory} onValueChange={setStockFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span>{stockFilterCategory === 'todas' ? 'Todas Categorias' : stockFilterCategory}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas Categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="hidden md:flex gap-2" onClick={() => {
                  setStockSearch('');
                  setStockFilterCategory('todas');
                }}>
                  Limpar
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Produto</th>
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3">Preço Venda</th>
                    <th className="px-6 py-3">Estoque</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStockProducts.length > 0 ? filteredStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-xs font-mono">{p.sku}</td>
                      <td className="px-6 py-4">{p.cat}</td>
                      <td className="px-6 py-4 font-semibold">R$ {p.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", p.stock <= p.min ? "text-rose-500" : "text-emerald-500")}>
                            {p.stock}
                          </span>
                          <span className="text-xs text-muted-foreground">/ min {p.min}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={p.stock <= p.min ? 'destructive' : 'success'}>
                          {p.stock <= p.min ? 'Reposição' : 'OK'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="inventario" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total de Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground mt-1">Potencial de faturamento em estoque</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Giro de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4x</div>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% este mês</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Acuracidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground mt-1">Baseado na última contagem</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Relatório de Inventário</CardTitle>
                <CardDescription>Posição detalhada de todos os itens em estoque.</CardDescription>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => toast.success('Exportando inventário...')}>
                <FileDown className="w-4 h-4" /> Exportar Inventário
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-3">Item</th>
                      <th className="px-6 py-3">Custo Médio</th>
                      <th className="px-6 py-3">Preço Venda</th>
                      <th className="px-6 py-3">Qtd</th>
                      <th className="px-6 py-3">Valor Total</th>
                      <th className="px-6 py-3">Última Mov.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">R$ {(p.price * 0.6).toFixed(2)}</td>
                        <td className="px-6 py-4">R$ {p.price.toFixed(2)}</td>
                        <td className="px-6 py-4 font-bold">{p.stock}</td>
                        <td className="px-6 py-4 font-black">R$ {(p.price * p.stock).toFixed(2)}</td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">14/04/2026</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const AVAILABLE_ICONS = [
  { name: 'Tag', icon: Tag },
  { name: 'Loja', icon: ShoppingCart },
  { name: 'Recibo', icon: Receipt },
  { name: 'Cifrão', icon: DollarSign },
  { name: 'Pacote', icon: Package },
  { name: 'Prédio', icon: Building2 },
  { name: 'Globo', icon: Globe },
  { name: 'Usuários', icon: Users },
  { name: 'Documento', icon: FileText },
  { name: 'Ferramenta', icon: Wrench },
  { name: 'Escudo', icon: ShieldCheck },
  { name: 'Caminhão', icon: Truck },
  { name: 'Cartão', icon: CreditCard },
  { name: 'Carteira', icon: Wallet },
  { name: 'Dinheiro', icon: Banknote },
  { name: 'Gráfico Subindo', icon: TrendingUp },
  { name: 'Gráfico Descendo', icon: TrendingDown },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Monitor', icon: Monitor },
  { name: 'Casa', icon: Home },
  { name: 'Café', icon: Coffee },
  { name: 'Presente', icon: Gift },
  { name: 'Maleta', icon: Briefcase },
  { name: 'Ideia', icon: Lightbulb },
  { name: 'Comida', icon: Utensils },
  { name: 'Carro', icon: Car }
];

function FinanceView({ 
  transactions, 
  setTransactions 
}: { 
  transactions: any[], 
  setTransactions: React.Dispatch<React.SetStateAction<any[]>> 
}) {
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [expenseType, setExpenseType] = useState<'avulsa' | 'fixa'>('avulsa');
  
  const [newExpCatName, setNewExpCatName] = useState('');
  const [newExpCatIcon, setNewExpCatIcon] = useState<any>(Tag);
  const [newIncCatName, setNewIncCatName] = useState('');
  const [newIncCatIcon, setNewIncCatIcon] = useState<any>(Tag);

  const [expenseCategories, setExpenseCategories] = useState([
    { id: '1', name: 'Estoque', icon: Package },
    { id: '2', name: 'Infraestrutura', icon: Building2 },
    { id: '3', name: 'Marketing', icon: Globe },
    { id: '4', name: 'Pessoal', icon: Users },
    { id: '5', name: 'Impostos e Taxas', icon: FileText },
  ]);

  const [incomeCategories, setIncomeCategories] = useState([
    { id: '1', name: 'Vendas de Produtos', icon: ShoppingCart },
    { id: '2', name: 'Serviços', icon: Wrench },
    { id: '3', name: 'Contratos', icon: ShieldCheck },
  ]);

  const payable = [
    { id: '1', desc: 'Fornecedor de Peças ABC', val: 1500.00, due: '20/04/2026', status: 'Pendente' },
    { id: '2', desc: 'Energia Elétrica', val: 350.00, due: '18/04/2026', status: 'Atrasado' },
    { id: '3', desc: 'Internet Fibra', val: 120.00, due: '25/04/2026', status: 'Pendente' },
  ];

  const receivable = [
    { id: '1', desc: 'OS-2024-015 - Reparo Notebook', val: 450.00, due: '17/04/2026', status: 'Pendente', customer: 'Carlos Eduardo' },
    { id: '2', desc: 'Venda Acessórios - Maria', val: 180.00, due: '16/04/2026', status: 'Pendente', customer: 'Maria Souza' },
  ];

  const fixedExpenses = [
    { id: '1', desc: 'Aluguel', val: 2500.00, dueDay: 10, category: 'Infraestrutura' },
    { id: '2', desc: 'Internet', val: 120.00, dueDay: 15, category: 'Infraestrutura' },
    { id: '3', desc: 'Energia', val: 350.00, dueDay: 20, category: 'Infraestrutura' },
    { id: '4', desc: 'Salário Técnico', val: 3200.00, dueDay: 5, category: 'Pessoal' },
  ];

  // Cálculos de Saúde Financeira
  const totalCash = 8450; 
  const totalReceivable = receivable.reduce((acc, curr) => acc + curr.val, 0);
  const totalPayable = payable.reduce((acc, curr) => acc + curr.val, 0);
  const stockValue = 45200; 

  const currentAssets = totalCash + totalReceivable + stockValue;
  const currentLiabilities = totalPayable;
  const workingCapital = currentAssets - currentLiabilities;
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Gestão de fluxo de caixa, contas a pagar e receber.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-2">
                <Plus className="w-4 h-4" /> Despesa
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nova Despesa</DialogTitle>
                <DialogDescription>Registre uma nova saída de caixa (Avulsa ou Fixa).</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Despesa</Label>
                  <Select value={expenseType} onValueChange={(v: any) => setExpenseType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avulsa">Avulsa (Única)</SelectItem>
                      <SelectItem value="fixa">Fixa (Recorrente Mensal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input placeholder={expenseType === 'fixa' ? "Ex: Aluguel da Loja" : "Ex: Compra de ferramentas"} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input type="number" placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>{expenseType === 'fixa' ? "Dia do Vencimento" : "Data do Pagamento"}</Label>
                    {expenseType === 'fixa' ? (
                      <Input type="number" min="1" max="31" placeholder="Ex: 10" />
                    ) : (
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estoque">Estoque</SelectItem>
                      <SelectItem value="infra">Infraestrutura</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                      <SelectItem value="impostos">Impostos e Taxas</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {expenseType === 'fixa' && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-xs text-amber-700 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Esta despesa será repetida automaticamente todos os meses no dia informado.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancelar</Button>
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => {
                  toast.success(expenseType === 'fixa' ? 'Despesa fixa cadastrada!' : 'Despesa registrada!');
                  setIsExpenseModalOpen(false);
                }}>Salvar {expenseType === 'fixa' ? 'Despesa Fixa' : 'Despesa'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isIncomeModalOpen} onOpenChange={setIsIncomeModalOpen}>
            <DialogTrigger render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="w-4 h-4" /> Receita
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Receita</DialogTitle>
                <DialogDescription>Registre uma nova entrada de caixa.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input placeholder="Ex: Venda de serviço avulso" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input type="number" placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendas">Vendas de Produtos</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsIncomeModalOpen(false)}>Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  toast.success('Receita registrada com sucesso!');
                  setIsIncomeModalOpen(false);
                }}>Salvar Receita</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Saldo Atual" value="R$ 8.450,00" icon={DollarSign} color="bg-blue-600" />
        <StatCard title="A Receber" value="R$ 3.200,00" icon={ChevronRight} color="bg-emerald-500" />
        <StatCard title="A Pagar" value="R$ 1.850,00" icon={X} color="bg-rose-500" />
        <StatCard title="Custos Fixos" value="R$ 6.170,00" icon={Clock} color="bg-amber-600" />
      </div>

      <Tabs defaultValue="fluxo" className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-[900px]">
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="fixas">Despesas Fixas</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="saude">Saúde Financeira</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>
        <TabsContent value="fluxo" className="mt-6">
          <Card className="border-none shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">{t.date}</td>
                      <td className="px-6 py-4 font-medium">{t.desc}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={t.status === 'Pago' ? 'success' : 'warning'}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className={cn(
                        "px-6 py-4 text-right font-bold",
                        t.type === 'IN' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {t.type === 'IN' ? '+' : ''} R$ {Math.abs(t.val).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pagar" className="mt-6">
          <Card className="border-none shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Vencimento</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payable.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground font-mono">{p.due}</td>
                      <td className="px-6 py-4 font-medium">{p.desc}</td>
                      <td className="px-6 py-4">
                        <Badge variant={p.status === 'Atrasado' ? 'destructive' : 'warning'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600">
                        R$ {p.val.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline" className="h-8 text-xs">Pagar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="receber" className="mt-6">
          <Card className="border-none shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Vencimento</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3 Status">Status</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {receivable.map((r) => (
                    <tr key={r.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground font-mono">{r.due}</td>
                      <td className="px-6 py-4 font-medium">{r.customer}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{r.desc}</td>
                      <td className="px-6 py-4">
                        <Badge variant="warning">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        R$ {r.val.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline" className="h-8 text-xs">Receber</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fixas" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Despesas Fixas Mensais</h3>
              <p className="text-sm text-muted-foreground">Custos recorrentes que ocorrem todos os meses.</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setIsExpenseModalOpen(true)}>
              <Plus className="w-4 h-4" /> Nova Despesa Fixa
            </Button>
          </div>

          <Card className="border-none shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Dia Venc.</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3 text-right">Valor Mensal</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fixedExpenses.map((f) => (
                    <tr key={f.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-mono">Todo dia {f.dueDay}</td>
                      <td className="px-6 py-4 font-medium">{f.desc}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px]">{f.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600">
                        R$ {f.val.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary"><Edit className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-secondary/10 font-bold">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right">Total Mensal Fixo:</td>
                    <td className="px-6 py-4 text-right text-rose-600">
                      R$ {fixedExpenses.reduce((acc, curr) => acc + curr.val, 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Categorias de Despesas</CardTitle>
                <CardDescription>Gerencie as classificações para suas saídas de caixa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="icon" className="shrink-0 bg-secondary/20">
                        {React.createElement(newExpCatIcon, { className: "w-4 h-4 text-rose-500" })}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="grid grid-cols-6 gap-1 p-2 w-[240px] max-h-[300px] overflow-y-auto" align="start">
                      {AVAILABLE_ICONS.map((item, idx) => (
                        <DropdownMenuItem 
                          key={idx} 
                          className="flex items-center justify-center p-2 cursor-pointer hover:bg-rose-50 rounded-md transition-colors"
                          onClick={() => setNewExpCatIcon(item.icon)}
                        >
                          {React.createElement(item.icon, { className: "w-5 h-5 text-rose-500" })}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input 
                    placeholder="Nova categoria de despesa..." 
                    className="flex-1" 
                    value={newExpCatName}
                    onChange={(e) => setNewExpCatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newExpCatName) {
                        setExpenseCategories([...expenseCategories, { id: Math.random().toString(), name: newExpCatName, icon: newExpCatIcon }]);
                        setNewExpCatName('');
                        setNewExpCatIcon(Tag);
                        toast.success('Categoria de despesa adicionada');
                      }
                    }}
                  />
                  <Button size="sm" onClick={() => {
                    if (newExpCatName) {
                      setExpenseCategories([...expenseCategories, { id: Math.random().toString(), name: newExpCatName, icon: newExpCatIcon }]);
                      setNewExpCatName('');
                      setNewExpCatIcon(Tag);
                      toast.success('Categoria de despesa adicionada');
                    }
                  }}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <div className="space-y-2">
                  {expenseCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border">
                      <div className="flex items-center gap-3">
                        <cat.icon className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => {
                        setExpenseCategories(expenseCategories.filter(c => c.id !== cat.id));
                        toast.error('Categoria removida');
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Categorias de Receitas</CardTitle>
                <CardDescription>Gerencie as classificações para suas entradas de caixa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="icon" className="shrink-0 bg-secondary/20">
                        {React.createElement(newIncCatIcon, { className: "w-4 h-4 text-emerald-500" })}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="grid grid-cols-6 gap-1 p-2 w-[240px] max-h-[300px] overflow-y-auto" align="start">
                      {AVAILABLE_ICONS.map((item, idx) => (
                        <DropdownMenuItem 
                          key={idx} 
                          className="flex items-center justify-center p-2 cursor-pointer hover:bg-emerald-50 rounded-md transition-colors"
                          onClick={() => setNewIncCatIcon(item.icon)}
                        >
                          {React.createElement(item.icon, { className: "w-5 h-5 text-emerald-500" })}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input 
                    placeholder="Nova categoria de receita..." 
                    className="flex-1" 
                    value={newIncCatName}
                    onChange={(e) => setNewIncCatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newIncCatName) {
                        setIncomeCategories([...incomeCategories, { id: Math.random().toString(), name: newIncCatName, icon: newIncCatIcon }]);
                        setNewIncCatName('');
                        setNewIncCatIcon(Tag);
                        toast.success('Categoria de receita adicionada');
                      }
                    }}
                  />
                  <Button size="sm" onClick={() => {
                    if (newIncCatName) {
                      setIncomeCategories([...incomeCategories, { id: Math.random().toString(), name: newIncCatName, icon: newIncCatIcon }]);
                      setNewIncCatName('');
                      setNewIncCatIcon(Tag);
                      toast.success('Categoria de receita adicionada');
                    }
                  }}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <div className="space-y-2">
                  {incomeCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border">
                      <div className="flex items-center gap-3">
                        <cat.icon className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => {
                        setIncomeCategories(incomeCategories.filter(c => c.id !== cat.id));
                        toast.error('Categoria removida');
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saude" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Ativo Circulante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-indigo-900">R$ {currentAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-[10px] text-indigo-600/70 mt-1">Disponibilidades + Recebíveis + Estoque</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-rose-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Passivo Circulante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-rose-900">R$ {currentLiabilities.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-[10px] text-rose-600/70 mt-1">Contas a pagar no curto prazo</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Capital de Giro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-900">R$ {workingCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-[10px] text-emerald-600/70 mt-1">Recursos para sustento da operação</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Liquidez Corrente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-amber-900">{currentRatio.toFixed(2)}</div>
                <p className="text-[10px] text-amber-600/70 mt-1">Capacidade de pagamento imediata</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="border-none shadow-sm">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Análise de Saúde Financeira
                 </CardTitle>
                 <CardDescription>O que estes números significam para sua empresa.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">Capital de Giro</h4>
                    <p className="text-sm text-muted-foreground">
                      Sua empresa possui <strong>R$ {workingCapital.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> disponíveis para financiar as operações do dia-a-dia 
                      sem depender de empréstimos externos. Isso indica uma saúde financeira {workingCapital > 0 ? 'estável' : 'que requer atenção'}.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">Liquidez Corrente</h4>
                    <p className="text-sm text-muted-foreground">
                      Para cada R$ 1,00 que sua empresa deve, ela possui <strong>R$ {currentRatio.toFixed(2)}</strong> em ativos para pagar. 
                      {currentRatio > 1.5 ? ' Este é um índice excelente, garantindo fôlego para honrar compromissos.' : currentRatio > 1 ? ' O índice está positivo, indicando que a empresa consegue pagar suas dívidas.' : ' O índice está crítico, sugerindo dificuldades para honrar compromissos imediatos.'}
                    </p>
                  </div>
               </CardContent>
             </Card>

             <Card className="border-none shadow-sm">
               <CardHeader>
                 <CardTitle className="text-lg">Dicionário de Termos</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">1</div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Ativo Circulante</h4>
                      <p className="text-xs text-muted-foreground">Conjunto de tudo que é "dinheiro" ou vira dinheiro rápido (caixa, bancos, estoque, produtos).</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">2</div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Passivo Circulante</h4>
                      <p className="text-xs text-muted-foreground">Obrigações e contas a pagar no curto prazo.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">3</div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Capital de Giro</h4>
                      <p className="text-xs text-muted-foreground">Diferença entre Ativo e Passivo Circulante. É a reserva de segurança da empresa.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold">4</div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Liquidez Corrente</h4>
                      <p className="text-xs text-muted-foreground">Índice que mostra se a empresa consegue pagar todas as dívidas usando apenas o que tem no Ativo Circulante.</p>
                    </div>
                  </div>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm hover:ring-1 ring-primary/20 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">Extrato de Vendas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Relatório detalhado de todas as vendas de produtos e serviços por período.</p>
                <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileDown className="w-4 h-4" /> Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:ring-1 ring-primary/20 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">Transações por Chegada</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Histórico cronológico de todas as entradas e saídas do caixa.</p>
                <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileDown className="w-4 h-4" /> Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:ring-1 ring-primary/20 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">Serviços e OS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Relatório de produtividade técnica e serviços concluídos.</p>
                <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileDown className="w-4 h-4" /> Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Últimas Transações Detalhadas</CardTitle>
              <CardDescription>Visualização completa de vendas e serviços por ordem de chegada.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-3">Data/Hora</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Descrição</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Forma Pagto</th>
                      <th className="px-6 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { date: '15/04/2026 14:30', type: 'Venda', desc: 'Tela iPhone 13 + Película', client: 'João Silva', method: 'PIX', val: 885.00 },
                      { date: '15/04/2026 11:20', type: 'Serviço', desc: 'Reparo Placa Mãe OS-001', client: 'Maria Oliveira', method: 'Cartão', val: 450.00 },
                      { date: '14/04/2026 16:45', type: 'Venda', desc: 'Cabo HDMI 2m', client: 'Consumidor Final', method: 'Dinheiro', val: 45.00 },
                      { date: '14/04/2026 09:15', type: 'Serviço', desc: 'Limpeza Preventiva OS-002', client: 'Pedro Santos', method: 'PIX', val: 120.00 },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 text-xs text-muted-foreground font-mono">{row.date}</td>
                        <td className="px-6 py-4">
                          <Badge variant={row.type === 'Venda' ? 'default' : 'secondary'} className="text-[9px] uppercase">
                            {row.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium">{row.desc}</td>
                        <td className="px-6 py-4 text-muted-foreground">{row.client}</td>
                        <td className="px-6 py-4 text-xs">{row.method}</td>
                        <td className="px-6 py-4 text-right font-black text-primary">R$ {row.val.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KanbanView({ 
  onViewOS, 
  allOrders, 
  setAllOrders 
}: { 
  onViewOS: (id: string) => void, 
  allOrders: ServiceOrder[], 
  setAllOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>> 
}) {
  const [kanbanSearch, setKanbanSearch] = useState('');
  const [isNewCardOpen, setIsNewCardOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'todos' | 'Baixa' | 'Média' | 'Alta' | 'Urgente'>('todos');
  
  const columns = STATUS_COLUMNS.slice(0, 10); // Show all status columns
  const DraggableComponent = Draggable as any;

  const filteredOrders = allOrders.filter(os => {
    const matchesSearch = 
      os.customerName.toLowerCase().includes(kanbanSearch.toLowerCase()) ||
      os.equipment.toLowerCase().includes(kanbanSearch.toLowerCase()) ||
      os.number.toLowerCase().includes(kanbanSearch.toLowerCase());
    
    const matchesPriority = priorityFilter === 'todos' || os.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  const lateOrders = filteredOrders.filter(os => {
    const now = new Date();
    if (os.status === 'Finalizada' || os.status === 'Entregue' || os.status === 'Cancelada') return false;
    
    const deadline = os.completionDeadline || os.diagnosisDeadline;
    if (deadline && new Date(deadline) < now) return true;
    return false;
  });

  const lateCount = lateOrders.length;
  const onTimeCount = filteredOrders.length - lateCount;

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setAllOrders(prev => {
      const newOrders = [...prev];
      const orderIndex = newOrders.findIndex((o: ServiceOrder) => o.id === draggableId);
      
      if (orderIndex !== -1) {
        const order = { ...newOrders[orderIndex] };
        order.status = destination.droppableId as OSStatus;
        newOrders[orderIndex] = order;
        toast.success(`OS ${order.number} movida para ${order.status}`);
      }
      return newOrders;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quadro Kanban</h1>
          <p className="text-muted-foreground">Visualize e gerencie o fluxo de trabalho técnico em tempo real.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-4 px-4 py-2 bg-secondary/50 rounded-lg border">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Em Dia</span>
              <span className="text-sm font-black text-emerald-600">{onTimeCount}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Atrasados</span>
              <span className="text-sm font-black text-rose-600">{lateCount}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar no Kanban..." 
                className="pl-9 w-full sm:w-64" 
                value={kanbanSearch}
                onChange={(e) => setKanbanSearch(e.target.value)}
              />
            </div>
            <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  <span>{priorityFilter === 'todos' ? 'Prioridade' : priorityFilter}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2" onClick={() => setIsNewCardOpen(true)}>
              <Plus className="w-4 h-4" /> Novo Card
            </Button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px] scrollbar-hide">
          {columns.map((status) => {
            const columnOrders = filteredOrders.filter(os => os.status === status);
            const columnTotal = columnOrders.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex flex-col w-80 shrink-0 gap-4 rounded-xl transition-colors p-3",
                      snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-secondary/30"
                    )}
                  >
                    <div className="flex flex-col gap-2 px-1 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">{status}</h3>
                          <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 font-bold">
                            {columnOrders.length}
                          </Badge>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary" onClick={() => setIsNewCardOpen(true)} />
                      </div>
                      <div className="flex items-center justify-between bg-white/50 px-2 py-1 rounded-md border border-black/5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Subtotal da Coluna:</span>
                        <span className="text-xs font-black text-emerald-600">R$ {columnTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      {columnOrders.map((os, index) => (
                        <DraggableComponent key={os.id} draggableId={os.id} index={index}>
                        {(draggableProvided: any, draggableSnapshot: any) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            onClick={() => onViewOS(os.id)}
                            className={cn(
                              "p-4 rounded-lg shadow-sm border transition-all cursor-pointer",
                              (() => {
                                switch (os.status) {
                                  case 'Aberta': return 'bg-blue-50/80';
                                  case 'Em análise': return 'bg-purple-50/80';
                                  case 'Aguardando aprovação': return 'bg-yellow-50/80';
                                  case 'Aguardando peça': return 'bg-orange-50/80';
                                  case 'Em reparo': return 'bg-indigo-50/80';
                                  case 'Testes finais': return 'bg-cyan-50/80';
                                  case 'Pronta': return 'bg-emerald-50/80';
                                  case 'Entregue': return 'bg-slate-50/80';
                                  case 'Finalizada': return 'bg-green-50/80';
                                  case 'Cancelada': return 'bg-rose-50/80';
                                  default: return 'bg-white';
                                }
                              })(),
                              draggableSnapshot.isDragging ? "shadow-xl ring-2 ring-primary/20 border-primary" : "border-transparent hover:border-primary/20"
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{os.number}</span>
                                {os.subStatus && (
                                  <span className="text-[9px] px-1 py-0.5 bg-black/5 rounded text-primary font-medium border border-primary/10 w-fit">
                                    {os.subStatus}
                                  </span>
                                )}
                              </div>
                              <Badge variant={os.priority === 'Alta' ? 'destructive' : 'secondary'} className="text-[10px] px-1 py-0">
                                {os.priority}
                              </Badge>
                            </div>
                            <h4 className="text-sm font-bold mb-1">{os.equipment}</h4>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{os.defect}</p>
                            
                            <div className="space-y-1.5 mb-3 bg-white/40 p-2 rounded-md border border-black/5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground">Valor Total:</span>
                                <span className="font-bold text-emerald-600">R$ {os.value.toFixed(2)}</span>
                              </div>
                              {os.diagnosisDeadline && (
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-muted-foreground">Prazo Diagnóstico:</span>
                                  <span className={cn(
                                    "font-medium",
                                    new Date(os.diagnosisDeadline) < new Date() ? "text-rose-500" : "text-foreground"
                                  )}>
                                    {format(new Date(os.diagnosisDeadline), 'dd/MM HH:mm')}
                                  </span>
                                </div>
                              )}
                              {os.completionDeadline && (
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-muted-foreground">Prazo Conclusão:</span>
                                  <span className={cn(
                                    "font-medium",
                                    new Date(os.completionDeadline) < new Date() ? "text-rose-500" : "text-foreground"
                                  )}>
                                    {format(new Date(os.completionDeadline), 'dd/MM HH:mm')}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-black/5">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                                  {os.customerName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-[9px] font-medium truncate max-w-[100px]">{os.customerName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span className="text-[9px]">
                                  {differenceInDays(new Date(), new Date(os.createdAt))}d
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </DraggableComponent>
                    ))}
                    {provided.placeholder}
                    
                    {columnOrders.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg border-muted-foreground/10">
                        <p className="text-xs text-muted-foreground">Arraste aqui</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {isNewCardOpen && (
        <Dialog open={isNewCardOpen} onOpenChange={setIsNewCardOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Novo Card no Kanban</DialogTitle>
              <DialogDescription>
                Inicie uma nova Ordem de Serviço diretamente pelo quadro.
              </DialogDescription>
            </DialogHeader>
            <div className="py-8">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl bg-secondary/10">
                <Plus className="w-12 h-12 text-primary/40 mb-4" />
                <p className="text-sm text-center text-muted-foreground font-medium max-w-xs mb-6">
                  O formulário de criação de OS é centralizado. Use o botão principal "NOVA OS" no painel lateral ou mude para a visualização de lista para cadastrar.
                </p>
                <Button className="w-full" onClick={() => setIsNewCardOpen(false)}>Entendido</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function UserManagementView({ 
  users, 
  setUsers 
}: { 
  users: User[], 
  setUsers: React.Dispatch<React.SetStateAction<User[]>> 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleDeleteUser = (id: string) => {
    if (confirm('Deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Usuário removido com sucesso');
    }
  };

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData: any = {
      id: editingUser?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as any,
      privilege: formData.get('privilege') as any,
      companyId: '1'
    };

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? userData : u));
      toast.success('Usuário atualizado');
    } else {
      setUsers(prev => [...prev, userData]);
      toast.success('Usuário cadastrado');
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipe</h1>
          <p className="text-muted-foreground">Gerencie funcionários, técnicos e seus níveis de acesso.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingUser(null);
        }}>
          <DialogTrigger render={
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Usuário</Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
              <DialogDescription>Defina os dados e privilégios de acesso do colaborador.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" defaultValue={editingUser?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" defaultValue={editingUser?.email} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Conta</Label>
                  <Select name="role" defaultValue={editingUser?.role || 'USUARIO'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN-USER">Administrador</SelectItem>
                      <SelectItem value="USUARIO">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privilege">Privilégios</Label>
                  <Select name="privilege" defaultValue={editingUser?.privilege || 'Profissional'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completo">Completo (Admin)</SelectItem>
                      <SelectItem value="Profissional">Profissional (Técnico)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Colaboradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4 text-center">Privilégios</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'ADMIN-USER' ? 'default' : 'secondary'}>
                      {u.role === 'ADMIN-USER' ? 'Administrador' : 'Colaborador'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className={cn(
                      "font-black uppercase text-[10px]",
                      u.privilege === 'Completo' ? "border-indigo-500 text-indigo-500" : "border-emerald-500 text-emerald-500"
                    )}>
                      {u.privilege}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => {
                        setEditingUser(u);
                        setIsModalOpen(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function POSView({ 
  fiscalEnabled, 
  salesHistory, 
  setSalesHistory, 
  allProducts, 
  setAllProducts, 
  setFinanceTransactions,
  rmaHistory,
  setRmaHistory,
  globalCustomers,
  setGlobalCustomers
}: { 
  fiscalEnabled: boolean, 
  salesHistory: any[], 
  setSalesHistory: React.Dispatch<React.SetStateAction<any[]>>, 
  allProducts: any[], 
  setAllProducts: React.Dispatch<React.SetStateAction<any[]>>, 
  setFinanceTransactions: React.Dispatch<React.SetStateAction<any[]>>,
  rmaHistory: any[],
  setRmaHistory: React.Dispatch<React.SetStateAction<any[]>>,
  globalCustomers: any[],
  setGlobalCustomers: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const [cart, setCart] = useState<{ id: string, name: string, price: number, quantity: number, sku: string }[]>([]);
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payments, setPayments] = useState<{ method: string, amount: number }[]>([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<'Dinheiro' | 'Cartão' | 'PIX' | 'Boleto' | 'Transferência' | null>(null);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [saleType, setSaleType] = useState<'Venda' | 'Pedido' | 'Orçamento'>('Venda');
  const [emitFiscalNote, setEmitFiscalNote] = useState(false);
  const [posTab, setPosTab] = useState<'Venda' | 'Extrato'>('Venda');

  // Fiscal Data Modal
  const [isFiscalDataModalOpen, setIsFiscalDataModalOpen] = useState(false);
  const [fiscalData, setFiscalData] = useState<any>({});
  
  // Filters for Sales History
  const [saleFilterCustomer, setSaleFilterCustomer] = useState('');
  const [saleFilterDate, setSaleFilterDate] = useState('');

  const handleReturn = (saleId: string, itemSku: string) => {
    const sale = salesHistory.find(s => s.id === saleId);
    if (!sale) return;

    toast.info('Processando devolução...');
    
    // 1. Stock Propagation: Incrementar estoque de volta
    setAllProducts(prev => prev.map(p => {
      if (p.sku === itemSku) {
        return { ...p, stock: p.stock + 1 };
      }
      return p;
    }));
    toast.success(`Estoque: Item ${itemSku} retornado.`);
    
    // 2. Finance Propagation: Registrar estorno (saída)
    setFinanceTransactions(prev => [
      { 
        id: Math.random().toString(36).substr(2, 9), 
        desc: `Estorno Venda #${saleId}`, 
        val: -sale.total, 
        type: 'OUT', 
        date: format(new Date(), 'dd/MM/yyyy'), 
        status: 'Pago', 
        category: 'Vendas de Produtos' 
      },
      ...prev
    ]);
    toast.success('Financeiro: Estorno registrado.');
    
    // 3. Status Update
    setSalesHistory(prev => prev.map(s => s.id === saleId ? { ...s, status: 'Devolvida' } : s));
    toast.success('Venda marcada como DEVOLVIDA.');
  };

  const handleRMA = (saleId: string, itemSku: string) => {
    const sale = salesHistory.find(s => s.id === saleId);
    if (!sale) return;

    toast.info(`Iniciando RMA para ${itemSku}...`);
    
    // Propagate to RMA History
    setRmaHistory(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        product: sale.items.find((i: any) => i.sku === itemSku)?.name || 'Produto desconhecido',
        sku: itemSku,
        reason: 'Solicitado via Pós-Venda PDV',
        supplier: 'A definir',
        status: 'Pendente',
        date: format(new Date(), 'dd/MM/yyyy')
      },
      ...prev
    ]);

    setSalesHistory(prev => prev.map(s => s.id === saleId ? { ...s, status: 'RMA em trânsito' } : s));
    
    toast.success('Processo de RMA iniciado. Verifique o módulo Estoque > RMA.');
  };

  // Cash Register (Caixa)
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false);
  const [initialCashBalance, setInitialCashBalance] = useState(0);
  const [cashHistory, setCashHistory] = useState<{type: string, amount: number, time: Date, note?: string}[]>([]);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'Sangria' | 'Reforço'>('Sangria');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementNote, setMovementNote] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  const filteredCustomers = customerSearch ? globalCustomers.filter(c => 
    fuzzyMatch(c.name, customerSearch) || (c.doc && fuzzyMatch(c.doc, customerSearch))
  ) : [];

  const products = [
    { id: '1', name: 'Tela iPhone 13 Original', sku: 'TEL-IP13-ORG', price: 850.00 },
    { id: '2', name: 'Bateria Samsung S22', sku: 'BAT-S22-PREM', price: 120.00 },
    { id: '3', name: 'Cabo HDMI 2.0 2m', sku: 'CAB-HDMI-2M', price: 45.00 },
    { id: '4', name: 'Conector de Carga Moto G60', sku: 'CON-G60', price: 25.00 },
    { id: '5', name: 'Película de Vidro 3D', sku: 'PEL-3D-GEN', price: 35.00 },
    { id: '6', name: 'Capa Anti-Impacto Transparente', sku: 'CAP-TR-GEN', price: 40.00 },
  ];

  const filteredProducts = products.filter(p => 
    fuzzyMatch(p.name, search) || 
    fuzzyMatch(p.sku, search)
  );

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setSearch('');
    toast.success(`${product.name} adicionado`);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);
  const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingAmount = Math.max(0, total - paidAmount);
  
  const cashReceived = payments.filter(p => p.method === 'Dinheiro').reduce((acc, p) => acc + p.amount, 0);
  // Change is calculated based on "Dinheiro" method if total paid (including change) > total
  // For split payments, usually we don't have change unless it's the last payment in cash
  const change = remainingAmount === 0 && receivedAmount ? Math.max(0, Number(receivedAmount) - (total - (paidAmount - Number(receivedAmount)))) : 0;

  const currentCashInDrawer = initialCashBalance + 
    cashHistory.reduce((acc, curr) => acc + (curr.type === 'Reforço' || curr.type === 'Venda' ? curr.amount : -curr.amount), 0);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setCart([]);
        setDiscount(0);
        setReceivedAmount('');
        setPayments([]);
        setCurrentPaymentMethod(null);
        toast.info('Nova venda iniciada');
      }
      if (e.key === 'F4') {
        e.preventDefault();
        document.getElementById('pos-search')?.focus();
      }
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) {
          if (saleType === 'Venda') finishSale('Fiscal');
          else finishSale();
        } else toast.warning('Carrinho vazio');
      }
      if (e.key === 'F9') {
        e.preventDefault();
        if (confirm('Deseja cancelar a venda atual?')) {
          setCart([]);
          toast.error('Venda cancelada');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const finishSale = (emissionType: 'Fiscal' | 'NaoFiscal' | 'A4' | 'Standard' = 'Standard') => {
    if (saleType !== 'Orçamento' && remainingAmount > 0) {
      toast.error('O valor total não foi atingido');
      return;
    }

    const customerName = selectedCustomer ? selectedCustomer.name : 'Consumidor Final';

    // Fiscal Validation if NFC-e is active (EmissionType is Fiscal)
    if (emissionType === 'Fiscal' && saleType !== 'Orçamento') {
      const requiredFields = ['doc', 'street', 'number', 'neighborhood', 'city', 'state', 'zip'];
      const missing = selectedCustomer ? requiredFields.filter(f => !selectedCustomer[f]) : [];
      
      // If no customer is selected and it's fiscal, we usually need at least a CPF if it's above certain value, 
      // but let's assume we need a full customer for fiscal emission in this app's context or prompt to create one.
      if (!selectedCustomer || missing.length > 0) {
        setFiscalData(selectedCustomer || { name: 'Consumidor Final' });
        setIsFiscalDataModalOpen(true);
        toast.warning('Dados fiscais incompletos. Por favor, preencha os campos obrigatórios.');
        return;
      }
    }

    executeFinishSale(emissionType);
  };

  const executeFinishSale = (emissionType: 'Fiscal' | 'NaoFiscal' | 'A4' | 'Standard' = 'Standard') => {
    const customerName = selectedCustomer ? selectedCustomer.name : 'Consumidor Final';
    
    if (saleType !== 'Orçamento') {
      const cashTotal = payments.filter(p => p.method === 'Dinheiro').reduce((acc, p) => acc + p.amount, 0);
      if (cashTotal > 0) {
        setCashHistory(prev => [...prev, { type: 'Venda', amount: cashTotal, time: new Date(), note: `Venda para ${customerName}` }]);
      }
      
      // 1. Stock Propagation
      setAllProducts(prev => prev.map(p => {
        const cartItem = cart.find(item => item.sku === p.sku);
        return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.quantity) } : p;
      }));

      // 2. Finance Propagation
      setFinanceTransactions(prev => [
        { 
          id: Math.random().toString(36).substr(2, 9), 
          desc: `PDV: ${saleType} - ${customerName}`, 
          val: total, 
          type: 'IN', 
          date: format(new Date(), 'dd/MM/yyyy'), 
          status: 'Pago', 
          category: 'Vendas de Produtos' 
        },
        ...prev
      ]);
      
      // Save to sales history
      const newSale = {
        id: Math.random().toString(36).substr(2, 9),
        customer: customerName,
        items: [...cart],
        total: total,
        date: new Date().toISOString(),
        type: saleType,
        status: 'Finalizada',
        fiscalEmitted: emissionType === 'Fiscal',
        emissionType: emissionType
      };
      setSalesHistory(prev => [newSale, ...prev]);

      if (emissionType === 'Fiscal') {
        toast.success(`NFC-e emitida com sucesso para ${customerName}!`);
      } else if (emissionType === 'NaoFiscal') {
        toast.success(`Cupom não fiscal impresso para ${customerName}!`);
      } else if (emissionType === 'A4') {
        toast.success(`Documento A4 não fiscal gerado para ${customerName}!`);
      }
      
      toast.success(`${saleType} para ${customerName} finalizada com sucesso!`);
    } else {
      toast.success(`Orçamento para ${customerName} salvo com sucesso!`);
    }

    setCart([]);
    setDiscount(0);
    setReceivedAmount('');
    setPayments([]);
    setCurrentPaymentMethod(null);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setIsPaymentModalOpen(false);
    setEmitFiscalNote(false);
  };

  const addPayment = (method: string, amount: number) => {
    if (amount <= 0) return;
    setPayments([...payments, { method, amount }]);
    setReceivedAmount('');
    setCurrentPaymentMethod(null);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleMovement = () => {
    const amount = Number(movementAmount);
    if (amount <= 0) return;
    setCashHistory(prev => [...prev, { type: movementType, amount, time: new Date(), note: movementNote }]);
    toast.success(`${movementType} de R$ ${amount.toFixed(2)} registrado`);
    setMovementAmount('');
    setMovementNote('');
    setIsMovementModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-secondary/10 rounded-xl overflow-hidden border shadow-sm relative">
      {!isCashRegisterOpen && (
        <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-md flex items-center justify-center p-6">
          <Card className="max-w-md w-full shadow-2xl border-2">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black">Abertura de Caixa</CardTitle>
              <CardDescription>Informe o saldo inicial para começar as vendas do dia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Saldo Inicial (Fundo de Maneio)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-9 h-12 text-lg font-bold" 
                    id="initial-balance-input"
                  />
                </div>
              </div>
              <Button 
                className="w-full h-12 text-lg font-bold" 
                onClick={() => {
                  const val = Number((document.getElementById('initial-balance-input') as HTMLInputElement).value);
                  setInitialCashBalance(val);
                  setIsCashRegisterOpen(true);
                  toast.success(`Caixa aberto com R$ ${val.toFixed(2)}`);
                }}
              >
                ABRIR CAIXA
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* POS Header */}
      <div className="bg-primary p-4 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-none">PDV Profissional</h2>
              <p className="text-xs text-white/70 mt-1">Operador: Admin Principal</p>
            </div>
          </div>

          {/* Customer Search */}
          <div className="relative w-72 flex items-center gap-2">
            <div className="relative flex-1">
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-1.5 border border-white/20 focus-within:bg-white/20 transition-colors">
                <UserIcon className="w-4 h-4 text-white/70 mr-2" />
                <input 
                  placeholder="Cliente (ou Consumidor Final)" 
                  className="bg-transparent border-none text-sm text-white placeholder:text-white/50 focus:outline-none w-full"
                  value={selectedCustomer ? selectedCustomer.name : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    if (selectedCustomer) setSelectedCustomer(null);
                  }}
                />
                {selectedCustomer && (
                  <button onClick={() => setSelectedCustomer(null)} className="ml-1">
                    <X className="w-3 h-3 text-white/70 hover:text-white" />
                  </button>
                )}
              </div>
              {customerSearch && !selectedCustomer && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto text-foreground">
                  {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                    <div 
                      key={c.id} 
                      className="p-2 hover:bg-primary/5 cursor-pointer text-sm border-b last:border-0"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch('');
                      }}
                    >
                      {c.name}
                    </div>
                  )) : (
                    <div className="p-4 flex flex-col items-center gap-2">
                      <p className="p-2 text-xs text-muted-foreground italic">Nenhum cliente encontrado</p>
                      <Button size="sm" variant="outline" className="w-full text-[10px] h-8 gap-2" onClick={() => setIsNewCustomerModalOpen(true)}>
                        <Plus className="w-3 h-3" /> CADASTRAR "{customerSearch}"
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button size="icon" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 h-9 w-9 shrink-0" onClick={() => setIsNewCustomerModalOpen(true)}>
               <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex bg-white/10 rounded-lg p-1 ml-4 border border-white/20">
            <button 
              onClick={() => setPosTab('Venda')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                posTab === 'Venda' ? "bg-white text-primary shadow-sm" : "text-white/70 hover:text-white"
              )}
            >
              VENDA
            </button>
            <button 
              onClick={() => setPosTab('Extrato')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                posTab === 'Extrato' ? "bg-white text-primary shadow-sm" : "text-white/70 hover:text-white"
              )}
            >
              EXTRATO / DEVOLUÇÃO
            </button>
          </div>
        </div>
        <div className="text-right flex items-center gap-6">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
            <p className="text-[10px] text-white/70 uppercase font-black">Saldo em Caixa</p>
            <p className="text-lg font-bold">R$ {currentCashInDrawer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-white/70 uppercase font-bold tracking-widest">Total da Venda</p>
            <p className="text-4xl font-black">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {posTab === 'Venda' ? (
          <>
            {/* Left Side: Cart and Search */}
            <div className="flex-1 flex flex-col bg-white border-r overflow-hidden">
          <div className="p-4 border-b bg-secondary/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                id="pos-search"
                placeholder="Pesquisar Produto ou SKU (F4)..." 
                className="pl-10 h-12 text-lg font-medium border-2 focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-2xl max-h-[400px] overflow-y-auto">
                  {filteredProducts.length > 0 ? filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      className="p-4 hover:bg-primary/5 cursor-pointer flex justify-between items-center border-b last:border-0 transition-colors"
                      onClick={() => addToCart(p)}
                    >
                      <div>
                        <p className="font-bold text-lg">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono uppercase">{p.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-xl">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-muted-foreground">Clique para adicionar</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-muted-foreground">
                      Nenhum produto encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 bg-secondary/30 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Item</th>
                    <th className="px-6 py-3 text-center w-32">Qtd</th>
                    <th className="px-6 py-3 text-right w-32">Unitário</th>
                    <th className="px-6 py-3 text-right w-32">Subtotal</th>
                    <th className="px-6 py-3 text-center w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cart.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/5 group transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-base">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground font-medium">
                        R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-lg">
                        R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                  <ShoppingCart className="w-12 h-12 opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Carrinho Vazio</h3>
                <p className="max-w-xs mt-2">Use a busca acima ou o atalho F4 para adicionar produtos à venda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Summary and Actions */}
        <div className="w-[400px] bg-secondary/5 flex flex-col shrink-0 border-l overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Receipt className="w-3 h-3" /> Resumo da Venda
              </h3>
              <div className="space-y-3 bg-white p-4 rounded-2xl border shadow-sm">
                <div className="flex p-1 bg-secondary/20 rounded-lg gap-1">
                  <Button 
                    variant={saleType === 'Venda' ? 'default' : 'ghost'} 
                    className={cn("flex-1 text-[10px] h-8 font-black rounded-md", saleType === 'Venda' && "shadow-sm")}
                    onClick={() => setSaleType('Venda')}
                  >
                    VENDA
                  </Button>
                  <Button 
                    variant={saleType === 'Pedido' ? 'default' : 'ghost'} 
                    className={cn("flex-1 text-[10px] h-8 font-black rounded-md", saleType === 'Pedido' && "shadow-sm")}
                    onClick={() => setSaleType('Pedido')}
                  >
                    PEDIDO
                  </Button>
                  <Button 
                    variant={saleType === 'Orçamento' ? 'default' : 'ghost'} 
                    className={cn("flex-1 text-[10px] h-8 font-black rounded-md", saleType === 'Orçamento' && "shadow-sm")}
                    onClick={() => setSaleType('Orçamento')}
                  >
                    ORÇAM.
                  </Button>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Itens:</span>
                  <span className="font-bold">{cart.reduce((acc, i) => acc + i.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-bold">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase font-black">Desconto (R$)</Label>
                  <Input 
                    type="number" 
                    className="h-9 text-right font-bold text-rose-600 bg-secondary/10"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
                <div className="pt-2 border-t flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Total Líquido</span>
                  <span className="text-2xl font-black text-primary">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Payment Section - Inline */}
            {saleType !== 'Orçamento' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pagamento</h3>
                  {remainingAmount > 0 ? (
                    <Badge variant="destructive" className="text-[9px] animate-pulse">Faltam R$ {remainingAmount.toFixed(2)}</Badge>
                  ) : (
                    <Badge variant="success" className="text-[9px]">Pago R$ {paidAmount.toFixed(2)}</Badge>
                  )}
                </div>

                {remainingAmount > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-1.5">
                      {(['Dinheiro', 'Cartão', 'PIX', 'Boleto', 'Transferência'] as const).map((method) => (
                        <Button
                          key={method}
                          variant={currentPaymentMethod === method ? 'default' : 'outline'}
                          className={cn(
                            "h-14 flex-col gap-1 p-1 px-0.5",
                            currentPaymentMethod === method ? "border-primary bg-primary text-white" : "hover:border-primary/50 text-[9px]"
                          )}
                          onClick={() => {
                            setCurrentPaymentMethod(method);
                            setReceivedAmount(remainingAmount.toString());
                          }}
                        >
                          {method === 'Dinheiro' && <Banknote className="w-4 h-4" />}
                          {method === 'Cartão' && <CreditCard className="w-4 h-4" />}
                          {method === 'PIX' && <QrCode className="w-4 h-4" />}
                          {method === 'Boleto' && <FileText className="w-4 h-4" />}
                          {method === 'Transferência' && <RefreshCw className="w-4 h-4" />}
                          <span className="text-[8px] uppercase truncate">{method === 'Transferência' ? 'TRANSF.' : method}</span>
                        </Button>
                      ))}
                    </div>

                    {currentPaymentMethod && (
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-3 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center h-4">
                          <span className="text-[10px] font-black text-primary uppercase">{currentPaymentMethod}</span>
                          <button onClick={() => setCurrentPaymentMethod(null)} className="text-[9px] text-muted-foreground hover:text-primary">Cancelar</button>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input 
                              type="number" 
                              className="h-9 pl-6 text-sm font-bold" 
                              value={receivedAmount}
                              onChange={(e) => setReceivedAmount(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <Button 
                            className="h-9 font-black text-[10px] px-3 shrink-0"
                            onClick={() => addPayment(currentPaymentMethod, Number(receivedAmount))}
                          >
                            CONFIRMAR
                          </Button>
                        </div>
                        {currentPaymentMethod === 'Dinheiro' && Number(receivedAmount) > remainingAmount && (
                          <div className="text-[10px] font-bold text-emerald-600 flex justify-between">
                            <span>Troco:</span>
                            <span>R$ {(Number(receivedAmount) - remainingAmount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {payments.length > 0 && (
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                    {payments.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white border rounded-xl shadow-sm group">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-primary border">
                            {p.method === 'Dinheiro' && <Banknote className="w-3.5 h-3.5" />}
                            {p.method === 'Cartão' && <CreditCard className="w-3.5 h-3.5" />}
                            {p.method === 'PIX' && <QrCode className="w-3.5 h-3.5" />}
                            {p.method === 'Boleto' && <FileText className="w-3.5 h-3.5" />}
                            {p.method === 'Transferência' && <RefreshCw className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-bold text-[10px]">{p.method}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-primary text-[11px]">R$ {p.amount.toFixed(2)}</span>
                          <button onClick={() => removePayment(idx)} className="text-rose-500 hover:scale-110 transition-transform">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 border-t">
              {saleType === 'Venda' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="h-14 font-black flex-col gap-1 rounded-2xl border-2 hover:bg-blue-50 hover:border-blue-200"
                      onClick={() => finishSale('A4')}
                      disabled={cart.length === 0 || remainingAmount > 0}
                    >
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-[9px]">A4 NÃO FISCAL</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14 font-black flex-col gap-1 rounded-2xl border-2 hover:bg-emerald-50 hover:border-emerald-200"
                      onClick={() => finishSale('NaoFiscal')}
                      disabled={cart.length === 0 || remainingAmount > 0}
                    >
                      <Receipt className="w-5 h-5 text-emerald-500" />
                      <span className="text-[9px]">CUPOM NÃO FISCAL</span>
                    </Button>
                  </div>
                  <Button 
                    className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-lg gap-2 rounded-2xl shadow-primary/20"
                    onClick={() => finishSale('Fiscal')}
                    disabled={cart.length === 0 || remainingAmount > 0}
                  >
                    <ShieldCheck className="w-6 h-6" /> EMITIR CUPOM FISCAL
                  </Button>
                </div>
              ) : (
                <Button 
                  className={cn(
                    "w-full h-16 text-xl font-black gap-3 shadow-lg rounded-2xl", 
                    saleType === 'Orçamento' ? "bg-orange-600 hover:bg-orange-700 shadow-orange-600/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                  )}
                  disabled={cart.length === 0 || (saleType === 'Pedido' && remainingAmount > 0)}
                  onClick={() => finishSale()}
                >
                  <Check className="w-6 h-6" />
                  {saleType === 'Pedido' ? 'SALVAR PEDIDO' : 'SALVAR ORÇAMENTO'}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="h-10 font-bold gap-2 text-xs"
                  onClick={() => {
                    setCart([]);
                    setDiscount(0);
                    setPayments([]);
                    setReceivedAmount('');
                    setCurrentPaymentMethod(null);
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                    toast.info('Nova venda iniciada');
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> NOVO (F2)
                </Button>
                <Button 
                  variant="outline" 
                  className="h-10 font-bold gap-2 text-xs text-rose-500 hover:bg-rose-50"
                  onClick={() => {
                    if (confirm('Cancelar venda?')) {
                      setCart([]);
                      setPayments([]);
                      setSelectedCustomer(null);
                    }
                  }}
                >
                  <X className="w-3.5 h-3.5" /> CANCELAR (F9)
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" className="h-9 text-[10px] font-black gap-2" onClick={() => {
                  setMovementType('Sangria');
                  setIsMovementModalOpen(true);
                }}>
                  <TrendingDown className="w-4 h-4" /> SANGRIA
                </Button>
                <Button variant="secondary" className="h-9 text-[10px] font-black gap-2" onClick={() => {
                  setMovementType('Reforço');
                  setIsMovementModalOpen(true);
                }}>
                  <TrendingUp className="w-4 h-4" /> REFORÇO
                </Button>
              </div>
              <Button variant="destructive" className="h-10 font-black gap-2 w-full mt-2 rounded-xl" onClick={() => setIsClosingModalOpen(true)}>
                <LogOut className="w-4 h-4" /> FECHAR CAIXA
              </Button>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <Keyboard className="w-3 h-3" /> Atalhos Rápidos
              </h4>
              <div className="grid grid-cols-2 gap-y-2 text-[9px]">
                <div className="flex items-center gap-2"><Badge variant="secondary" className="h-4 px-1 font-mono text-[8px]">F2</Badge> <span>Nova Venda</span></div>
                <div className="flex items-center gap-2"><Badge variant="secondary" className="h-4 px-1 font-mono text-[8px]">F4</Badge> <span>Buscar Item</span></div>
                <div className="flex items-center gap-2"><Badge variant="secondary" className="h-4 px-1 font-mono text-[8px]">F8</Badge> <span>Finalizar</span></div>
                <div className="flex items-center gap-2"><Badge variant="secondary" className="h-4 px-1 font-mono text-[8px]">F9</Badge> <span>Cancelar</span></div>
              </div>
            </div>
          </div>
        </div>
        </>
        ) : (
          <div className="flex-1 bg-white flex flex-col overflow-hidden text-left">
            <div className="p-4 border-b bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold">Extrato de Vendas / Devoluções</h3>
                <p className="text-xs text-muted-foreground">Gerencie vendas passadas, estornos e garantias.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Filtrar Cliente..." 
                    className="h-9 transition-all text-xs pl-8 w-40 focus:w-60" 
                    value={saleFilterCustomer}
                    onChange={(e) => setSaleFilterCustomer(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="h-9 transition-all text-xs pl-8 w-40" 
                    value={saleFilterDate}
                    onChange={(e) => setSaleFilterDate(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => {
                  setSaleFilterCustomer('');
                  setSaleFilterDate('');
                }}>
                  Limpar
                </Button>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <FileDown className="w-4 h-4" /> Exportar
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {salesHistory.filter(sale => {
                const matchesCustomer = fuzzyMatch(sale.customer, saleFilterCustomer);
                const matchesDate = !saleFilterDate || sale.date.startsWith(saleFilterDate);
                return matchesCustomer && matchesDate;
              }).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/30 text-[10px] uppercase font-bold text-muted-foreground sticky top-0">
                      <tr>
                        <th className="px-6 py-3">Data / Hora</th>
                        <th className="px-6 py-3">Cliente</th>
                        <th className="px-6 py-3">Itens</th>
                        <th className="px-6 py-3 text-right">Total</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-left">
                      {salesHistory
                        .filter(sale => {
                          const matchesCustomer = fuzzyMatch(sale.customer, saleFilterCustomer);
                          const matchesDate = !saleFilterDate || sale.date.startsWith(saleFilterDate);
                          return matchesCustomer && matchesDate;
                        })
                        .map((sale) => (
                        <tr key={sale.id} className="hover:bg-secondary/5 transition-colors group">
                          <td className="px-6 py-4 font-mono text-xs">
                            {format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4 font-bold">{sale.customer}</td>
                          <td className="px-6 py-4 text-left">
                            <div className="space-y-0.5">
                              {sale.items.map((item: any, idx: number) => (
                                <p key={idx} className="text-[11px] text-muted-foreground">
                                  {item.quantity}x {item.name}
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-primary">
                            R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={
                              sale.status === 'Devolvida' ? 'destructive' : 
                              sale.status === 'Finalizada' ? 'success' : 'warning'
                            }>
                              {sale.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {sale.status === 'Finalizada' && (
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <Button variant="outline" size="sm" className="h-8 gap-2">
                                      <RefreshCw className="w-3 h-3" /> Gerenciar
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Ações de Pós-Venda</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-rose-600 focus:text-rose-600 cursor-pointer text-left"
                                      onClick={() => handleReturn(sale.id, sale.items[0].sku)}
                                    >
                                      <RefreshCw className="w-4 h-4 mr-2" /> Devolução Total
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="cursor-pointer text-left"
                                      onClick={() => handleRMA(sale.id, sale.items[0].sku)}
                                    >
                                      <ShieldCheck className="w-4 h-4 mr-2" /> Abrir RMA (Garantia)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer text-left" onClick={() => toast.success('Cupom enviado para impressora...')}>
                                      <Printer className="w-4 h-4 mr-2" /> Reimprimir Cupom
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer text-left" onClick={() => {
                                      const itemsList = sale.items.map((i: any) => `${i.quantity}x ${i.name}`).join('\n');
                                      alert(`Detalhes da Venda #${sale.id}\nData: ${format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}\nCliente: ${sale.customer}\n\nItens:\n${itemsList}\n\nTotal: R$ ${sale.total.toFixed(2)}`);
                                    }}>
                                      <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                            {sale.status === 'Devolvida' && (
                               <span className="text-[10px] text-rose-500 font-bold uppercase italic">Processada em {format(new Date(), 'dd/MM')}</span>
                            )}
                            {sale.status.includes('RMA') && (
                               <span className="text-[10px] text-amber-500 font-bold uppercase italic">{sale.status}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                   <History className="w-12 h-12 opacity-10 mb-4" />
                   <p>Nenhuma venda encontrada no histórico.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Handled via Effects */}

      {/* Fiscal Data Completion Modal */}
      <Dialog open={isFiscalDataModalOpen} onOpenChange={setIsFiscalDataModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-primary p-6 text-white flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                Dados para NFC-e
              </DialogTitle>
              <DialogDescription className="text-white/70 font-medium">
                Complete as informações obrigatórias para emitir a nota fiscal.
              </DialogDescription>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="font-bold">CPF / CNPJ</Label>
                <Input 
                  placeholder="000.000.000-00" 
                  value={fiscalData.doc || ''} 
                  onChange={(e) => setFiscalData({...fiscalData, doc: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="font-bold">CEP</Label>
                <Input 
                  placeholder="00000-000" 
                  value={fiscalData.zip || ''} 
                  onChange={(e) => setFiscalData({...fiscalData, zip: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="font-bold">Logradouro (Rua/Av)</Label>
                <Input 
                  placeholder="Rua..." 
                  value={fiscalData.street || ''} 
                  onChange={(e) => setFiscalData({...fiscalData, street: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="font-bold">Número</Label>
                <Input 
                  placeholder="123" 
                  value={fiscalData.number || ''} 
                  onChange={(e) => setFiscalData({...fiscalData, number: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="font-bold">Bairro</Label>
                <Input 
                  placeholder="Bairro..." 
                  value={fiscalData.neighborhood || ''} 
                  onChange={(e) => setFiscalData({...fiscalData, neighborhood: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-1 sm:col-span-1">
                <Label className="font-bold">Cidade</Label>
                <Input 
                  placeholder="Cidade" 
                  value={fiscalData.city || ''} 
                  onChange={(e) => setFiscalData({...fiscalData, city: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-1 sm:col-span-1">
                <Label className="font-bold">Estado (UF)</Label>
                <Input 
                  placeholder="SP" 
                  value={fiscalData.state || ''} 
                  onChange={(e) => setFiscalData({...fiscalData, state: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Ao salvar, os dados serão atualizados permanentemente no cadastro do cliente <strong>{fiscalData.name}</strong> para emissões futuras.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="flex-1 h-12 font-bold" onClick={() => setIsFiscalDataModalOpen(false)}>VOLTAR</Button>
              <Button 
                className="flex-1 h-12 font-black bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  // Update global customers
                  setGlobalCustomers(prev => prev.map(c => 
                    c.id === fiscalData.id ? { ...c, ...fiscalData } : c
                  ));
                  // Update selected customer locally if it was selected
                  if (selectedCustomer && selectedCustomer.id === fiscalData.id) {
                    setSelectedCustomer({...selectedCustomer, ...fiscalData});
                  }
                  setIsFiscalDataModalOpen(false);
                  toast.success('Dados salvos. Prosseguindo com a venda...');
                  // Small delay to allow state to settle
                  setTimeout(() => executeFinishSale('Fiscal'), 300);
                }}
              >
                SALVAR E EMITIR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Customer Quick Modal in PDV */}
      <Dialog open={isNewCustomerModalOpen} onOpenChange={setIsNewCustomerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastro Rápido de Cliente</DialogTitle>
            <DialogDescription>Cadastre o cliente sem sair da tela de venda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome / Razão Social</Label>
              <Input placeholder="Nome completo" value={customerSearch} />
            </div>
            <div className="space-y-2">
              <Label>Celular / WhatsApp</Label>
              <Input placeholder="(00) 00000-0000" />
            </div>
            <Button className="w-full h-12 font-black" onClick={() => {
              setSelectedCustomer({ id: 'temp', name: customerSearch });
              setCustomerSearch('');
              setIsNewCustomerModalOpen(false);
              toast.success('Cliente selecionado para a venda');
            }}>
              CADASTRAR E SELECIONAR
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Movement Modal */}
      <Dialog open={isMovementModalOpen} onOpenChange={setIsMovementModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{movementType} de Caixa</DialogTitle>
            <DialogDescription>Retire ou adicione valores manualmente ao caixa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor do(a) {movementType}</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={movementAmount}
                onChange={(e) => setMovementAmount(e.target.value)}
                className="h-12 text-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label>Observação (Opcional)</Label>
              <Input 
                placeholder="Ex: Pagamento de correio, Troco..." 
                value={movementNote}
                onChange={(e) => setMovementNote(e.target.value)}
              />
            </div>
            <Button className="w-full h-12 text-lg font-bold" onClick={handleMovement}>
              CONFIRMAR {movementType.toUpperCase()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Closing Modal */}
      <Dialog open={isClosingModalOpen} onOpenChange={setIsClosingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fechamento de Caixa</DialogTitle>
            <DialogDescription>Confira os valores antes de encerrar o turno.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/20 rounded-lg border">
                <p className="text-[10px] text-muted-foreground uppercase font-black">Fundo Inicial</p>
                <p className="text-lg font-bold">R$ {initialCashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-[10px] text-emerald-600 uppercase font-black">Vendas (Dinheiro)</p>
                <p className="text-lg font-bold text-emerald-700">R$ {cashHistory.filter(h => h.type === 'Venda').reduce((acc, c) => acc + c.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                <p className="text-[10px] text-rose-600 uppercase font-black">Sangrias</p>
                <p className="text-lg font-bold text-rose-700">R$ {cashHistory.filter(h => h.type === 'Sangria').reduce((acc, c) => acc + c.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] text-blue-600 uppercase font-black">Reforços</p>
                <p className="text-lg font-bold text-blue-700">R$ {cashHistory.filter(h => h.type === 'Reforço').reduce((acc, c) => acc + c.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-xl border-2 border-primary/20 text-center">
              <p className="text-sm text-primary font-bold uppercase tracking-widest">Saldo Final Esperado</p>
              <p className="text-4xl font-black text-primary">R$ {currentCashInDrawer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Valor em Espécie no Caixa para Conferência</Label>
                <Input type="number" placeholder="0.00" className="h-12 text-xl font-bold" />
              </div>
              <Button 
                variant="destructive" 
                className="w-full h-12 text-lg font-black"
                onClick={() => {
                  setIsCashRegisterOpen(false);
                  setIsClosingModalOpen(false);
                  setCashHistory([]);
                  setInitialCashBalance(0);
                  toast.success('Caixa fechado com sucesso!');
                }}
              >
                CONFIRMAR E FECHAR CAIXA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function SettingsView({ 
  user, 
  companyLogo, 
  setCompanyLogo,
  customSubStatuses,
  setCustomSubStatuses,
  osSortOrder,
  setOsSortOrder,
  equipmentTypes,
  setEquipmentTypes,
  teamUsers,
  setTeamUsers,
  company,
  setCompany
}: { 
  user: User, 
  companyLogo: string | null, 
  setCompanyLogo: (logo: string | null) => void,
  customSubStatuses: Record<string, string[]>,
  setCustomSubStatuses: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
  osSortOrder: 'number' | 'date' | 'priority',
  setOsSortOrder: (order: 'number' | 'date' | 'priority') => void,
  equipmentTypes: EquipmentType[],
  setEquipmentTypes: React.Dispatch<React.SetStateAction<EquipmentType[]>>,
  teamUsers: User[],
  setTeamUsers: React.Dispatch<React.SetStateAction<User[]>>,
  company: Company,
  setCompany: React.Dispatch<React.SetStateAction<Company>>
}) {
  const isSaaS = user.role === 'ADMIN-SAAS';
  const isAdminUser = user.role === 'ADMIN-USER' || isSaaS;

  const [newSubStatus, setNewSubStatus] = useState('');
  const [selectedMainStatus, setSelectedMainStatus] = useState<string>(STATUS_COLUMNS[0]);

  const [wsConfig, setWsConfig] = useState({
    instanceName: '',
    serverUrl: '',
    apiKey: ''
  });

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  useEffect(() => {
    fetch(`/api/whatsapp/config?companyId=${user.companyId || 'default'}`)
      .then(res => res.json())
      .then(data => setWsConfig(data))
      .catch(err => console.error('Erro ao buscar config WhatsApp:', err));
  }, [user.companyId]);

  const saveWsConfig = async () => {
    try {
      await axios.post('/api/whatsapp/config', { ...wsConfig, companyId: user.companyId || 'default' });
      toast.success('Configuração do WhatsApp salva!');
    } catch (err) {
      toast.error('Erro ao salvar configuração.');
    }
  };

  const generateQr = async () => {
    setIsGeneratingQr(true);
    try {
      const response = await axios.get(`/api/whatsapp/connect?companyId=${user.companyId || 'default'}`);
      setQrCode(response.data.base64);
      toast.success('QR Code gerado!');
    } catch (err) {
      toast.error('Erro ao gerar QR Code.');
    } finally {
      setIsGeneratingQr(false);
    }
  };
  const addSubStatus = () => {
    if (!newSubStatus.trim()) return;
    
    setCustomSubStatuses(prev => {
      const current = prev[selectedMainStatus] || [];
      if (current.includes(newSubStatus)) {
        toast.error('Este sub-status já existe para este status.');
        return prev;
      }
      return {
        ...prev,
        [selectedMainStatus]: [...current, newSubStatus.trim()]
      };
    });
    setNewSubStatus('');
    toast.success('Sub-status adicionado!');
  };

  const removeSubStatus = (mainStatus: string, sub: string) => {
    setCustomSubStatuses(prev => {
      const filtered = prev[mainStatus].filter(s => s !== sub);
      const newMap = { ...prev };
      if (filtered.length === 0) {
        delete newMap[mainStatus];
      } else {
        newMap[mainStatus] = filtered;
      }
      return newMap;
    });
    toast.success('Sub-status removido!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
        toast.success('Logotipo atualizado com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          {isSaaS ? 'Gerencie as preferências globais do sistema SaaS.' : 'Gerencie as preferências do sistema e dados da empresa.'}
        </p>
      </div>

      <Tabs defaultValue={isSaaS ? "geral" : "empresa"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-[1000px]">
          {isSaaS ? (
            <>
              <TabsTrigger value="geral">Configurações Gerais</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança e API</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
              <TabsTrigger value="config-sistema">Config. Sistema</TabsTrigger>
              <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
              {isAdminUser && <TabsTrigger value="substatus">Sub-status</TabsTrigger>}
              <TabsTrigger value="whatsapp-config">API WhatsApp</TabsTrigger>
              <TabsTrigger value="usuarios">Usuários</TabsTrigger>
              <TabsTrigger value="import-export">Importar/Exportar</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="config-sistema" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>Configure como o sistema deve se comportar para sua empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-secondary/50">
                  <div className="space-y-1">
                    <Label className="text-base font-bold">Classificação das O.S.</Label>
                    <p className="text-xs text-muted-foreground italic">Defina a ordem padrão de exibição na lista de Ordens de Serviço.</p>
                  </div>
                  <Select value={osSortOrder} onValueChange={(v: any) => setOsSortOrder(v)}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Por Número da O.S.</SelectItem>
                      <SelectItem value="date">Por Data do Diagnóstico</SelectItem>
                      <SelectItem value="priority">Por Prioridade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => toast.success('Preferências salvas com sucesso!')}>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isSaaS ? (
          <>
            <TabsContent value="geral" className="mt-6 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>Parâmetros globais para todos os tenants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Sistema</Label>
                      <Input defaultValue="TechManager SaaS" />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Base</Label>
                      <Input defaultValue="https://app.techmanager.com" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => toast.success('Configurações globais salvas!')}>Salvar Alterações</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="seguranca" className="mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Segurança e Chaves de API</CardTitle>
                  <CardDescription>Gerencie tokens de acesso e integrações externas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-dashed border-muted-foreground/20">
                    <p className="text-sm text-muted-foreground italic">Módulo de segurança avançada em desenvolvimento.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="empresa" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Informações do Emitente</CardTitle>
              <CardDescription>Estes dados aparecerão nos documentos impressos e PDFs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Logotipo da Empresa</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-secondary/20">
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground opacity-20" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="logo-upload" 
                        onChange={handleLogoUpload}
                      />
                      <Button variant="outline" size="sm">
                        <label htmlFor="logo-upload" className="cursor-pointer flex items-center">
                          <Upload className="w-4 h-4 mr-2" /> Fazer Upload
                        </label>
                      </Button>
                      {companyLogo && (
                        <Button variant="ghost" size="sm" className="text-rose-500 block" onClick={() => setCompanyLogo(null)}>
                          Remover
                        </Button>
                      )}
                      <p className="text-[10px] text-muted-foreground">PNG ou JPG, máx 2MB.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nome Fantasia</Label>
                  <Input 
                    value={company.name} 
                    onChange={(e) => setCompany({...company, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input 
                    value={company.razaoSocial || 'TechManager Soluções Tecnológicas LTDA'} 
                    onChange={(e) => setCompany({...company, razaoSocial: e.target.value} as any)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input 
                    value={company.cnpj} 
                    onChange={(e) => setCompany({...company, cnpj: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inscrição Estadual</Label>
                  <Input 
                    value={company.ie || 'ISENTO'} 
                    onChange={(e) => setCompany({...company, ie: e.target.value} as any)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Contato</Label>
                  <Input 
                    value={company.email} 
                    onChange={(e) => setCompany({...company, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={company.phone} 
                    onChange={(e) => setCompany({...company, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço Completo</Label>
                <Input 
                  value={company.address} 
                  onChange={(e) => setCompany({...company, address: e.target.value})}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Configurações de Impressão</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Impressora de Etiquetas</Label>
                    <Input 
                      placeholder="Ex: Zebra, Brother..." 
                      value={company.labelPrinterName || ''} 
                      onChange={(e) => setCompany({...company, labelPrinterName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Impressora A4 / Padrão</Label>
                    <Input 
                      placeholder="Ex: HP LaserJet, Epson..." 
                      value={company.a4PrinterName || ''} 
                      onChange={(e) => setCompany({...company, a4PrinterName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Cópias de O.S. por Folha</Label>
                    <Select 
                      value={company.osCopiesPerPage?.toString()} 
                      onValueChange={(v) => setCompany({...company, osCopiesPerPage: Number(v) as 1 | 2})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Cópia por Folha</SelectItem>
                        <SelectItem value="2">2 Cópias por Folha (Mesma Página)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground italic">Selecione 2 cópias para imprimir via A4 com separação para o cliente e a loja.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => toast.success('Configurações salvas!')}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Personalização de Documentos</CardTitle>
              <CardDescription>Configure o logotipo e termos de garantia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Termos de Garantia Padrão</Label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="A garantia cobre defeitos de fabricação por um período de 90 dias a partir da data de entrega..."
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline">Visualizar Modelo de OS</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config-sistema" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Ajustes de Operação</CardTitle>
              <CardDescription>Configure os comportamentos padrão do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold">Notificações Automáticas</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                    <div>
                      <p className="text-sm font-medium">Enviar WhatsApp na Abertura</p>
                      <p className="text-xs text-muted-foreground">Notifica o cliente assim que a OS é criada.</p>
                    </div>
                    <Button variant="outline" size="sm">Ativado</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                    <div>
                      <p className="text-sm font-medium">Notificar Orçamento Pronto</p>
                      <p className="text-xs text-muted-foreground">Envia link do orçamento quando o status mudar.</p>
                    </div>
                    <Button variant="outline" size="sm">Ativado</Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => toast.success('Configurações de sistema salvas!')}>Salvar Ajustes</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Formas de Pagamento</CardTitle>
              <CardDescription>Cadastre as opções aceitas na sua assistência.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Ex: PIX, Cartão de Crédito..." className="flex-1" />
                <Button className="gap-2"><Plus className="w-4 h-4" /> Adicionar</Button>
              </div>
              <div className="grid gap-2">
                {['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto'].map((method) => (
                  <div key={method} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border">
                    <span className="text-sm font-medium">{method}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500"><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipamentos" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Cadastro de Equipamentos</CardTitle>
              <CardDescription>Defina os tipos de equipamentos e seus respectivos prazos de atendimento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome do Equipamento</Label>
                  <Input id="new-eq-name" placeholder="Ex: Celular, Notebook..." />
                </div>
                <div className="space-y-2">
                  <Label>Diagnóstico (Dias)</Label>
                  <Input id="new-eq-diag" type="number" defaultValue="1" />
                </div>
                <div className="space-y-2">
                  <Label>Conclusão (Dias)</Label>
                  <Input id="new-eq-comp" type="number" defaultValue="3" />
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <Button className="gap-2" onClick={() => {
                    const name = (document.getElementById('new-eq-name') as HTMLInputElement).value;
                    const diag = parseInt((document.getElementById('new-eq-diag') as HTMLInputElement).value);
                    const comp = parseInt((document.getElementById('new-eq-comp') as HTMLInputElement).value);
                    if (!name) return toast.error('Nome do equipamento é obrigatório');
                    setEquipmentTypes(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name, defaultDiagnosisDays: diag, defaultCompletionDays: comp, companyId: '1' }]);
                    toast.success('Equipamento cadastrado!');
                    (document.getElementById('new-eq-name') as HTMLInputElement).value = '';
                  }}>
                    <Plus className="w-4 h-4" /> Cadastrar Equipamento
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 text-left">Equipamento</th>
                      <th className="px-6 py-3 text-center">Diagnóstico</th>
                      <th className="px-6 py-3 text-center">Conclusão</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {equipmentTypes.map(eq => (
                      <tr key={eq.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 font-bold">{eq.name}</td>
                        <td className="px-6 py-4 text-center">{eq.defaultDiagnosisDays} dias</td>
                        <td className="px-6 py-4 text-center">{eq.defaultCompletionDays} dias</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setEquipmentTypes(prev => prev.filter(e => e.id !== eq.id))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="substatus" className="mt-6 space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>Gerenciamento de Fluxo e Sub-status</CardTitle>
              <CardDescription>Organize as etapas internas de cada status principal para um controle mais refinado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-primary">1. Selecione o Status Principal</Label>
                    <Select value={selectedMainStatus} onValueChange={setSelectedMainStatus}>
                      <SelectTrigger className="h-12 text-base font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_COLUMNS.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground italic">O sub-status será vinculado a esta categoria principal.</p>
                  </div>
                </div>

                <div className="flex-[2] space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-primary">2. Digite o Nome do Sub-status</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ex: Peça em trânsito, Aguardando senha..." 
                        className="h-12 text-base"
                        value={newSubStatus}
                        onChange={(e) => setNewSubStatus(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubStatus()}
                      />
                      <Button onClick={addSubStatus} className="h-12 px-6 gap-2 font-bold shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5" /> CADASTRAR
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border w-full my-4" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> Visualização do Fluxo Personalizado
                  </h3>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(customSubStatuses).map(([mainStatus, subs]) => (
                    <motion.div 
                      key={mainStatus}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group"
                    >
                      <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full ring-1 ring-border group-hover:ring-primary/30">
                        <div className="h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                        <CardHeader className="py-4 px-5 flex-row items-center justify-between space-y-0 bg-secondary/30">
                          <CardTitle className="text-sm font-black text-primary truncate pr-2 uppercase">{mainStatus}</CardTitle>
                          <Badge variant="secondary" className="px-2 py-0 h-5 font-bold">{subs.length}</Badge>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-1.5 min-h-[50px]">
                            {subs.map((sub, idx) => (
                              <motion.div 
                                key={sub}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-background border hover:border-primary/50 transition-all hover:translate-x-1"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                  <span className="text-xs font-semibold">{sub}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg group-hover:opacity-100 opacity-60 transition-opacity"
                                  onClick={() => removeSubStatus(mainStatus, sub)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </motion.div>
                            ))}
                            {subs.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/30 italic">
                                <span className="text-[10px]">Sem sub-status</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                {Object.keys(customSubStatuses).length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/5">
                    <PlusCircle className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground font-medium">Nenhum fluxo customizado definido.</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest">Comece selecionando um status principal acima</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp-config" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Conexão WhatsApp (Gateway)</CardTitle>
                <CardDescription>Conecte o número via QR Code usando seu próprio Gateway.</CardDescription>
              </div>
              <div className={cn("p-2 rounded-full", qrCode ? "bg-emerald-100" : "bg-amber-100")}>
                {qrCode ? <Check className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>URL do Servidor Gateway (Evolution API)</Label>
                    <Input 
                      placeholder="Ex: https://api.seudominio.com" 
                      value={wsConfig.serverUrl}
                      onChange={(e) => setWsConfig({...wsConfig, serverUrl: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Chave de API do Gateway (Global API Key)</Label>
                    <Input 
                      type="password"
                      placeholder="Sua chave secreta..." 
                      value={wsConfig.apiKey}
                      onChange={(e) => setWsConfig({...wsConfig, apiKey: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nome da Instância (Opcional)</Label>
                    <Input 
                      placeholder="Ex: tecnico-01" 
                      value={wsConfig.instanceName}
                      onChange={(e) => setWsConfig({...wsConfig, instanceName: e.target.value})}
                    />
                    <p className="text-[10px] text-muted-foreground italic">Use um nome único para esta empresa.</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={saveWsConfig} className="flex-1 gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Salvar Credenciais
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 bg-secondary/5">
                  <h3 className="text-sm font-bold mb-4">Escaneie o QR Code</h3>
                  {qrCode ? (
                    <div className="relative group overflow-hidden rounded-xl border-4 border-white shadow-xl">
                      <img src={qrCode} alt="QR Code" className="w-[200px] h-[200px]" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="sm" variant="secondary" onClick={generateQr}>Atualizar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-[200px] h-[200px] bg-secondary/50 rounded-xl flex flex-col items-center justify-center text-center p-4">
                      <QrCode className="w-12 h-12 opacity-10 mb-2" />
                      <p className="text-[10px] text-muted-foreground">Configure as credenciais e clique em gerar.</p>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="mt-6 w-full gap-2" 
                    onClick={generateQr}
                    disabled={isGeneratingQr || !wsConfig.serverUrl}
                  >
                    {isGeneratingQr ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    {qrCode ? 'Gerar Novo QR Code' : 'Gerar Primeiro QR Code'}
                  </Button>
                  <p className="text-[9px] text-muted-foreground mt-2 text-center">
                    Abra o WhatsApp no celular &gt; Aparelhos Conectados &gt; Conectar Aparelho.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-dashed text-[11px] space-y-2">
                <p className="font-bold text-primary flex items-center gap-2">
                   INFORMAÇÕES TÉCNICAS:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">URL Webhook (no Gateway):</span>
                    <code className="bg-white px-2 py-0.5 rounded block truncate border mt-1">
                      {window.location.origin}/api/whatsapp/webhook
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status do Serviço:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-emerald-600">Conectado ao Gateway</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">E-mail</th>
                    <th className="px-6 py-4">Perfil</th>
                    <th className="px-6 py-4">Acesso (Equipamentos)</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teamUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{u.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'USUARIO' ? (
                          <div className="flex flex-wrap gap-1 max-w-[300px]">
                            {equipmentTypes.filter(eq => (u.allowedEquipmentIds || []).includes(eq.id)).map(eq => (
                              <Badge key={eq.id} variant="secondary" className="text-[9px] h-4">{eq.name}</Badge>
                            ))}
                            {(u.allowedEquipmentIds || []).length === 0 && <span className="text-[10px] text-muted-foreground italic">Nenhum atribuído</span>}
                          </div>
                        ) : (
                          <Badge variant="success" className="text-[9px] h-4">Acesso Total</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Dialog>
                            <DialogTrigger render={
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings className="w-4 h-4 text-primary" />
                              </Button>
                            } />
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Configurações de {u.name}</DialogTitle>
                                <DialogDescription>Gerencie acessos e permissões do usuário.</DialogDescription>
                              </DialogHeader>
                              
                              <Tabs defaultValue="equipamentos" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                  <TabsTrigger value="equipamentos">Acesso Equipamentos</TabsTrigger>
                                  <TabsTrigger value="privilegios">Privilégios de Telas</TabsTrigger>
                                </TabsList>

                                <TabsContent value="equipamentos" className="space-y-4 py-2">
                                  <div className="space-y-4">
                                    <Label className="text-sm font-bold">Acesso a Equipamentos</Label>
                                    <p className="text-xs text-muted-foreground mb-4 italic">Selecione quais equipamentos este usuário pode visualizar e assumir O.S.</p>
                                    <div className="grid grid-cols-2 gap-3">
                                      {equipmentTypes.map(eq => (
                                        <div key={eq.id} className="flex items-center space-x-2 p-2 rounded-lg border bg-secondary/10 hover:border-primary/50 transition-colors">
                                          <input 
                                            type="checkbox" 
                                            checked={(u.allowedEquipmentIds || []).includes(eq.id)} 
                                            onChange={(e) => {
                                              const checked = e.target.checked;
                                              setTeamUsers(prev => prev.map(p => {
                                                if (p.id === u.id) {
                                                  const currentIds = p.allowedEquipmentIds || [];
                                                  return {
                                                    ...p,
                                                    allowedEquipmentIds: checked 
                                                      ? [...currentIds, eq.id]
                                                      : currentIds.filter(id => id !== eq.id)
                                                  };
                                                }
                                                return p;
                                              }));
                                              toast.success(`${checked ? 'Acesso concedido' : 'Acesso removido'} para ${eq.name}`);
                                            }}
                                            className="w-4 h-4 accent-primary"
                                          />
                                          <span className="text-xs font-medium">{eq.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="privilegios" className="space-y-4 py-2">
                                  <div className="space-y-4">
                                    <Label className="text-sm font-bold">Privilégios de Acesso (Telas)</Label>
                                    <p className="text-xs text-muted-foreground mb-4 italic">Selecione quais módulos do sistema este usuário pode acessar.</p>
                                    <div className="grid grid-cols-2 gap-3">
                                      {[
                                        { id: 'dashboard', label: 'Início / Dashboard' },
                                        { id: 'os', label: 'Ordens de Serviço' },
                                        { id: 'kanban', label: 'Quadro Kanban' },
                                        { id: 'tarefas', label: 'Minhas Tarefas' },
                                        { id: 'clientes', label: 'Clientes' },
                                        { id: 'fornecedores', label: 'Fornecedores' },
                                        { id: 'estoque', label: 'Estoque / Produtos' },
                                        { id: 'vendas', label: 'PDV / Vendas' },
                                        { id: 'whatsapp', label: 'WhatsApp' },
                                        { id: 'financeiro', label: 'Financeiro' },
                                        { id: 'equipe', label: 'Equipe / Usuários' },
                                        { id: 'calendario', label: 'Calendário' },
                                        { id: 'config', label: 'Configurações' },
                                      ].map(screen => (
                                        <div key={screen.id} className="flex items-center space-x-2 p-2 rounded-lg border bg-secondary/10 hover:border-primary/50 transition-colors">
                                          <input 
                                            type="checkbox" 
                                            checked={(u.allowedTabs || []).includes(screen.id) || u.role === 'ADMIN-USER'} 
                                            disabled={u.role === 'ADMIN-USER'}
                                            onChange={(e) => {
                                              const checked = e.target.checked;
                                              setTeamUsers(prev => prev.map(p => {
                                                if (p.id === u.id) {
                                                  const currentTabs = p.allowedTabs || [];
                                                  return {
                                                    ...p,
                                                    allowedTabs: checked 
                                                      ? [...currentTabs, screen.id]
                                                      : currentTabs.filter(id => id !== screen.id)
                                                  };
                                                }
                                                return p;
                                              }));
                                              toast.success(`${checked ? 'Acesso permitido' : 'Acesso restrito'} para ${screen.label}`);
                                            }}
                                            className="w-4 h-4 accent-primary"
                                          />
                                          <span className="text-xs font-medium">{screen.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {u.role === 'ADMIN-USER' && (
                                      <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                        Administradores possuem acesso total a todas as telas.
                                      </p>
                                    )}
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => {
                             if(confirm('Excluir usuário?')) setTeamUsers(prev => prev.filter(p => p.id !== u.id));
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t bg-secondary/20 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Total de {teamUsers.length} usuários</p>
              <Button size="sm" className="gap-2" onClick={() => {
                const name = prompt('Nome do Usuário:');
                const email = prompt('E-mail do Usuário:');
                if(name && email) {
                  setTeamUsers(prev => [...prev, { id: Math.random().toString(), name, email, role: 'USUARIO', companyId: '1', allowedEquipmentIds: [] }]);
                  toast.success('Usuário convidado!');
                }
              }}>
                <Plus className="w-4 h-4" /> Novo Usuário
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Importar e Exportar Dados</CardTitle>
              <CardDescription>Gerencie a migração de dados do seu sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Estoque */}
                <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <Package className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">Estoque</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Importe ou exporte sua lista de produtos e peças.</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Upload className="w-4 h-4" /> Importar CSV/Excel
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full gap-2" onClick={() => toast.success('Exportando estoque...')}>
                      <Download className="w-4 h-4" /> Exportar Dados
                    </Button>
                  </div>
                </div>

                {/* Clientes */}
                <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">Clientes</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Gerencie sua base de clientes cadastrados.</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Upload className="w-4 h-4" /> Importar CSV/Excel
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full gap-2" onClick={() => toast.success('Exportando clientes...')}>
                      <Download className="w-4 h-4" /> Exportar Dados
                    </Button>
                  </div>
                </div>

                {/* Serviços */}
                <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">Serviços</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Importe ou exporte seu catálogo de serviços.</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Upload className="w-4 h-4" /> Importar CSV/Excel
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full gap-2" onClick={() => toast.success('Exportando serviços...')}>
                      <Download className="w-4 h-4" /> Exportar Dados
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-bold mb-1">Atenção ao importar dados:</p>
                  <p>Certifique-se de que o arquivo segue o modelo padrão do sistema para evitar erros de processamento. Recomendamos baixar o modelo de exemplo antes de realizar a importação.</p>
                  <Button variant="link" className="h-auto p-0 text-amber-700 font-bold mt-2">Baixar Modelos de Exemplo</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
function CalendarView({ 
  allOrders, 
  tasks, 
  onViewOS,
  onNavigate 
}: { 
  allOrders: ServiceOrder[], 
  tasks: any[], 
  onViewOS: (id: string) => void,
  onNavigate: (tab: string) => void 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Derive events from allOrders and tasks
  const getEventsForDay = (day: Date) => {
    const dayEvents: any[] = [];
    
    // OS events (Diagnóstico)
    allOrders.forEach(os => {
      if (os.diagnosisDeadline && isSameDay(new Date(os.diagnosisDeadline), day)) {
        dayEvents.push({ 
          id: os.id, 
          title: `Diag. ${os.number}`, 
          type: 'diagnosis', 
          color: 'bg-amber-500', 
          time: 'Deadline', 
          osNumber: os.number 
        });
      }
      if (os.completionDeadline && isSameDay(new Date(os.completionDeadline), day)) {
        dayEvents.push({ 
          id: os.id, 
          title: `Entr. ${os.number}`, 
          type: 'delivery', 
          color: 'bg-emerald-500', 
          time: 'Deadline', 
          osNumber: os.number 
        });
      }
    });

    // Task events
    tasks.forEach(task => {
      if (task.time && isSameDay(new Date(task.time), day)) {
        dayEvents.push({ 
          id: task.id, 
          title: task.title, 
          type: 'task', 
          color: task.priority === 'Alta' ? 'bg-rose-500' : 'bg-indigo-500', 
          time: format(new Date(task.time), 'HH:mm'),
          completed: task.completed
        });
      }
    });

    return dayEvents;
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário Operacional</h1>
          <p className="text-muted-foreground">Prazos de ordens de serviço e tarefas agendadas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
          <div className="min-w-[140px] text-center font-bold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button className="ml-2 gap-2" onClick={() => setIsNewEventModalOpen(true)}>
            <Plus className="w-4 h-4" /> Novo Evento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3 border-none shadow-sm overflow-hidden bg-white">
          <div className="grid grid-cols-7 bg-secondary/30 border-b">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              
              const diagCount = dayEvents.filter(e => e.type === 'diagnosis').length;
              const deliveryCount = dayEvents.filter(e => e.type === 'delivery').length;
              const taskCount = dayEvents.filter(e => e.type === 'task').length;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[120px] p-2 border-b border-r last:border-r-0 transition-all cursor-pointer group relative",
                    !isCurrentMonth && "bg-secondary/5 text-muted-foreground/30",
                    isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : "hover:bg-secondary/20"
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={cn(
                      "flex items-center justify-center w-7 h-7 text-xs font-black rounded-full transition-colors",
                      isCurrentDay && "bg-primary text-white shadow-lg shadow-primary/20",
                      !isCurrentDay && isSelected && "bg-secondary text-foreground",
                      !isCurrentDay && !isSelected && "text-muted-foreground"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {(diagCount > 0 || deliveryCount > 0) && (
                      <div className="flex gap-1">
                        {diagCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        {deliveryCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {/* Resumo visual por tipo */}
                    {diagCount > 0 && (
                      <div className="px-1.5 py-0.5 text-[9px] font-black bg-amber-100 text-amber-700 rounded-sm flex items-center gap-1">
                         <Search className="w-2 h-2" /> {diagCount} Diagnóstico{diagCount > 1 ? 's' : ''}
                      </div>
                    )}
                    {deliveryCount > 0 && (
                      <div className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-700 rounded-sm flex items-center gap-1">
                         <Calendar className="w-2 h-2" /> {deliveryCount} Entrega{deliveryCount > 1 ? 's' : ''}
                      </div>
                    )}
                    {taskCount > 0 && (
                      <div className="px-1.5 py-0.5 text-[9px] font-black bg-blue-100 text-blue-700 rounded-sm flex items-center gap-1">
                         <CheckCircle2 className="w-2 h-2" /> {taskCount} Tarefa{taskCount > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Detalhes rápidos ao pairar (apenas alguns) */}
                  <div className="mt-2 hidden group-hover:block transition-all">
                    {dayEvents.slice(0, 2).map((event, eIdx) => (
                      <div 
                        key={eIdx} 
                        className={cn(
                          "px-1.5 py-0.5 text-[8px] font-medium rounded truncate text-white mb-0.5",
                          event.color
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sidebar Events */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Agenda</CardTitle>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {format(selectedDate, "dd/MM/yyyy")}
                </Badge>
              </div>
              <CardDescription>
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => event.id && (event.type === 'diagnosis' || event.type === 'delivery') && onViewOS(event.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                        event.type === 'task' ? "bg-secondary/20 border-secondary" :
                        event.type === 'diagnosis' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                      )}
                    >
                      <div className={cn("w-1 h-8 rounded-full shrink-0", event.color)}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock className="w-3 h-3 text-muted-foreground" />
                           <span className="text-[10px] font-medium text-muted-foreground uppercase">{event.time}</span>
                           {event.completed && <Badge variant="success" className="h-4 text-[8px] px-1 font-black">FEITO</Badge>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                      <Calendar className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">Sem compromissos</p>
                    <p className="text-[10px] text-muted-foreground">Clique no calendário para selecionar outro dia ou adicione um novo evento.</p>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-6 gap-2 border-dashed border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => setIsNewEventModalOpen(true)}
              >
                <Plus className="w-4 h-4" /> Agendar Evento
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wrench className="w-16 h-16" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-indigo-200" />
                <h3 className="font-black text-sm uppercase tracking-widest">Pendências Técnicas</h3>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed mb-6">
                Existem <strong>{allOrders.filter(os => os.status !== 'Finalizada' && os.status !== 'Entregue' && os.status !== 'Cancelada').length}</strong> ordens de serviço em aberto que precisam de atenção.
              </p>
              <Button 
                className="w-full bg-white text-indigo-900 font-black hover:bg-indigo-50 border-none shadow-lg"
                onClick={() => onNavigate('kanban')}
              >
                VER QUADRO KANBAN
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Novo Evento Modal */}
      <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Evento / Lembrete</DialogTitle>
            <DialogDescription>Agende um novo compromisso no seu calendário operacional.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição do Evento</Label>
              <Input placeholder="Ex: Reunião com Fornecedor, Treinamento..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" defaultValue={format(selectedDate, 'yyyy-MM-dd')} />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select defaultValue="Média">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full font-black h-12" onClick={() => {
              toast.success('Evento agendado com sucesso!');
              setIsNewEventModalOpen(false);
            }}>
              CRIAR EVENTO NA AGENDA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TasksView({ tasks, setTasks }: { tasks: any[], setTasks: React.Dispatch<React.SetStateAction<any[]>> }) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', note: '', time: '', priority: 'Média' });
  const [showForm, setShowForm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setTasks(prev => prev.map(t => t.id === isEditing ? { ...t, ...formData } : t));
      toast.success('Tarefa atualizada!');
    } else {
      const newTask = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        completed: false
      };
      setTasks(prev => [newTask, ...prev]);
      toast.success('Lembrete criado!');
    }
    setIsEditing(null);
    setShowForm(false);
    setFormData({ title: '', note: '', time: '', priority: 'Média' });
  };

  const deleteOne = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.error('Tarefa excluída');
  };

  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lembretes de Tarefas</h1>
          <p className="text-muted-foreground">Gerencie seus afazeres e receba alertas sonoros.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Criar Lembrete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl">
              <ListTodo className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">Nenhuma tarefa agendada</h3>
              <p className="text-sm text-muted-foreground mb-4">Crie um compromisso para começar a receber alertas.</p>
              <Button onClick={() => setShowForm(true)} variant="outline">Novo Lembrete</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()).map(task => (
                <Card key={task.id} className={cn(
                  "border-none shadow-sm transition-all group",
                  task.completed ? "opacity-60 grayscale-[0.5]" : "hover:shadow-md"
                )}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <button 
                        onClick={() => toggleStatus(task.id)}
                        className={cn(
                          "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          task.completed ? "bg-primary border-primary text-white" : "border-muted-foreground/30 hover:border-primary"
                        )}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn("font-bold text-sm", task.completed && "line-through")}>{task.title}</h4>
                          <Badge variant={
                            task.priority === 'Alta' ? 'destructive' : 
                            task.priority === 'Média' ? 'warning' : 'secondary'
                          } className="text-[9px] px-1 py-0 h-4 uppercase">
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.note}</p>
                        <div className="flex items-center gap-3 text-[10px]">
                          <div className={cn(
                            "flex items-center gap-1",
                            !task.completed && new Date(task.time) < new Date() ? "text-rose-500 font-bold" : "text-muted-foreground"
                          )}>
                            <Clock className="w-3 h-3" />
                            {task.time ? format(new Date(task.time), "dd/MM 'às' HH:mm", { locale: ptBR }) : 'Sem horário'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                        setIsEditing(task.id);
                        setFormData({ title: task.title, note: task.note, time: task.time, priority: task.priority });
                        setShowForm(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteOne(task.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {(showForm || isEditing) ? (
            <Card className="border-primary/20 shadow-lg sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}</CardTitle>
                <CardDescription>Defina o horário para receber o alerta sonoro.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título da Tarefa</Label>
                    <Input 
                      placeholder="Ex: Ligar para fornecedor..." 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Detalhes sobre a tarefa..."
                      value={formData.note}
                      onChange={e => setFormData({...formData, note: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data e Hora</Label>
                      <Input 
                        type="datetime-local" 
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select value={formData.priority} onValueChange={(v: any) => setFormData({...formData, priority: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => {
                      setShowForm(false);
                      setIsEditing(null);
                    }}>Cancelar</Button>
                    <Button type="submit" className="flex-1">Salvar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
              <CardContent className="p-6">
                <div className="relative z-10">
                  <Bell className="w-8 h-8 mb-4 opacity-50" />
                  <h3 className="font-bold text-lg mb-2">Monitoramento Ativo</h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    O sistema verifica seus lembretes a cada minuto. Certifique-se de manter o som do navegador ativado para ouvir os alertas.
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ImportDataModal({ title, type, onImport }: { title: string, type: 'Clientes' | 'Ordens de Serviço', onImport: (data: any[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    // Simula processamento
    setTimeout(() => {
      onImport([]);
      setIsProcessing(false);
      setIsOpen(false);
      toast.success(`Dados de ${type} importados com sucesso!`);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="gap-2">
          <UploadCloud className="w-4 h-4" /> Importar {title}
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar {title}</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV ou Excel para importar seus {type.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-8">
          <label 
            className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 bg-secondary/10 hover:bg-secondary/20 transition-all cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setFile(e.dataTransfer.files[0]);
            }}
          >
            <input 
              type="file" 
              className="hidden" 
              accept=".csv,.xlsx,.xls" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-bold">{file ? file.name : "Clique ou arraste o arquivo"}</p>
              <p className="text-xs text-muted-foreground mt-1">Formatos aceitos: .csv, .xlsx</p>
            </div>
          </label>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3 italic text-xs text-amber-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="flex-1">Certifique-se de que o arquivo segue o modelo padrão. Baixe o modelo <span className="underline cursor-pointer font-bold">clicando aqui</span>.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleImport} disabled={!file || isProcessing} className="gap-2">
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Confirmar Importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupplierView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: 'Peças Express', document: '12.345.678/0001-90', email: 'vendas@pecasexpress.com', phone: '(11) 3333-5555', address: 'Av. Industrial, 500', companyId: '1', contactName: 'Ricardo', category: 'Peças' },
    { id: '2', name: 'Distribuidora Tech', document: '98.765.432/0001-11', email: 'contato@distribtech.com', phone: '(11) 4444-6666', address: 'Rua das Fábricas, 1200', companyId: '1', contactName: 'Carla', category: 'Ferramentas' },
  ]);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s => 
    fuzzyMatch(s.name, search) || fuzzyMatch(s.document, search) || fuzzyMatch(s.contactName || '', search)
  );

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este fornecedor?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast.success('Fornecedor removido!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie seus parceiros e fornecedores de peças e serviços.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if(!open) setEditingSupplier(null);
        }}>
          <DialogTrigger render={
            <Button className="gap-2" onClick={() => setEditingSupplier(null)}>
              <Plus className="w-4 h-4" /> Novo Fornecedor
            </Button>
          } />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Editar' : 'Cadastrar'} Fornecedor</DialogTitle>
              <DialogDescription>Preencha os dados cadastrais do seu fornecedor.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              
              if (editingSupplier) {
                setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...data } : s));
                toast.success('Fornecedor atualizado!');
              } else {
                setSuppliers(prev => [...prev, { id: Math.random().toString(), ...data, companyId: '1' } as any]);
                toast.success('Fornecedor cadastrado!');
              }
              setIsDialogOpen(false);
            }} className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Razão Social / Nome</Label>
                  <Input name="name" defaultValue={editingSupplier?.name} placeholder="Nome da empresa" required />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ / CPF</Label>
                  <Input name="document" defaultValue={editingSupplier?.document} placeholder="00.000.000/0001-00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input name="email" type="email" defaultValue={editingSupplier?.email} placeholder="email@fornecedor.com" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input name="phone" defaultValue={editingSupplier?.phone} placeholder="(00) 0000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pessoa de Contato</Label>
                  <Input name="contactName" defaultValue={editingSupplier?.contactName} placeholder="Nome do representante" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input name="category" defaultValue={editingSupplier?.category} placeholder="Ex: Peças, Ferramentas..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input name="address" defaultValue={editingSupplier?.address} placeholder="Rua, número, bairro, cidade..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Fornecedor</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, documento ou contato..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Fornecedor</th>
                <th className="px-6 py-4 font-semibold">Contato</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {filtered.length > 0 ? filtered.map(s => (
                <tr key={s.id} className="hover:bg-secondary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">{s.document}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{s.contactName}</span>
                      <span className="text-xs text-muted-foreground">{s.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{s.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => {
                        setEditingSupplier(s);
                        setIsDialogOpen(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                    Nenhum fornecedor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DynamicPrintView({ template, data, onClose }: { template: PrintTemplate, data: ServiceOrder, onClose: () => void }) {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    // If it's a direct print call, we might want to trigger it immediately after rendering
  }, []);

  const replaceVariables = (content: string) => {
    let result = content;
    const variables: Record<string, any> = {
      '{{os_number}}': data.number,
      '{{customer_name}}': data.customerName,
      '{{equipment}}': data.equipment,
      '{{brand}}': data.brand,
      '{{model}}': data.model,
      '{{serial_number}}': data.serialNumber || 'N/A',
      '{{problem}}': data.defect,
      '{{os_date}}': format(new Date(data.createdAt), 'dd/MM/yyyy'),
      '{{status}}': data.status,
      '{{company_name}}': 'TechManager Assistência',
      '{{company_phone}}': '(11) 98765-4321',
    };

    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value);
    });
    return result;
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <Dialog open={!!template} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-fit p-0 border-none bg-transparent shadow-none">
        <div className="flex flex-col items-center gap-4">
          <div 
            id="printable-area"
            className="bg-white border shadow-xl relative overflow-hidden print:shadow-none print:border-none"
            style={{ 
              width: `${template.width}mm`, 
              height: `${template.height}mm`,
              padding: 0,
              margin: 0,
              position: 'relative'
            }}
          >
            {template.elements.map((el) => {
              const style: React.CSSProperties = {
                position: 'absolute',
                left: `${el.x}mm`,
                top: `${el.y}mm`,
                fontSize: `${el.fontSize || 12}pt`,
                fontWeight: el.fontWeight as any,
                width: el.width ? `${el.width}mm` : 'auto',
                height: el.height ? `${el.height}mm` : 'auto',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1,
                whiteSpace: 'nowrap'
              };

              if (el.type === 'line') {
                return (
                  <div 
                    key={el.id} 
                    style={{ 
                      ...style, 
                      backgroundColor: 'black',
                      height: `${el.height || 1}mm`
                    }} 
                  />
                );
              }

              if (el.type === 'qr' || el.type === 'barcode') {
                 // Simplified placeholder for print
                return (
                  <div 
                    key={el.id} 
                    style={{ 
                      ...style, 
                      border: '1px solid black', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center', 
                      alignItems: 'center',
                      background: '#eee'
                    }}
                  >
                    <QrCode className="w-8 h-8" />
                    <span className="text-[8px] uppercase">{el.type}</span>
                  </div>
                );
              }

              return (
                <div key={el.id} style={style}>
                  {replaceVariables(el.content)}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 print:hidden bg-white/10 p-2 rounded-lg backdrop-blur-md">
            <Button variant="outline" className="bg-white" onClick={onClose}>Fechar</Button>
            <Button className="gap-2" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Imprimir Agora
            </Button>
          </div>
        </div>

        {/* CSS for print to force exact dimensions */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-area, #printable-area * {
              visibility: visible;
            }
            #printable-area {
              position: absolute;
              left: 0;
              top: 0;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: ${template.width}mm ${template.height}mm;
              margin: 0;
            }
          }
        `}} />
      </DialogContent>
    </Dialog>
  );
}

function PrintCustomizationView({ templates, setTemplates }: { templates: PrintTemplate[], setTemplates: (t: PrintTemplate[]) => void }) {
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);

  const handleCreate = (type: PrintTemplate['type']) => {
    const newTemplate: PrintTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Novo Layout ${type}`,
      type,
      width: type === 'Etiqueta' ? 40 : 80,
      height: type === 'Etiqueta' ? 25 : 200,
      elements: [],
      companyId: '1'
    };
    setEditingTemplate(newTemplate);
  };

  const handleSave = (template: PrintTemplate) => {
    const exists = templates.find(t => t.id === template.id);
    if (exists) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([...templates, template]);
    }
    setEditingTemplate(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este layout?')) {
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Layout excluído com sucesso!');
    }
  };

  if (editingTemplate) {
    return (
      <PrintDesigner 
        template={editingTemplate} 
        onSave={handleSave} 
        onCancel={() => setEditingTemplate(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalização de Impressão</h1>
          <p className="text-muted-foreground">Desenvolva layouts personalizados para etiquetas de entrada e cupons térmicos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleCreate('Etiqueta')}>
            <Plus className="w-4 h-4" /> Nova Etiqueta
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleCreate('Cupom')}>
            <Plus className="w-4 h-4" /> Novo Cupom Térmico
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => (
          <Card key={t.id} className="group hover:ring-2 ring-primary/20 transition-all overflow-hidden border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant={t.type === 'Etiqueta' ? 'default' : 'secondary'}>{t.type}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTemplate(t)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg mt-2">{t.name}</CardTitle>
              <CardDescription>{t.width}mm x {t.height}mm • {t.elements.length} elementos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-secondary/20 rounded-lg flex items-center justify-center border-2 border-dashed border-secondary">
                <Layout className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary text-xs" onClick={() => setEditingTemplate(t)}>
                Editar no Designer
              </Button>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <div className="lg:col-span-3 py-20 bg-white rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <PrinterIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-lg">Nenhum layout personalizado</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">Comece criando um novo layout de etiqueta ou cupom térmico para sua assistência.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleCreate('Etiqueta')}>Criar Etiqueta</Button>
              <Button size="sm" variant="outline" onClick={() => handleCreate('Cupom')}>Criar Cupom</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
