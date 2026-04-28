import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  PlusCircle,
  ArrowRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stage,
  Layer,
  Text as KonvaText,
  Rect as KonvaRect,
  Line as KonvaLine,
  Group as KonvaGroup,
  Ellipse as KonvaEllipse,
} from 'react-konva';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
import { STATUS_COLUMNS } from './constants';
import {
  ServiceOrder,
  OSStatus,
  OSItem,
  PrintTemplate,
  TemplateElement,
  User,
  Company,
  Supplier,
  EquipmentType,
  AIProvider,
  AIModelOption,
  AICatalogClient,
  AIAgentPromptTemplate,
  AIAgentPromptArea,
  CompanyAgentPlatform,
  SubscriptionPlan,
  AIProviderCatalog,
  AIProviderConfig,
  SupportAttachment,
  SupportMessage,
  SupportSession,
  Customer,
  TechnicalLevel,
  TechnicalSector,
  HolidayApiItem,
  HolidayCalendarCache,
  EquipmentDeadlineRule,
  OsStatusConfig,
} from './types';
import {
  buildMockAgentResponse,
  buildTechnicalPrompt,
  detectTechnicalSector,
  getRecommendedAgents,
  inferTechnicalLevel,
  getSupportExpiryDate,
  pruneSupportSessions,
} from './lib/technical-ai';

// --- Components ---

// --- Helper Functions ---
const fuzzyMatch = (text: string, query: string) => {
  if (!query) return true;
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const nText = normalize(text);
  const nQuery = normalize(query);
  return nText.includes(nQuery);
};

const safeRandomUUID = (): string => {
  const maybeCrypto = (globalThis as { crypto?: Crypto }).crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === 'function') {
    return maybeCrypto.randomUUID();
  }

  if (maybeCrypto && typeof maybeCrypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    maybeCrypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `tm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const PIX_KEY_TYPE_OPTIONS = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'TELEFONE', label: 'Telefone' },
  { value: 'ALEATORIA', label: 'Chave Aleatória' },
] as const;

const BUSINESS_WEEKDAY_OPTIONS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
] as const;

const BUSINESS_DAY_ROWS = [
  { day: 1, label: 'Segunda', startKey: 'businessHoursStart', endKey: 'businessHoursEnd', enabledKey: 'businessHoursEnabled' },
  { day: 2, label: 'Terça', startKey: 'businessHoursStart', endKey: 'businessHoursEnd', enabledKey: 'businessHoursEnabled' },
  { day: 3, label: 'Quarta', startKey: 'businessHoursStart', endKey: 'businessHoursEnd', enabledKey: 'businessHoursEnabled' },
  { day: 4, label: 'Quinta', startKey: 'businessHoursStart', endKey: 'businessHoursEnd', enabledKey: 'businessHoursEnabled' },
  { day: 5, label: 'Sexta', startKey: 'businessHoursStart', endKey: 'businessHoursEnd', enabledKey: 'businessHoursEnabled' },
  { day: 6, label: 'Sábado', startKey: 'businessHoursSaturdayStart', endKey: 'businessHoursSaturdayEnd', enabledKey: 'businessHoursSaturdayEnabled' },
  { day: 0, label: 'Domingo', startKey: 'businessHoursSundayStart', endKey: 'businessHoursSundayEnd', enabledKey: 'businessHoursSundayEnabled' },
] as const;

const normalizePixKey = (key: string, keyType?: Company['pixKeyType']) => {
  const trimmed = String(key || '').trim();
  if (!trimmed) return '';
  if (keyType === 'CPF' || keyType === 'CNPJ') return onlyDigits(trimmed);
  if (keyType === 'EMAIL') return trimmed.toLowerCase();
  if (keyType === 'TELEFONE') {
    const digits = onlyDigits(trimmed);
    if (!digits) return '';
    return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
  }
  return trimmed;
};

const isValidPixKey = (key: string, keyType?: Company['pixKeyType']) => {
  if (!key) return false;
  if (keyType === 'CPF') return /^\d{11}$/.test(key);
  if (keyType === 'CNPJ') return /^\d{14}$/.test(key);
  if (keyType === 'EMAIL') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
  if (keyType === 'TELEFONE') return /^\+55\d{10,11}$/.test(key);
  return key.length >= 8;
};

const normalizePixMerchantName = (name: string) =>
  String(name || 'TECHMANAGER')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, 25) || 'TECHMANAGER';

const normalizePixCity = (address: string) =>
  (() => {
    const parts = String(address || 'SAO PAULO')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1] || '';
    const maybeState = /^[A-Za-z]{2}$/.test(last);
    const rawCity = maybeState ? (parts[parts.length - 2] || last) : (last || parts[0] || 'SAO PAULO');
    const normalized = rawCity
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()
      .slice(0, 15);
    return normalized || 'SAO PAULO';
  })();

const emvField = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`;

const computeCrc16 = (payload: string) => {
  let crc = 0xffff;
  const bytes = new TextEncoder().encode(payload);
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i] << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const buildPixPayload = ({
  key,
  keyType,
  amount,
  merchantName,
  merchantCity,
  txid,
}: {
  key: string;
  keyType?: Company['pixKeyType'];
  amount: number;
  merchantName: string;
  merchantCity: string;
  txid?: string;
}) => {
  const normalizedKey = normalizePixKey(key, keyType);
  if (!normalizedKey || !isValidPixKey(normalizedKey, keyType)) return '';

  const amountNumber = Math.max(0, Number(amount || 0));
  const amountValue = amountNumber.toFixed(2);
  const accountInfo = emvField('00', 'BR.GOV.BCB.PIX') + emvField('01', normalizedKey);
  const sanitizedTxid = String(txid || '***')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 25);
  const additionalData = emvField('05', sanitizedTxid || '***');
  const payloadFields = [
    emvField('00', '01'),
    emvField('26', accountInfo),
    emvField('52', '0000'),
    emvField('53', '986'),
    emvField('58', 'BR'),
    emvField('59', normalizePixMerchantName(merchantName)),
    emvField('60', normalizePixCity(merchantCity)),
    emvField('62', additionalData),
    '6304',
  ];

  // Campo 54 (valor) é opcional no BR Code; enviamos somente quando > 0 para evitar rejeições.
  if (amountNumber > 0) {
    payloadFields.splice(4, 0, emvField('54', amountValue));
  }

  const payloadWithoutCrc = payloadFields.join('');

  return `${payloadWithoutCrc}${computeCrc16(payloadWithoutCrc)}`;
};

const getOrderTotalValue = (os: ServiceOrder) => {
  const itemsTotal = Array.isArray(os.items) && os.items.length > 0
    ? os.items.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0)
    : 0;
  return itemsTotal > 0 ? itemsTotal : Number(os.value || 0);
};

const formatOrderDeadlineLabel = (deadline?: string) => {
  if (!deadline) return '-';
  const deadlineDate = startOfDay(new Date(deadline));
  if (Number.isNaN(deadlineDate.getTime())) return '-';
  const today = startOfDay(new Date());
  const diff = differenceInDays(deadlineDate, today);
  if (diff === -1) return 'ONTEM';
  if (diff === 0) return 'HOJE';
  if (diff === 1) return 'AMANHÃ';
  return format(deadlineDate, 'dd/MM/yyyy');
};

const formatOrderDeadlineWeekday = (deadline?: string) => {
  if (!deadline) return '-';
  const deadlineDate = startOfDay(new Date(deadline));
  if (Number.isNaN(deadlineDate.getTime())) return '-';
  const weekday = format(deadlineDate, 'EEEE', { locale: ptBR });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
};

const buildQrCodeImageUrl = (payload: string, size = 180) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`;

const formatPixKeyPreview = (key: string, keyType?: Company['pixKeyType']) => {
  const normalized = normalizePixKey(key, keyType);
  if (!normalized) return '--';
  if (keyType === 'TELEFONE') {
    const phoneDigits = onlyDigits(normalized);
    if (!phoneDigits) return normalized;
    return phoneDigits.startsWith('55') && phoneDigits.length > 11
      ? phoneDigits.slice(2)
      : phoneDigits;
  }
  if (keyType === 'CPF' || keyType === 'CNPJ') {
    return onlyDigits(normalized) || normalized;
  }
  return normalized;
};

const buildQrCodeCandidates = (payload: string, size = 180) => [
  buildQrCodeImageUrl(payload, size),
  `https://quickchart.io/qr?size=${size}&text=${encodeURIComponent(payload)}`,
];
const OS_PRINT_INNER_WIDTH_MM = 198;
const OS_PRINT_INNER_HEIGHT_MM = 285;

const printHtmlUsingHiddenFrame = (html: string): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  const doc = iframe.contentDocument;
  if (!doc) {
    cleanup();
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  let printed = false;
  const triggerNativePrint = () => {
    if (printed) return;
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      cleanup();
      return;
    }

    printed = true;
    frameWindow.onafterprint = () => cleanup();
    frameWindow.focus();
    frameWindow.print();

    // Safety fallback for browsers that do not fire onafterprint.
    window.setTimeout(cleanup, 12000);
  };

  iframe.onload = () => {
    window.setTimeout(triggerNativePrint, 120);
  };

  // Fallback for browsers that do not emit iframe onload reliably after doc.write.
  window.setTimeout(triggerNativePrint, 700);
  return true;
};

// Componente para renderizar conteúdo A4 da OS para impressão/PDF
const OSPrintContentForRef = React.forwardRef<
  HTMLDivElement,
  { os: ServiceOrder; company: Company; customer?: Customer }
>(({ os, company, customer }, ref) => {
  const customerCityState = customer?.addressCity || customer?.addressState
    ? `${customer?.addressCity || ''}${customer?.addressState ? ` - ${customer?.addressState}` : ''}`.trim()
    : '--';
  const customerAddress = customer?.addressStreet
    ? `${customer?.addressStreet}${customer?.addressNumber ? `, ${customer?.addressNumber}` : ''}${customer?.addressNeighborhood ? ` - ${customer?.addressNeighborhood}` : ''}`
    : customer?.address || '--';
  const customerZip = customer?.addressZip || '--';
  const customerDocument = customer?.document || '--';
  const customerEmail = customer?.email || '--';
  const customerPhone = customer?.phone || '--';
  const customerContact = customer?.phone2 || '--';
  const orderTotalValue = getOrderTotalValue(os);
  const pixPayload = buildPixPayload({
    key: company.pixKey || '',
    keyType: company.pixKeyType,
    amount: orderTotalValue,
    merchantName: company.name || company.razaoSocial || 'TechManager',
    merchantCity: company.address || 'Sao Paulo',
    txid: os.number.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***',
  });
  const pixQrCodeCandidates = useMemo(
    () => (pixPayload ? buildQrCodeCandidates(pixPayload, 180) : []),
    [pixPayload]
  );
  const [pixQrCandidateIndex, setPixQrCandidateIndex] = useState(0);

  useEffect(() => {
    setPixQrCandidateIndex(0);
  }, [pixPayload]);

  return (
    <div ref={ref} id="os-print-area" className="bg-white text-black shadow-sm" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div
        className="bg-white text-black font-sans flex flex-col os-print-page-inner"
        style={{ width: `${OS_PRINT_INNER_WIDTH_MM}mm`, minHeight: `${OS_PRINT_INNER_HEIGHT_MM}mm`, margin: '6mm auto' }}
      >
      {/* Header */}
      <div className="flex flex-row justify-between items-start gap-3 border-b-2 border-black pb-3 mb-3">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
            {company.logo ? (
              <img src={company.logo} alt={company.name || 'Logo'} className="w-full h-full object-contain bg-white" />
            ) : (
              'TM'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">{company.name}</h1>
            <p className="text-xs uppercase font-bold text-black">{company.address}</p>
            <p className="text-xs font-bold text-black">{company.cnpj} • {company.phone}</p>
            <p className="text-[10px] font-bold text-black">{company.email || '--'}</p>
          </div>
        </div>
        <div className="text-right shrink-0 w-auto">
          <div className="bg-black text-white px-4 py-2 mb-2 block w-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Ordem de Serviço</p>
            <p className="text-xl font-black">{os.number}</p>
          </div>
          <p className="text-[10px] font-bold text-black italic">Data de Entrada: {format(new Date(os.createdAt), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </div>

      {/* Customer + Equipment + PIX */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-5 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">Dados do Cliente</h3>
          <div>
            <p className="text-sm font-black">{os.customerName}</p>
            <p className="text-xs text-black">{customerDocument !== '--' ? customerDocument : 'Cliente registrado por nome'}</p>
            <p className="text-xs text-black">{customerPhone !== '--' ? customerPhone : customerContact}</p>
            <p className="text-[10px] text-black/70">{customerCityState}</p>
          </div>
        </div>
        <div className="col-span-4 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">Equipamento</h3>
          <div>
            <p className="text-sm font-black">{os.equipment}</p>
            <p className="text-xs text-black">{os.brand} {os.model}</p>
            <p className="text-xs text-black font-mono">S/N: {os.serialNumber}</p>
          </div>
        </div>
        <div className="col-span-3 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">PIX</h3>
          <div className="border rounded-xl p-2">
            {pixPayload ? (
              <>
                <img
                  src={pixQrCodeCandidates[pixQrCandidateIndex] || ''}
                  alt="QRCode PIX"
                  className="w-[78px] h-[78px] border ml-auto my-1"
                  onError={() => {
                    setPixQrCandidateIndex((prev) => (prev + 1 < pixQrCodeCandidates.length ? prev + 1 : prev));
                  }}
                />
                <p className="text-[9px] uppercase font-bold text-right">Tipo: {company.pixKeyType || 'PIX'}</p>
                <p className="text-[9px] font-mono text-right break-all">Chave: {formatPixKeyPreview(company.pixKey || '', company.pixKeyType)}</p>
              </>
            ) : (
              <p className="text-[10px] text-right text-black/70">Configure a chave PIX em Dados da Empresa</p>
            )}
          </div>
        </div>
      </div>

      {/* Defect & Diagnosis */}
      <div className="space-y-3 mb-4">
        <div className="p-3 border rounded-xl">
          <h3 className="text-xs font-black uppercase tracking-widest mb-2">Defeito Informado</h3>
          <p className="text-sm italic text-black">"{os.defect}"</p>
        </div>
        {os.diagnosis && (
          <div className="p-3 border border-black/10 rounded-xl">
            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Diagnóstico Técnico</h3>
            <p className="text-sm">{os.diagnosis}</p>
          </div>
        )}
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="border rounded-xl p-2 text-center">
          <p className="text-[9px] uppercase font-bold text-black mb-1 leading-none">Status</p>
          <p className="text-sm font-black">{os.status}</p>
        </div>
        <div className="border rounded-xl p-2 text-center">
          <p className="text-[9px] uppercase font-bold text-black mb-1 leading-none">Prioridade</p>
          <p className="text-sm font-black">{os.priority}</p>
        </div>
        <div className="border rounded-xl p-2 text-center">
          <p className="text-[9px] uppercase font-bold text-black mb-1 leading-none">Prazo Diag.</p>
          <p className="text-sm font-black">
            {os.diagnosisDeadline ? format(new Date(os.diagnosisDeadline), 'dd/MM/yyyy') : '--/--/----'}
          </p>
        </div>
        <div className="border rounded-xl p-2 text-center">
          <p className="text-[9px] uppercase font-bold text-black mb-1 leading-none">Prazo Entrega</p>
          <p className="text-sm font-black">
            {os.completionDeadline ? format(new Date(os.completionDeadline), 'dd/MM/yyyy') : '--/--/----'}
          </p>
        </div>
      </div>

      {/* Items / Parts / Services */}
      <div className="mb-4 border rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-full">
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
                <td className="px-4 py-3 font-medium">
                  {item.description}
                  {item.type === 'Serviço' && item.executionTimeValue && item.executionTimeUnit && (
                    <div className="text-[9px] text-black/70">Prazo: {item.executionTimeValue} {item.executionTimeUnit}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-xs">{item.type}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold">R$ {item.totalPrice.toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-black italic">
                  Nenhum item ou serviço registrado até o momento.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50 font-black">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right uppercase tracking-widest text-xs">Valor Total da OS:</td>
              <td className="px-4 py-3 text-right text-lg">R$ {orderTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Terms & Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-5">
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">Termos e Condições</h3>
          <p className="text-[9px] text-black leading-relaxed">
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
      <div className="mt-auto text-center border-t pt-3">
        <p className="text-[10px] text-black">Este documento é uma representação digital da Ordem de Serviço {os.number}. Gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}.</p>
      </div>
      </div>
    </div>
  );
});

const SUPPORT_SESSIONS_STORAGE_KEY = 'techmanager_support_sessions';
const SUPPORT_RETENTION_DAYS = 15;
const AUTH_USERS_STORAGE_KEY = 'techmanager_auth_users';
const AUTH_SESSION_USER_ID_STORAGE_KEY = 'techmanager_auth_session_user_id';
const APP_COMPANIES_STORAGE_KEY = 'techmanager_app_companies';
const ACCOUNTANT_ASSISTANT_REMINDER_KEY = 'techmanager_accountant_assistant_last_reminder';
const WINDOWS_1252_SPECIAL_BYTES: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

const decodeMojibakeSequence = (value: string) => {
  const bytes = Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    return WINDOWS_1252_SPECIAL_BYTES[code] ?? (code <= 0xff ? code : 0x3f);
  });

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return value;
  }
};

const fixMojibakeText = (value: string) =>
  value.replace(/(?:Ã[\s\S]|Â[\s\S]|â[\s\S]{2})+/g, decodeMojibakeSequence);

const normalizeTextEncoding = <T,>(value: T): T => {
  if (typeof value === 'string') {
    return fixMojibakeText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeTextEncoding(item)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, normalizeTextEncoding(entry)])
    ) as T;
  }
  return value;
};

const AI_PROVIDER_MODEL_OPTIONS: Record<AIProvider, AIModelOption[]> = {
  openai: [
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { value: 'gpt-4.1-mini', label: 'gpt-4.1-mini' },
    { value: 'gpt-4.1', label: 'gpt-4.1' },
  ],
  groq: [
    { value: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile' },
    { value: 'llama-3.1-8b-instant', label: 'llama-3.1-8b-instant' },
    { value: 'mixtral-8x7b-32768', label: 'mixtral-8x7b-32768' },
  ],
  gemini: [
    { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
    { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
    { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
  ],
  claude: [
    { value: 'claude-3-5-sonnet-latest', label: 'claude-3-5-sonnet-latest' },
    { value: 'claude-3-5-haiku-latest', label: 'claude-3-5-haiku-latest' },
    { value: 'claude-3-opus-latest', label: 'claude-3-opus-latest' },
  ],
};
const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI (ChatGPT)',
  groq: 'Groq',
  gemini: 'Gemini',
  claude: 'Claude',
};
const EMPTY_COMPANY: Company = {
  id: '',
  subscriptionPlan: 'Basic',
  name: '',
  razaoSocial: '',
  cnpj: '',
  ie: '',
  email: '',
  phone: '',
  address: '',
  logo: undefined,
  fiscalEnabled: false,
  fiscalStrictModeEnabled: true,
  fiscalUf: '',
  fiscalActivitySector: '',
  fiscalActivityCode: '',
  fiscalActivitySearchTerm: '',
  accountantAssistantEnabled: false,
  accountantNotificationEnabled: true,
  accountantReminderEnabled: true,
  accountantReminderFrequencyDays: 7,
  accountantServices: [],
  labelPrinterName: '',
  a4PrinterName: '',
  osCopiesPerPage: 1,
  notifyWhatsappOnOpen: true,
  notifyBudgetReady: true,
  pixKeyType: 'CPF',
  pixKey: '',
  businessHoursEnabled: true,
  businessHoursWeekdays: [1, 2, 3, 4, 5],
  businessHoursStart: '08:30',
  businessHoursEnd: '18:00',
  businessHoursBreakStart: '12:00',
  businessHoursBreakEnd: '13:30',
  businessHoursBreakWeekdays: [1, 2, 3, 4, 5],
  businessHoursSaturdayEnabled: true,
  businessHoursSaturdayStart: '08:30',
  businessHoursSaturdayEnd: '12:30',
  businessHoursSundayEnabled: false,
  businessHoursSundayStart: '00:00',
  businessHoursSundayEnd: '00:00',
  businessHoursHolidayClosed: true,
  holidayWorkOverrides: {},
  waitingPartOptions: [],
  aiAssistantMode: 'saas-managed',
  aiSaasCatalogId: '',
  aiProvider: 'openai',
  aiModel: '',
  aiModelSource: 'provider-default',
};

const hasCompanyContent = (value: unknown): value is Company => {
  if (!value || typeof value !== 'object') return false;
  const company = value as Company;
  return Boolean(company.id || company.name || company.cnpj || company.email || company.phone || company.address);
};

const companyFromManagedCompany = (value?: Partial<ManagedCompany>): Company => ({
  ...EMPTY_COMPANY,
  id: value?.id || '',
  name: value?.name || '',
  cnpj: value?.document || '',
  email: value?.email || '',
  phone: value?.phone || '',
});

const sanitizeCustomers = (value: any[]): any[] => {
  const mockNames = new Set(['joao silva', 'maria oliveira', 'tech solutions ltda']);
  const mockDocs = new Set(['123.456.789-00', '987.654.321-11', '12.345.678/0001-99']);
  const mockEmails = new Set(['joao@email.com', 'maria@email.com', 'contato@tech.com']);

  return (Array.isArray(value) ? value : []).filter((customer) => {
    const normalizedName = String(customer?.name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const normalizedDoc = String(customer?.doc || '').trim();
    const normalizedEmail = String(customer?.email || '').toLowerCase().trim();

    const isKnownMock =
      mockNames.has(normalizedName) ||
      mockDocs.has(normalizedDoc) ||
      mockEmails.has(normalizedEmail);

    return !isKnownMock;
  });
};

const onlyDigits = (value: string) => (value || '').replace(/\D/g, '');

type BrasilApiNcmItem = {
  codigo: string;
  descricao: string;
  data_inicio?: string;
  data_fim?: string;
  tipo_ato?: string;
  numero_ato?: string;
  ano_ato?: string;
};

type FiscalOption = {
  value: string;
  label: string;
  description: string;
};

type NcmFiscalProfile = {
  id: string;
  title: string;
  chapterPrefixes: string[];
  cestOptions: FiscalOption[];
  taxCategoryOptions: FiscalOption[];
  cfopOptions: FiscalOption[];
  cstIcmsOptions: FiscalOption[];
  cstPisOptions: FiscalOption[];
  cstCofinsOptions: FiscalOption[];
};

const NCM_FISCAL_PROFILES: NcmFiscalProfile[] = [
  {
    id: 'electronics',
    title: 'Eletronicos e telecom',
    chapterPrefixes: ['85'],
    cestOptions: [
      { value: '21.064.00', label: '21.064.00', description: 'Aparelhos para telefonia e comunicacao (uso comum em celular/acessorios).' },
      { value: '21.053.00', label: '21.053.00', description: 'Partes e acessorios de equipamentos eletronicos.' },
      { value: '21.057.00', label: '21.057.00', description: 'Cabos e condutores para uso eletrico/eletronico.' },
    ],
    taxCategoryOptions: [
      { value: 'Tributado integral', label: 'Tributado integral', description: 'Produto com incidencia normal de ICMS/PIS/COFINS.' },
      { value: 'Monofasico', label: 'Monofasico', description: 'Tributacao concentrada na cadeia (validar NCM e legislacao).' },
      { value: 'Substituicao tributaria', label: 'Substituicao tributaria', description: 'ICMS recolhido antecipadamente por ST quando aplicavel.' },
    ],
    cfopOptions: [
      { value: '5102', label: '5102', description: 'Venda de mercadoria adquirida ou recebida de terceiros (dentro do estado).' },
      { value: '6102', label: '6102', description: 'Venda de mercadoria adquirida ou recebida de terceiros (fora do estado).' },
      { value: '5405', label: '5405', description: 'Venda com ST de mercadoria adquirida de terceiros (interna).' },
      { value: '6404', label: '6404', description: 'Venda sujeita a ST para outra UF, de mercadoria de terceiros.' },
    ],
    cstIcmsOptions: [
      { value: '00', label: '00', description: 'Tributada integralmente.' },
      { value: '20', label: '20', description: 'Com reducao de base de calculo.' },
      { value: '40', label: '40', description: 'Isenta.' },
      { value: '60', label: '60', description: 'ICMS cobrado anteriormente por ST.' },
    ],
    cstPisOptions: [
      { value: '01', label: '01', description: 'Operacao tributavel com aliquota basica.' },
      { value: '04', label: '04', description: 'Operacao tributavel monofasica (revenda com aliquota zero).' },
      { value: '06', label: '06', description: 'Operacao com aliquota zero.' },
      { value: '49', label: '49', description: 'Outras operacoes de saida (casos especificos).' },
    ],
    cstCofinsOptions: [
      { value: '01', label: '01', description: 'Operacao tributavel com aliquota basica.' },
      { value: '04', label: '04', description: 'Operacao tributavel monofasica (revenda com aliquota zero).' },
      { value: '06', label: '06', description: 'Operacao com aliquota zero.' },
      { value: '49', label: '49', description: 'Outras operacoes de saida (casos especificos).' },
    ],
  },
  {
    id: 'informatica',
    title: 'Informatica e perifericos',
    chapterPrefixes: ['84', '90'],
    cestOptions: [
      { value: '21.079.00', label: '21.079.00', description: 'Partes e pecas para maquinas e equipamentos de informatica.' },
      { value: '21.053.00', label: '21.053.00', description: 'Acessorios e componentes eletronicos diversos.' },
    ],
    taxCategoryOptions: [
      { value: 'Tributado integral', label: 'Tributado integral', description: 'Regra geral para comercializacao de informatica.' },
      { value: 'Substituicao tributaria', label: 'Substituicao tributaria', description: 'Aplicavel quando NCM/estado exigir ST.' },
    ],
    cfopOptions: [
      { value: '5102', label: '5102', description: 'Venda interna de mercadoria de terceiros.' },
      { value: '6102', label: '6102', description: 'Venda interestadual de mercadoria de terceiros.' },
      { value: '5929', label: '5929', description: 'Lancamento para simples faturamento/operacoes especificas.' },
    ],
    cstIcmsOptions: [
      { value: '00', label: '00', description: 'Tributada integralmente.' },
      { value: '20', label: '20', description: 'Com reducao de base de calculo.' },
      { value: '60', label: '60', description: 'ICMS retido anteriormente por ST.' },
    ],
    cstPisOptions: [
      { value: '01', label: '01', description: 'Tributacao normal.' },
      { value: '06', label: '06', description: 'Aliquota zero.' },
      { value: '49', label: '49', description: 'Outras operacoes de saida.' },
    ],
    cstCofinsOptions: [
      { value: '01', label: '01', description: 'Tributacao normal.' },
      { value: '06', label: '06', description: 'Aliquota zero.' },
      { value: '49', label: '49', description: 'Outras operacoes de saida.' },
    ],
  },
  {
    id: 'generic',
    title: 'Perfil fiscal generico',
    chapterPrefixes: [],
    cestOptions: [
      { value: '__none__', label: 'Sem CEST sugerido', description: 'Nem todo NCM possui CEST. Consulte contador/UF para confirmar obrigatoriedade.' },
    ],
    taxCategoryOptions: [
      { value: 'Tributado integral', label: 'Tributado integral', description: 'Cenario mais comum de venda de mercadoria.' },
      { value: 'Substituicao tributaria', label: 'Substituicao tributaria', description: 'Aplicar somente quando exigido para o NCM/UF.' },
    ],
    cfopOptions: [
      { value: '5102', label: '5102', description: 'Venda interna de mercadoria de terceiros.' },
      { value: '6102', label: '6102', description: 'Venda interestadual de mercadoria de terceiros.' },
    ],
    cstIcmsOptions: [
      { value: '00', label: '00', description: 'Tributada integralmente.' },
      { value: '40', label: '40', description: 'Isenta.' },
      { value: '60', label: '60', description: 'ICMS por substituicao tributaria.' },
    ],
    cstPisOptions: [
      { value: '01', label: '01', description: 'Operacao tributavel com aliquota basica.' },
      { value: '06', label: '06', description: 'Operacao com aliquota zero.' },
      { value: '49', label: '49', description: 'Outras operacoes de saida.' },
    ],
    cstCofinsOptions: [
      { value: '01', label: '01', description: 'Operacao tributavel com aliquota basica.' },
      { value: '06', label: '06', description: 'Operacao com aliquota zero.' },
      { value: '49', label: '49', description: 'Outras operacoes de saida.' },
    ],
  },
];

const getFiscalProfileByNcm = (ncmCode: string): NcmFiscalProfile => {
  const digits = onlyDigits(ncmCode || '');
  const chapter = digits.slice(0, 2);
  const found = NCM_FISCAL_PROFILES.find((profile) => profile.chapterPrefixes.includes(chapter));
  return found || NCM_FISCAL_PROFILES.find((profile) => profile.id === 'generic')!;
};

type BrasilApiCepResponse = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
};

type BrasilApiCnpjResponse = {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  email?: string | null;
  ddd_telefone_1?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
};

const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const fetchCepByBrasilApi = async (cep: string): Promise<BrasilApiCepResponse> => {
  const cleanCep = onlyDigits(cep);
  const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
  return response.data || {};
};

const fetchCnpjByBrasilApi = async (cnpj: string): Promise<BrasilApiCnpjResponse> => {
  const cleanCnpj = onlyDigits(cnpj);
  const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
  return response.data || {};
};

const normalizeLookupText = (value: string) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const BRAZIL_UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

type FiscalActivityTemplate = {
  code: string;
  name: string;
  keywords: string[];
  suggestedTaxCategory?: string;
  suggestedCfop?: string;
  suggestedCstIcms?: string;
  suggestedCstPis?: string;
  suggestedCstCofins?: string;
};

const FISCAL_ACTIVITY_TEMPLATES: FiscalActivityTemplate[] = [
  {
    code: '4751201',
    name: 'Comercio varejista especializado de equipamentos e suprimentos de informatica',
    keywords: ['informatica', 'pc', 'notebook', 'periferico', 'hardware'],
    suggestedTaxCategory: 'Tributado integral',
    suggestedCfop: '5102',
    suggestedCstIcms: '00',
    suggestedCstPis: '01',
    suggestedCstCofins: '01',
  },
  {
    code: '4752100',
    name: 'Comercio varejista especializado de equipamentos de telefonia e comunicacao',
    keywords: ['telefonia', 'celular', 'smartphone', 'acessorio', 'cabo'],
    suggestedTaxCategory: 'Tributado integral',
    suggestedCfop: '5102',
    suggestedCstIcms: '00',
    suggestedCstPis: '01',
    suggestedCstCofins: '01',
  },
  {
    code: '9511800',
    name: 'Reparacao e manutencao de computadores e de equipamentos perifericos',
    keywords: ['assistencia tecnica', 'reparo', 'manutencao', 'conserto', 'oficina'],
    suggestedTaxCategory: 'Tributado integral',
    suggestedCfop: '5102',
    suggestedCstIcms: '00',
    suggestedCstPis: '49',
    suggestedCstCofins: '49',
  },
  {
    code: '9521500',
    name: 'Reparacao e manutencao de equipamentos eletroeletronicos de uso pessoal e domestico',
    keywords: ['eletronico', 'eletroeletronico', 'audio', 'video', 'manutencao'],
    suggestedTaxCategory: 'Tributado integral',
    suggestedCfop: '5102',
    suggestedCstIcms: '00',
    suggestedCstPis: '49',
    suggestedCstCofins: '49',
  },
];

const ACCOUNTANT_ASSISTANT_SERVICE_OPTIONS = [
  { id: 'ncm-cest', label: 'Revisar NCM e CEST no cadastro de produtos' },
  { id: 'cfop-cst', label: 'Sugerir CFOP e CST para operacoes de venda' },
  { id: 'icms-uf', label: 'Alertar diferencas de tributacao por UF' },
  { id: 'fiscal-audit', label: 'Auditoria de consistencia fiscal de produtos' },
  { id: 'deadline-reminders', label: 'Lembretes de rotinas e entregas contabeis' },
  { id: 'setor-support', label: 'Suporte fiscal para Estoque, Vendas e Financeiro' },
];

const searchFiscalActivities = (query: string): FiscalActivityTemplate[] => {
  const normalized = normalizeLookupText(query);
  if (!normalized) return FISCAL_ACTIVITY_TEMPLATES;
  const queryDigits = onlyDigits(normalized);

  return FISCAL_ACTIVITY_TEMPLATES.filter((item) => {
    if (queryDigits && item.code.includes(queryDigits)) return true;
    if (normalizeLookupText(item.name).includes(normalized)) return true;
    return item.keywords.some((keyword) => normalizeLookupText(keyword).includes(normalized));
  });
};

const resolveFiscalActivityTemplate = (code?: string, sector?: string): FiscalActivityTemplate | null => {
  const codeDigits = onlyDigits(String(code || ''));
  if (codeDigits) {
    const byCode = FISCAL_ACTIVITY_TEMPLATES.find((item) => item.code === codeDigits);
    if (byCode) return byCode;
  }

  const normalizedSector = normalizeLookupText(String(sector || ''));
  if (!normalizedSector) return null;

  return (
    FISCAL_ACTIVITY_TEMPLATES.find((item) =>
      item.keywords.some((keyword) => normalizedSector.includes(normalizeLookupText(keyword)))
    ) || null
  );
};

const NCM_LOCAL_CACHE_KEY = 'techmanager_ncm_local_cache_v1';
const NCM_LOCAL_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type NcmLocalCachePayload = {
  updatedAt: string;
  items: BrasilApiNcmItem[];
};

const readNcmLocalCache = (): NcmLocalCachePayload | null => {
  try {
    const raw = localStorage.getItem(NCM_LOCAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items) || !parsed.updatedAt) return null;
    return parsed as NcmLocalCachePayload;
  } catch {
    return null;
  }
};

const writeNcmLocalCache = (items: BrasilApiNcmItem[]) => {
  try {
    const payload: NcmLocalCachePayload = {
      updatedAt: new Date().toISOString(),
      items,
    };
    localStorage.setItem(NCM_LOCAL_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Silently ignore cache write failures.
  }
};

const isNcmCacheFresh = (updatedAt: string) => {
  const timestamp = new Date(updatedAt).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp <= NCM_LOCAL_CACHE_MAX_AGE_MS;
};

const loadNcmLocalBase = async (): Promise<BrasilApiNcmItem[]> => {
  const cached = readNcmLocalCache();
  if (cached?.items?.length && isNcmCacheFresh(cached.updatedAt)) {
    return cached.items;
  }

  try {
    const response = await axios.get('https://brasilapi.com.br/api/ncm/v1');
    const allItems: BrasilApiNcmItem[] = Array.isArray(response.data) ? response.data : [];
    if (allItems.length) {
      writeNcmLocalCache(allItems);
      return allItems;
    }
  } catch {
    // Fallback to stale cache when offline/API unavailable.
  }

  return cached?.items || [];
};

const dedupeNcmItems = (items: BrasilApiNcmItem[]) => {
  const map = new Map<string, BrasilApiNcmItem>();
  items.forEach((item) => {
    const key = `${item.codigo || ''}|${item.descricao || ''}`;
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
};

const normalizeNcmCode = (value: string) => String(value || '').replace(/\D/g, '');

// Palavras irrelevantes para busca de NCM (artigos, preposições, etc.)
const NCM_STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'a', 'o', 'as', 'os',
  'um', 'uma', 'com', 'sem', 'para', 'por', 'em', 'no', 'na', 'nos', 'nas',
  'que', 'se', 'ao', 'aos', 'ate', 'sua', 'seu', 'seus', 'suas', 'tipo', 'modelo',
]);

// Termos muito genéricos de catálogo, úteis apenas como apoio.
const NCM_GENERIC_TERMS = new Set([
  'produto', 'peca', 'item', 'acessorio', 'kit', 'carga', 'carrega', 'carregamento',
  'novo', 'nova', 'original', 'universal', 'premium', 'qualidade'
]);

const NCM_TERM_SYNONYMS: Record<string, string[]> = {
  usb: ['universal serial bus'],
  cabo: ['cabos', 'condutor', 'condutores', 'fio', 'fios'],
  hdmi: ['video', 'dado', 'condutor', 'monitor', 'imagem', 'cabo video'],
  vga: ['video', 'monitor', 'imagem', 'condutor'],
  displayport: ['video', 'monitor', 'condutor', 'imagem'],
  carregador: ['carga', 'carregamento', 'fonte'],
  fonte: ['alimentacao', 'alimentador', 'carregador'],
  celular: ['smartphone', 'telefone', 'telefonia', 'movel'],
  notebook: ['portatil', 'laptop'],
  tela: ['display', 'lcd', 'oled', 'touchscreen', 'monitor'],
  bateria: ['acumulador', 'pilha'],
  conector: ['plug', 'terminal'],
};

const NCM_QUERY_ALIASES: Record<string, string[]> = {
  'monitor gamer': ['monitor video', 'monitor policromatico'],
  'fone bluetooth': ['auscultador sem fio', 'fone sem fio'],
  'fonte notebook': ['adaptador alimentacao notebook', 'carregador notebook'],
  'cabo usb c': ['cabo usb tipo c', 'condutor eletrico usb'],
  'cabo hdmi': ['cabo condutor video dados', 'condutor eletrico isolado hdmi'],
  'cabo vga': ['cabo condutor video', 'condutor eletrico monitor'],
  'cabo displayport': ['cabo condutor video', 'condutor eletrico monitor'],
  'adaptador hdmi': ['adaptador conversor video', 'conversor sinal video'],
  'adaptador vga': ['adaptador conversor video', 'conversor sinal video'],
  'pelicula celular': ['pelicula plastica protetora'],
  'carregador turbo': ['carregador eletrico', 'fonte alimentacao'],
};

// Camada de tags manuais (de/para) para aproximar linguagem comercial da nomenclatura oficial.
// Chave: NCM numerico sem pontuacao (preferencialmente 8 digitos; prefixos tambem sao aceitos).
const NCM_MANUAL_TAGS: Record<string, string[]> = {
  '85437039': ['hdmi', 'vga', 'displayport', 'adaptador video', 'conversor video', 'dongle', 'video', 'monitor', 'imagem'],
  '85444200': ['cabo', 'usb', 'tipo c', 'dados', 'carregamento', 'conector'],
  '85176259': ['roteador', 'wifi', 'rede', 'modem', 'comunicacao'],
  '85183000': ['fone', 'headset', 'audio', 'ouvido', 'bluetooth'],
  '85076000': ['bateria', 'lition', 'litio', 'celular', 'power bank'],
  // Prefixos de capitulo/posicao (fallback de tags por familia)
  '8544': ['cabo', 'hdmi', 'vga', 'displayport', 'condutor', 'fio', 'usb', 'dados', 'energia', 'carregamento'],
  '8543': ['aparelho eletronico', 'modulo', 'conversor', 'adaptador'],
  '8528': ['monitor', 'tela', 'display', 'video'],
  '8471': ['informatica', 'computador', 'notebook', 'processamento'],
};

const NCM_ELECTRONICS_HINTS = new Set([
  'usb', 'cabo', 'carregador', 'fonte', 'celular', 'notebook', 'tela', 'bateria', 'conector', 'hdmi', 'placa'
]);

const NCM_ELECTRONICS_NCM_KEYWORDS = [
  'eletric', 'eletron', 'telefon', 'cabo', 'condutor', 'isolad', 'acumulador',
  'aparelho', 'conector', 'usb', 'dados', 'carregador', 'alimentacao'
];

const singularizeTerm = (term: string) => {
  if (term.endsWith('oes') && term.length > 4) return `${term.slice(0, -3)}ao`;
  if (term.endsWith('ais') && term.length > 4) return `${term.slice(0, -3)}al`;
  if (term.endsWith('eis') && term.length > 4) return `${term.slice(0, -3)}el`;
  if (term.endsWith('is') && term.length > 4) return `${term.slice(0, -2)}il`;
  if (term.endsWith('es') && term.length > 4) return term.slice(0, -2);
  if (term.endsWith('s') && term.length > 3) return term.slice(0, -1);
  return term;
};

const tokenizeLookupText = (value: string) =>
  normalizeLookupText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeTerm);

const buildVectorFromTokens = (tokens: string[]) => {
  const vector = new Map<string, number>();
  tokens.forEach((token) => {
    if (!token) return;
    vector.set(token, (vector.get(token) || 0) + 1);
  });
  return vector;
};

const cosineSimilarity = (a: Map<string, number>, b: Map<string, number>) => {
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  a.forEach((aValue, key) => {
    normA += aValue * aValue;
    const bValue = b.get(key) || 0;
    dot += aValue * bValue;
  });
  b.forEach((bValue) => {
    normB += bValue * bValue;
  });

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (!denominator) return 0;
  return dot / denominator;
};

const getManualTagsForNcm = (ncmCode: string) => {
  const digits = normalizeNcmCode(ncmCode);
  if (!digits) return [] as string[];

  const tags = new Set<string>();

  // Match exato (8 digitos) ou parcial (prefixos definidos no dicionario)
  Object.entries(NCM_MANUAL_TAGS).forEach(([key, mappedTags]) => {
    if (!key) return;
    if (digits === key || digits.startsWith(key) || key.startsWith(digits)) {
      mappedTags.forEach((tag) => tags.add(normalizeLookupText(tag)));
    }
  });

  return Array.from(tags);
};

const itemSemanticVectorCache = new Map<string, Map<string, number>>();

const getItemSemanticVector = (item: BrasilApiNcmItem) => {
  const cacheKey = `${normalizeNcmCode(item.codigo)}|${normalizeLookupText(item.descricao)}`;
  const cached = itemSemanticVectorCache.get(cacheKey);
  if (cached) return cached;

  const descriptionTokens = tokenizeLookupText(item.descricao);
  const manualTagTokens = getManualTagsForNcm(item.codigo).flatMap((tag) => tokenizeLookupText(tag));
  const codeTokens = [normalizeNcmCode(item.codigo)].filter(Boolean);

  const vector = buildVectorFromTokens([...descriptionTokens, ...manualTagTokens, ...codeTokens]);
  itemSemanticVectorCache.set(cacheKey, vector);
  return vector;
};

type NcmSearchTerms = {
  originalTerms: string[];
  expandedTerms: string[];
};

type NcmSegmentProfile = {
  id: string;
  triggerTerms: string[];
  preferredCodePrefixes: string[];
  contextKeywords: string[];
};

const NCM_SEGMENT_PROFILES: NcmSegmentProfile[] = [
  {
    id: 'mobile-accessories',
    triggerTerms: ['celular', 'smartphone', 'iphone', 'android', 'usb', 'carregador', 'cabo', 'conector'],
    preferredCodePrefixes: ['85'],
    contextKeywords: ['telefon', 'eletric', 'eletron', 'cabo', 'condutor', 'carregador', 'usb', 'adaptador', 'conector'],
  },
  {
    id: 'notebook-informatica',
    triggerTerms: ['notebook', 'laptop', 'computador', 'pc', 'ssd', 'hd', 'memoria', 'teclado', 'mouse'],
    preferredCodePrefixes: ['84', '85', '90'],
    contextKeywords: ['maquina', 'processamento', 'informatic', 'armazenamento', 'memoria', 'teclado', 'mouse', 'placa', 'eletron'],
  },
  {
    id: 'games-perifericos',
    triggerTerms: ['game', 'gamer', 'console', 'controle', 'joystick', 'headset'],
    preferredCodePrefixes: ['95', '85'],
    contextKeywords: ['jogo', 'videogame', 'console', 'controle', 'audio', 'eletron'],
  },
  {
    id: 'energia-bateria',
    triggerTerms: ['bateria', 'pilha', 'fonte', 'nobreak', 'energia', 'alimentacao'],
    preferredCodePrefixes: ['85'],
    contextKeywords: ['acumulador', 'pilha', 'bateria', 'energia', 'alimentacao', 'conversor', 'transformador'],
  },
];

const extractMeaningfulTerms = (query: string): NcmSearchTerms => {
  const allTerms = tokenizeLookupText(query).filter((term) => term.length >= 2 && !NCM_STOP_WORDS.has(term));
  const specificTerms = allTerms.filter((term) => !NCM_GENERIC_TERMS.has(term));
  const originalTerms = Array.from(new Set(specificTerms.length > 0 ? specificTerms : allTerms));

  const expanded = new Set<string>(originalTerms);
  originalTerms.forEach((term) => {
    (NCM_TERM_SYNONYMS[term] || []).forEach((synonym) => {
      tokenizeLookupText(synonym).forEach((token) => {
        if (token.length >= 2 && !NCM_STOP_WORDS.has(token)) expanded.add(token);
      });
    });
  });

  return {
    originalTerms,
    expandedTerms: Array.from(expanded),
  };
};

const buildQuerySemanticVector = (query: string, terms: NcmSearchTerms) => {
  const aliasExpansions = getQueryAliasExpansions(query);
  const fullQueryTokens = tokenizeLookupText([query, ...aliasExpansions].join(' '));
  return buildVectorFromTokens([...fullQueryTokens, ...terms.expandedTerms]);
};

const getQueryAliasExpansions = (query: string): string[] => {
  const normalized = normalizeLookupText(query);
  const expansions: string[] = [];
  Object.entries(NCM_QUERY_ALIASES).forEach(([alias, terms]) => {
    if (normalized.includes(alias)) {
      expansions.push(...terms);
    }
  });
  return expansions;
};

const detectNcmSegments = (terms: NcmSearchTerms): NcmSegmentProfile[] => {
  const searchSet = new Set(terms.expandedTerms);
  return NCM_SEGMENT_PROFILES.filter((profile) =>
    profile.triggerTerms.some((term) => searchSet.has(term))
  );
};

const countMatchedOriginalTerms = (item: BrasilApiNcmItem, terms: NcmSearchTerms): number => {
  const descriptionTokens = new Set(tokenizeLookupText(item.descricao));
  const code = String(item.codigo || '').replace(/\D/g, '');
  // Inclui tags manuais do item para que termos comerciais (ex: 'hdmi') contem como match.
  const manualTagTokens = new Set(
    getManualTagsForNcm(item.codigo).flatMap((tag) => tokenizeLookupText(tag))
  );
  return terms.originalTerms.reduce((acc, term) => {
    const exactTokenMatch = descriptionTokens.has(term) || manualTagTokens.has(term);
    const prefixTokenMatch =
      Array.from(descriptionTokens).some((token) => token.startsWith(term)) ||
      Array.from(manualTagTokens).some((token) => token.startsWith(term));
    const inCode = code.includes(term);
    return exactTokenMatch || prefixTokenMatch || inCode ? acc + 1 : acc;
  }, 0);
};

const scoreNcmItem = (
  item: BrasilApiNcmItem,
  terms: NcmSearchTerms,
  query: string,
  activeSegments: NcmSegmentProfile[],
  queryVector: Map<string, number>,
  normalizedQuery: string
): number => {
  const description = normalizeLookupText(item.descricao);
  const descriptionTokens = new Set(tokenizeLookupText(item.descricao));
  const code = String(item.codigo || '').replace(/\D/g, '');

  let score = 0;

  // Match forte com termos originais da query
  for (const term of terms.originalTerms) {
    const exactTokenMatch = descriptionTokens.has(term);
    const prefixTokenMatch = Array.from(descriptionTokens).some((token) => token.startsWith(term));
    const inCode = code.includes(term);
    if (exactTokenMatch) score += 4;
    else if (prefixTokenMatch) score += 2;
    else if (inCode) score += 1;
  }

  // Match auxiliar com sinônimos/expansões
  const originalSet = new Set(terms.originalTerms);
  for (const term of terms.expandedTerms) {
    if (originalSet.has(term)) continue;
    if (descriptionTokens.has(term)) score += 1;
  }

  // Bonus por frase semelhante completa no texto
  if (normalizedQuery && description.includes(normalizedQuery)) {
    score += 3;
  }

  // Penaliza resultados sem contexto quando a busca parece eletrônica
  const looksElectronic = terms.originalTerms.some((term) => NCM_ELECTRONICS_HINTS.has(term));
  if (looksElectronic) {
    const hasElectronicContext = NCM_ELECTRONICS_NCM_KEYWORDS.some((keyword) => description.includes(keyword));
    if (!hasElectronicContext) {
      score -= 6;
    }
  }

  // Ajuste por segmento de negócio: favorece capítulos NCM e contexto típicos.
  if (activeSegments.length > 0) {
    activeSegments.forEach((segment) => {
      const prefersCode = segment.preferredCodePrefixes.some((prefix) => code.startsWith(prefix));
      const hasSegmentContext = segment.contextKeywords.some((keyword) => description.includes(keyword));
      if (prefersCode) score += 3;
      if (hasSegmentContext) score += 2;
      if (!prefersCode && !hasSegmentContext) score -= 4;
    });
  }

  // Camada semântica vetorial: aproxima termos comercialmente parecidos das descricoes oficiais.
  const itemVector = getItemSemanticVector(item);
  const semanticSimilarity = cosineSimilarity(queryVector, itemVector);
  score += semanticSimilarity * 12;

  // Bonus por tags manuais (de/para) mapeadas para o NCM.
  const itemTags = getManualTagsForNcm(item.codigo);
  const matchedTagCount = itemTags.reduce((acc, tag) => {
    const normalizedTag = normalizeLookupText(tag);
    return terms.expandedTerms.includes(normalizedTag) || normalizedQuery.includes(normalizedTag)
      ? acc + 1
      : acc;
  }, 0);
  score += matchedTagCount * 2.5;

  return score;
};

const fetchNcmByBrasilApi = async (query: string): Promise<BrasilApiNcmItem[]> => {
  const aliasExpansions = getQueryAliasExpansions(query);
  const expandedQueryText = [query, ...aliasExpansions].join(' ');
  const searchTerms = extractMeaningfulTerms(expandedQueryText);
  if (!searchTerms.originalTerms.length) return [];
  const activeSegments = detectNcmSegments(searchTerms);
  const queryVector = buildQuerySemanticVector(expandedQueryText, searchTerms);
  const normalizedExpandedQuery = normalizeLookupText(expandedQueryText);

  const minScore = searchTerms.originalTerms.length >= 2 ? 4 : 3;

  // 1) Base local (cache) primeiro: rapido e resiliente.
  const localItems = await loadNcmLocalBase();
  const numericQuery = normalizeNcmCode(query);

  if (localItems.length > 0 && numericQuery.length >= 2) {
    const codeMatches = localItems
      .filter((item) => normalizeNcmCode(item.codigo).startsWith(numericQuery))
      .sort((a, b) => normalizeNcmCode(a.codigo).localeCompare(normalizeNcmCode(b.codigo)));
    if (codeMatches.length > 0) {
      return codeMatches.slice(0, 120);
    }
  }

  if (localItems.length > 0) {
    const localScored = localItems
      .map((item) => ({
        item,
        score: scoreNcmItem(item, searchTerms, expandedQueryText, activeSegments, queryVector, normalizedExpandedQuery),
        matchedOriginalTerms: countMatchedOriginalTerms(item, searchTerms),
      }))
      .filter(({ score }) => score >= minScore)
      .sort((a, b) => b.score - a.score || b.matchedOriginalTerms - a.matchedOriginalTerms);

    if (localScored.length > 0) {
      const strictMatches = localScored.filter(({ matchedOriginalTerms }) => matchedOriginalTerms === searchTerms.originalTerms.length);
      if (strictMatches.length > 0) {
        return dedupeNcmItems(strictMatches.slice(0, 100).map(({ item }) => item));
      }

      const minMatchCount = Math.max(1, Math.ceil(searchTerms.originalTerms.length / 2));
      const relaxedMatches = localScored.filter(({ matchedOriginalTerms }) => matchedOriginalTerms >= minMatchCount);
      if (relaxedMatches.length > 0) {
        return dedupeNcmItems(relaxedMatches.slice(0, 100).map(({ item }) => item));
      }
    }
  }

  // 2) API de busca textual como backup.
  try {
    const response = await axios.get(
      `https://brasilapi.com.br/api/ncm/v1?search=${encodeURIComponent(expandedQueryText.trim())}`
    );
    const apiResults: BrasilApiNcmItem[] = Array.isArray(response.data) ? response.data : [];
    // Valida se os resultados da API realmente têm relação com a busca
    const validApiResults = apiResults
      .map((item) => ({
        item,
        score: scoreNcmItem(item, searchTerms, expandedQueryText, activeSegments, queryVector, normalizedExpandedQuery),
        matchedOriginalTerms: countMatchedOriginalTerms(item, searchTerms),
      }))
      .filter(({ score }) => score >= minScore)
      .sort((a, b) => b.score - a.score || b.matchedOriginalTerms - a.matchedOriginalTerms);
    if (validApiResults.length > 0) {
      return dedupeNcmItems(validApiResults.slice(0, 100).map(({ item }) => item));
    }
  } catch {
    // Continue no backup final abaixo.
  }

  // 3) API da tabela completa como ultimo recurso e refresh do cache local.
  try {
    const allItemsResponse = await axios.get('https://brasilapi.com.br/api/ncm/v1');
    const allItems: BrasilApiNcmItem[] = Array.isArray(allItemsResponse.data) ? allItemsResponse.data : [];
    if (!allItems.length) return [];
    writeNcmLocalCache(allItems);

    const scored = allItems
      .map((item) => ({
        item,
        score: scoreNcmItem(item, searchTerms, expandedQueryText, activeSegments, queryVector, normalizedExpandedQuery),
        matchedOriginalTerms: countMatchedOriginalTerms(item, searchTerms),
      }))
      .filter(({ score }) => score >= minScore)
      .sort((a, b) => b.score - a.score || b.matchedOriginalTerms - a.matchedOriginalTerms);

    if (!scored.length) return [];

    // Tenta match estrito primeiro: todos os termos originais devem ter batido.
    const strictMatches = scored.filter(({ matchedOriginalTerms }) => matchedOriginalTerms === searchTerms.originalTerms.length);
    if (strictMatches.length > 0) {
      return dedupeNcmItems(strictMatches.slice(0, 100).map(({ item }) => item));
    }

    // Relaxado: pelo menos metade dos termos originais deve bater.
    const minMatchCount = Math.max(1, Math.ceil(searchTerms.originalTerms.length / 2));
    const relaxedMatches = scored.filter(({ matchedOriginalTerms }) => matchedOriginalTerms >= minMatchCount);
    return dedupeNcmItems(relaxedMatches.slice(0, 100).map(({ item }) => item));
  } catch {
    return [];
  }
};

const formatCpfCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
};

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/^(\(\d{2}\) \d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/^(\(\d{2}\) \d{5})(\d)/, '$1-$2');
};

const formatStateRegistration = (value: string) => {
  const normalized = (value || '').trim().toUpperCase();
  return normalized === 'ISENTO' ? 'ISENTO' : onlyDigits(normalized).slice(0, 14);
};

const normalizeEmail = (value: string) => (value || '').trim().toLowerCase();
const isValidOptionalEmail = (value: string) => {
  const email = normalizeEmail(value);
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const AGENT_PROMPT_AREA_LABELS: Record<AIAgentPromptArea, string> = {
  'suporte-tecnico': 'Assistente Técnico',
  'contador-fiscal': 'Assistente Contador',
  'ordem-servico': 'Ordem de Serviço',
  atendimento: 'Atendimento',
  financeiro: 'Financeiro',
  vendas: 'Vendas',
  estoque: 'Estoque',
};
const PLAN_OPTIONS: SubscriptionPlan[] = ['Basic', 'Premium', 'Enterprise'];
const MANDATORY_PROMPT_HELP_DIRECTIVE =
  'Sempre ajudar com o próximo passo e responder com base na pergunta atual do usuário.';

// Friendly names for roles displayed to users
const ROLE_LABELS: Record<string, string> = {
  'ADMIN-SAAS': 'Gerente Geral',
  'ADMIN-USER': 'Gerente de Empresa',
  'USUARIO': 'Técnico'
};

// Friendly role names for UI display
const ROLE_FRIENDLY_NAMES: Record<string, string> = {
  'ADMIN-SAAS': 'Gerente Geral',
  'ADMIN-USER': 'Gerente de Empresa',
  'USUARIO': 'Técnico'
};

const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-2.5 text-sm font-medium transition-all rounded-lg group relative",
      collapsed && "justify-center px-0 py-1.5 min-h-[44px] gap-0",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
    title={collapsed ? label : undefined}
  >
    <Icon className={cn(
      "transition-transform duration-300",
      collapsed ? "w-6 h-6" : "w-5 h-5",
      active
        ? "text-primary-foreground"
        : "text-foreground/80 group-hover:scale-110 group-hover:text-primary"
    )} />
    {!collapsed && <span className="text-left leading-tight">{label}</span>}
    {collapsed && (
      <span
        className="pointer-events-none absolute left-full ml-2 rounded-md border bg-background px-2 py-1 text-xs font-semibold text-foreground shadow-lg opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
      >
        {label}
      </span>
    )}
    {active && (
      <motion.div 
        layoutId="active-nav"
        className="absolute right-0 w-1 h-6 bg-primary-foreground rounded-l-full"
      />
    )}
    {!collapsed && !active && (
      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    )}
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

type AuthUser = User & { password: string };

type ManagedCompany = {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
};

function LoginView({ onLogin, authUsers }: { onLogin: (user: User) => void; authUsers: AuthUser[] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = authUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
      if (user) {
        onLogin(user);
        toast.success(`Bem-vindo, ${user.name}!`);
      } else {
        toast.error('Email ou senha estão incorretos');
      }
      setIsLoading(false);
    }, 500);
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
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; 2024 TechManager SaaS. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}

function SetupView({ onSetupComplete }: { onSetupComplete: (superAdmin: AuthUser) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const localBackupKeys = ['techmanager_darkmode', 'techmanager_os_sort'] as const;

  const applyRestoredLocalStorage = (payload: any) => {
    const localState = payload?.localStorage;
    if (!localState || typeof localState !== 'object') return false;
    Object.entries(localState).forEach(([key, value]) => {
      if (localBackupKeys.includes(key as (typeof localBackupKeys)[number])) {
        localStorage.setItem(String(key), String(value));
      }
    });
    return true;
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      applyRestoredLocalStorage(payload);

      if (payload?.serverBackup && typeof payload.serverBackup === 'object') {
        await axios.post('/api/system/restore', payload.serverBackup);
      } else if (payload?.db && typeof payload.db === 'object') {
        await axios.post('/api/system/restore', payload);
      }

      toast.success('Backup restaurado com sucesso. O app será recarregado.');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Erro ao restaurar backup no setup:', error);
      toast.error('Falha ao restaurar backup. Verifique o arquivo.');
    } finally {
      event.target.value = '';
    }
  };

  const handleCreateSuperAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Preencha nome, email e senha para continuar.');
      return;
    }

    setIsSettingUp(true);
    const superAdmin: AuthUser = {
      id: safeRandomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'ADMIN-SAAS',
      companyId: 'app-superadmin',
      allowedTabs: ['superadmin-dashboard', 'superadmin-companies', 'superadmin-users', 'superadmin-settings'],
    };

    setTimeout(() => {
      onSetupComplete(superAdmin);
      toast.success('Superadmin criado com sucesso.');
      setIsSettingUp(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Configuração Inicial do Aplicativo</CardTitle>
            <CardDescription>
              Nenhum superadmin foi encontrado. Restaure um backup ou configure o primeiro superadmin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <p className="text-sm font-semibold">1) Restaurar backup (opcional)</p>
              <p className="text-xs text-muted-foreground">
                Se você já tem um backup do sistema, restaure antes de criar o superadmin.
              </p>
              <label className="inline-flex items-center gap-2 text-xs cursor-pointer border rounded-md px-3 py-2 hover:bg-secondary/30">
                <UploadCloud className="w-4 h-4" />
                Selecionar arquivo de backup
                <input type="file" accept="application/json" className="hidden" onChange={handleRestoreBackup} />
              </label>
            </div>

            <form onSubmit={handleCreateSuperAdmin} className="space-y-4 rounded-lg border p-4">
              <p className="text-sm font-semibold">2) Criar superadmin</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nome do superadmin</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required />
                </div>
                <div className="space-y-2">
                  <Label>Email do superadmin</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@seusistema.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crie uma senha forte" required />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSettingUp}>
                  {isSettingUp ? 'Configurando...' : 'Concluir Setup'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => localStorage.getItem(AUTH_SESSION_USER_ID_STORAGE_KEY));
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [managedCompanies, setManagedCompanies] = useState<ManagedCompany[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company>(EMPTY_COMPANY);
  const [viewingOSId, setViewingOSId] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<ServiceOrder[]>([]);
  const [customSubStatuses, setCustomSubStatuses] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('techmanager_substatuses');
    return saved ? normalizeTextEncoding(JSON.parse(saved)) : {
      'Aguardando peça': ['Peça encomendada', 'Aguardando peça pelo cliente', 'Peça em trânsito', 'Peça indisponível'],
      'Em reparo': ['Iniciado', 'Aguardando senha do sistema', 'Aguardando autorização extra', 'Reparo suspenso'],
      'Testes finais': ['Stress test', 'Verificando conexões', 'Limpeza interna', 'Aguardando validação do técnico']
    };
  });

  useEffect(() => {
    localStorage.setItem('techmanager_substatuses', JSON.stringify(customSubStatuses));
  }, [customSubStatuses]);

  const [tasks, setTasks] = useState<any[]>([]);

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
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY);

  useEffect(() => {
    if (!company.accountantAssistantEnabled) return;
    if (company.accountantNotificationEnabled === false) return;

    const selectedServices = (company.accountantServices || []).filter(Boolean);
    const serviceNames = ACCOUNTANT_ASSISTANT_SERVICE_OPTIONS
      .filter((item) => selectedServices.includes(item.id))
      .map((item) => item.label);
    if (serviceNames.length === 0) return;
    if (company.accountantReminderEnabled === false) return;

    const now = new Date();
    const reminderDays = Math.max(1, Number(company.accountantReminderFrequencyDays) || 7);
    const lastReminderIso = localStorage.getItem(ACCOUNTANT_ASSISTANT_REMINDER_KEY);
    const lastReminderDate = lastReminderIso ? new Date(lastReminderIso) : null;
    const daysSinceLast = lastReminderDate ? differenceInDays(now, lastReminderDate) : Number.POSITIVE_INFINITY;
    if (daysSinceLast < reminderDays) return;

    toast.info('Assistente Contador IA: revisar rotina fiscal', {
      description: `Servicos ativos: ${serviceNames.slice(0, 3).join(' | ')}`,
      duration: 10000,
    });
    localStorage.setItem(ACCOUNTANT_ASSISTANT_REMINDER_KEY, now.toISOString());
  }, [
    company.accountantAssistantEnabled,
    company.accountantNotificationEnabled,
    company.accountantReminderEnabled,
    company.accountantReminderFrequencyDays,
    company.accountantServices,
  ]);

  const [osSortOrder, setOsSortOrder] = useState<'number' | 'date' | 'priority'>(() => {
    const saved = localStorage.getItem('techmanager_os_sort');
    return (saved as any) || 'number';
  });

  const [isAppStateLoaded, setIsAppStateLoaded] = useState(false);
  const [isBackendStateHydrated, setIsBackendStateHydrated] = useState(false);

  useEffect(() => {
    localStorage.setItem('techmanager_os_sort', osSortOrder);
  }, [osSortOrder]);

  const [allProducts, setAllProducts] = useState<any[]>([]);

  const [salesHistory, setSalesHistory] = useState<any[]>([]);

  const [financeTransactions, setFinanceTransactions] = useState<any[]>([]);

  const [teamUsers, setTeamUsers] = useState<User[]>([]);

  const hasSuperAdmin = useMemo(() => authUsers.some((u) => u.role === 'ADMIN-SAAS'), [authUsers]);

  useEffect(() => {
    if (!sessionUserId) return;

    // Avoid forced logout while auth list is temporarily unavailable.
    if (authUsers.length === 0) return;

    const sessionUser = authUsers.find((u) => u.id === sessionUserId);
    if (!sessionUser) {
      localStorage.removeItem(AUTH_SESSION_USER_ID_STORAGE_KEY);
      setSessionUserId(null);
      if (user) setUser(null);
      return;
    }

    const hasDifferentIdentity =
      !user ||
      user.id !== sessionUser.id ||
      user.email !== sessionUser.email ||
      user.name !== sessionUser.name ||
      user.role !== sessionUser.role ||
      user.companyId !== sessionUser.companyId;

    if (hasDifferentIdentity) {
      setUser(sessionUser);
    }
  }, [authUsers, sessionUserId, user]);

  const [rmaHistory, setRmaHistory] = useState<any[]>([]);

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);

  const [globalCustomers, setGlobalCustomers] = useState<any[]>([]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [printTemplates, setPrintTemplates] = useState<PrintTemplate[]>([]);
  const [holidayCalendar, setHolidayCalendar] = useState<HolidayCalendarCache>({});
  const isHydratingAppStateRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    const loadAppState = async () => {
      const applyResolvedState = async (serverState: any = {}) => {
        const normalizedState = serverState || {};
        const resolveArray = <T,>(serverValue: unknown): T[] => {
          if (Array.isArray(serverValue)) return serverValue as T[];
          return [];
        };

        if (cancelled) return;

        if ('users' in normalizedState) {
          setAuthUsers(resolveArray<AuthUser>(normalizedState.users));
        }
        if ('companies' in normalizedState) {
          setManagedCompanies(resolveArray<ManagedCompany>(normalizedState.companies));
        }
        if ('orders' in normalizedState) {
          setAllOrders(resolveArray<ServiceOrder>(normalizedState.orders));
        }
        if ('tasks' in normalizedState) {
          setTasks(resolveArray<any>(normalizedState.tasks));
        }
        if ('products' in normalizedState) {
          setAllProducts(resolveArray<any>(normalizedState.products));
        }
        if ('sales' in normalizedState) {
          setSalesHistory(resolveArray<any>(normalizedState.sales));
        }
        if ('finance' in normalizedState) {
          setFinanceTransactions(resolveArray<any>(normalizedState.finance));
        }
        if ('team' in normalizedState) {
          setTeamUsers(resolveArray<User>(normalizedState.team));
        }
        if ('rma' in normalizedState) {
          setRmaHistory(resolveArray<any>(normalizedState.rma));
        }
        if ('equipmentTypes' in normalizedState) {
          setEquipmentTypes(resolveArray<EquipmentType>(normalizedState.equipmentTypes));
        }
        if ('customers' in normalizedState) {
          setGlobalCustomers(sanitizeCustomers(resolveArray<any>(normalizedState.customers)));
        }
        if ('suppliers' in normalizedState) {
          setSuppliers(resolveArray<Supplier>(normalizedState.suppliers));
        }
        if ('printTemplates' in normalizedState) {
          const resolvedPrintTemplates = resolveArray<PrintTemplate>(normalizedState.printTemplates);
          const adjustedPrintTemplates = resolvedPrintTemplates.map((template) =>
            template.id === '1tl03tdak' ? { ...template, gapX: 4 } : template
          );
          setPrintTemplates(adjustedPrintTemplates);
        }
        if ('holidayCalendar' in normalizedState) {
          const resolvedHolidayCalendar =
            normalizedState.holidayCalendar &&
            typeof normalizedState.holidayCalendar === 'object' &&
            !Array.isArray(normalizedState.holidayCalendar)
              ? (normalizedState.holidayCalendar as HolidayCalendarCache)
              : {};
          setHolidayCalendar(resolvedHolidayCalendar);
        }
        if ('companySettings' in normalizedState || 'companies' in normalizedState) {
          const resolvedCompanies =
            'companies' in normalizedState
              ? resolveArray<ManagedCompany>(normalizedState.companies)
              : managedCompanies;
          const resolvedCompany = hasCompanyContent(normalizedState?.companySettings)
            ? { ...EMPTY_COMPANY, ...normalizedState.companySettings }
            : companyFromManagedCompany(resolvedCompanies[0]);
          setCompany(resolvedCompany);
          setActiveCompany(resolvedCompany);
          setCompanyLogo(resolvedCompany.logo || null);
        }

        // Backend is the single source of truth for business data.
      };

      try {
        isHydratingAppStateRef.current = true;
        const baseKeys = [
          'users',
          'companies',
          'team',
          'equipmentTypes',
          'customers',
          'suppliers',
          'printTemplates',
          'holidayCalendar',
          'companySettings',
        ];
        const heavyKeys = ['orders', 'tasks', 'products', 'sales', 'finance', 'rma'];

        const baseResponse = await axios.get('/api/app-state', {
          params: { keys: baseKeys.join(',') },
        });
        await applyResolvedState(baseResponse.data || {});

        if (cancelled) return;

        setIsAppStateLoaded(true);
        setIsBackendStateHydrated(true);

        for (const key of heavyKeys) {
          if (cancelled) break;
          try {
            const response = await axios.get('/api/app-state', {
              params: { keys: key },
            });
            await applyResolvedState(response.data || {});
            await new Promise((resolve) => window.setTimeout(resolve, 0));
          } catch (error) {
            console.error(`Erro ao carregar bloco '${key}' do estado do banco:`, error);
          }
        }

        if (!cancelled) {
          isHydratingAppStateRef.current = false;
        }
      } catch (error) {
        console.error('Erro ao carregar estado do banco:', error);
        if (!cancelled) {
          isHydratingAppStateRef.current = false;
          setIsAppStateLoaded(true);
        }
      }
    };

    loadAppState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAppStateLoaded) return;
    if (!isBackendStateHydrated) return;
    if (isHydratingAppStateRef.current) return;

    setActiveCompany(company);
    setCompanyLogo(company.logo || null);

    axios.post('/api/app-state', {
      users: authUsers,
      companies: managedCompanies,
      orders: allOrders,
      tasks,
      products: allProducts,
      sales: salesHistory,
      finance: financeTransactions,
      team: teamUsers,
      rma: rmaHistory,
      equipmentTypes,
      customers: globalCustomers,
      suppliers,
      printTemplates,
      holidayCalendar,
      companySettings: company,
    }).catch((error) => {
      console.error('Erro ao persistir estado do app no banco:', error);
    });
  }, [
    isAppStateLoaded,
    isBackendStateHydrated,
    authUsers,
    managedCompanies,
    allOrders,
    tasks,
    allProducts,
    salesHistory,
    financeTransactions,
    teamUsers,
    rmaHistory,
    equipmentTypes,
    globalCustomers,
    suppliers,
    printTemplates,
    holidayCalendar,
    company,
  ]);

  const [supportSessions, setSupportSessions] = useState<SupportSession[]>(() => {
    const saved = localStorage.getItem(SUPPORT_SESSIONS_STORAGE_KEY);
    return saved ? normalizeTextEncoding(JSON.parse(saved)) : [];
  });

  useEffect(() => {
    localStorage.setItem(SUPPORT_SESSIONS_STORAGE_KEY, JSON.stringify(supportSessions));
  }, [supportSessions]);

  useEffect(() => {
    const cleanupSessions = () => {
      setSupportSessions((prev) => {
        const validOsIds = new Set(allOrders.map((order) => order.id));
        const cleaned = pruneSupportSessions(prev, validOsIds);
        return cleaned.length === prev.length ? prev : cleaned;
      });
    };
    cleanupSessions();
    const interval = setInterval(cleanupSessions, 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, [allOrders]);

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
        setActiveTab('superadmin-dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  const isTechnicalSupportEnabled = user?.role !== 'ADMIN-SAAS';

  const handleLoginSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setSessionUserId(loggedUser.id);
    localStorage.setItem(AUTH_SESSION_USER_ID_STORAGE_KEY, loggedUser.id);
  };

  const handleLogout = (showToast = true) => {
    setUser(null);
    setSessionUserId(null);
    localStorage.removeItem(AUTH_SESSION_USER_ID_STORAGE_KEY);
    if (showToast) {
      toast.info('Você saiu do sistema.');
    }
  };

  const menuItems = user?.role === 'ADMIN-SAAS' ? [
    { id: 'superadmin-dashboard', label: 'Painel de Controle', icon: LayoutDashboard },
    { id: 'superadmin-companies', label: 'Empresas', icon: Building2 },
    { id: 'superadmin-users', label: 'Usuários', icon: Users },
    { id: 'superadmin-settings', label: 'Configurações do Sistema', icon: Settings },
  ] : (user?.role === 'ADMIN-USER' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'os', label: 'Ordens de Serviço', icon: Wrench },
    { id: 'conferencia-os', label: 'Conferencia O.S', icon: ListChecks },
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
    ...(isTechnicalSupportEnabled ? [{ id: 'suporte-tecnico', label: 'Assistente Técnico', icon: Lightbulb }] : []),
    { id: 'assistente-contador', label: 'Assistente Contador', icon: Briefcase },
    { id: 'migracao', label: 'Assistente de Migração', icon: Database },
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
    ...(isTechnicalSupportEnabled ? [{ id: 'suporte-tecnico', label: 'Assistente Técnico', icon: Lightbulb }] : []),
    { id: 'assistente-contador', label: 'Assistente Contador', icon: Briefcase },
    { id: 'migracao', label: 'Assistente de Migração', icon: Database },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'config', label: 'Configurações', icon: Settings },
  ].filter(item =>
    (user?.allowedTabs || []).includes(item.id) ||
    (item.id === 'suporte-tecnico' && isTechnicalSupportEnabled) ||
    (item.id === 'assistente-contador' && company.accountantAssistantEnabled) ||
    item.id === 'migracao'
  ));

  const [holidayPromptOpen, setHolidayPromptOpen] = useState(false);
  const [holidayPromptHoliday, setHolidayPromptHoliday] = useState<HolidayApiItem | null>(null);
  const [holidayPromptOpenOnHoliday, setHolidayPromptOpenOnHoliday] = useState(company.businessHoursHolidayClosed === false);
  const [holidayPromptStart, setHolidayPromptStart] = useState(company.businessHoursStart || '08:30');
  const [holidayPromptBreakEnabled, setHolidayPromptBreakEnabled] = useState(true);
  const [holidayPromptBreakStart, setHolidayPromptBreakStart] = useState(company.businessHoursBreakStart || '12:00');
  const [holidayPromptEnd, setHolidayPromptEnd] = useState(company.businessHoursEnd || '18:00');

  const holidayCalendarRef = useRef<HolidayCalendarCache>(holidayCalendar);
  const holidayFetchInFlightYearsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    holidayCalendarRef.current = holidayCalendar;
  }, [holidayCalendar]);

  const ensureHolidayYearCache = async (year: number): Promise<HolidayApiItem[]> => {
    const yearKey = String(year);
    const cached = holidayCalendarRef.current[yearKey];
    if (cached?.holidays?.length) return cached.holidays;

    if (holidayFetchInFlightYearsRef.current.has(year)) {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 100));
        const refreshed = holidayCalendarRef.current[yearKey];
        if (refreshed?.holidays?.length) return refreshed.holidays;
      }
      return [];
    }

    holidayFetchInFlightYearsRef.current.add(year);
    try {
      const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`);
      const payload = Array.isArray(response.data) ? response.data : [];
      const holidays: HolidayApiItem[] = payload
        .map((item: any) => ({
          date: String(item?.date || '').slice(0, 10),
          name: String(item?.name || 'Feriado'),
          type: String(item?.type || 'national'),
        }))
        .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date));

      setHolidayCalendar((prev) => {
        const next = {
          ...prev,
          [yearKey]: {
            fetchedAt: new Date().toISOString(),
            holidays,
          },
        };
        holidayCalendarRef.current = next;
        return next;
      });
      return holidays;
    } catch (error) {
      console.error(`Erro ao carregar feriados de ${year}:`, error);
      return [];
    } finally {
      holidayFetchInFlightYearsRef.current.delete(year);
    }
  };

  useEffect(() => {
    if (!isAppStateLoaded || !isBackendStateHydrated) return;
    const run = async () => {
      const now = new Date();
      await ensureHolidayYearCache(now.getFullYear());
      await ensureHolidayYearCache(now.getFullYear() + 1);
    };
    run();
  }, [isAppStateLoaded, isBackendStateHydrated]);

  useEffect(() => {
    if (!isAppStateLoaded || !isBackendStateHydrated) return;
    const run = async () => {
      const today = startOfDay(new Date());
      const seenKey = `techmanager_holiday_prompt_seen_${format(today, 'yyyy-MM-dd')}`;
      if (localStorage.getItem(seenKey)) return;

      await ensureHolidayYearCache(today.getFullYear());
      await ensureHolidayYearCache(today.getFullYear() + 1);

      const allCached = Object.values(holidayCalendarRef.current)
        .flatMap((yearCache) => yearCache?.holidays || [])
        .filter((item) => item?.date)
        .sort((a, b) => a.date.localeCompare(b.date));

      const nextHoliday = allCached.find((item) => {
        const date = startOfDay(new Date(item.date));
        return !Number.isNaN(date.getTime()) && differenceInDays(date, today) >= 0;
      });
      if (!nextHoliday) return;

      const daysLeft = differenceInDays(startOfDay(new Date(nextHoliday.date)), today);
      if (daysLeft > 5) return;

      const override = company.holidayWorkOverrides?.[nextHoliday.date];
      const openByDefault = company.businessHoursHolidayClosed === false;
      setHolidayPromptHoliday(nextHoliday);
      setHolidayPromptOpenOnHoliday(override ? override.open : openByDefault);
      setHolidayPromptStart(override?.start || company.businessHoursStart || '08:30');
      setHolidayPromptBreakEnabled(override?.breakEnabled ?? true);
      setHolidayPromptBreakStart(override?.breakStart || company.businessHoursBreakStart || '12:00');
      setHolidayPromptEnd(override?.end || company.businessHoursEnd || '18:00');
      setHolidayPromptOpen(true);
      localStorage.setItem(seenKey, '1');
    };
    run();
  }, [isAppStateLoaded, isBackendStateHydrated, company.businessHoursHolidayClosed, company.businessHoursStart, company.businessHoursBreakStart, company.businessHoursEnd, company.holidayWorkOverrides]);

  const confirmHolidayPrompt = () => {
    if (!holidayPromptHoliday) {
      setHolidayPromptOpen(false);
      return;
    }
    setCompany((prev) => ({
      ...prev,
      holidayWorkOverrides: {
        ...(prev.holidayWorkOverrides || {}),
        [holidayPromptHoliday.date]: {
          open: holidayPromptOpenOnHoliday,
          start: holidayPromptStart,
          breakEnabled: holidayPromptBreakEnabled,
          breakStart: holidayPromptBreakStart,
          end: holidayPromptEnd,
        },
      },
    }));
    toast.success('Configuração de feriado salva.');
    setHolidayPromptOpen(false);
  };

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
          globalCustomers={globalCustomers}
          user={user}
          company={company}
          printTemplates={printTemplates}
        />
      );
    }

    switch (activeTab) {
      case 'superadmin-dashboard':
        return <SuperAdminDashboardView allUsers={authUsers} />;
      case 'superadmin-companies':
        return (
          <SuperAdminCompaniesView
            companies={managedCompanies}
            setCompanies={setManagedCompanies}
            users={authUsers}
          />
        );
      case 'superadmin-users':
        return (
          <SuperAdminUsersView
            users={authUsers}
            setUsers={setAuthUsers}
            setTeamUsers={setTeamUsers}
            companies={managedCompanies}
          />
        );
      case 'superadmin-settings':
        return (
          <SuperAdminSettingsView
            onFactoryReset={() => {
              localStorage.removeItem(AUTH_USERS_STORAGE_KEY);
              localStorage.removeItem('techmanager_team');
              localStorage.removeItem('techmanager_user');
              localStorage.removeItem(AUTH_SESSION_USER_ID_STORAGE_KEY);
              localStorage.removeItem(APP_COMPANIES_STORAGE_KEY);
              setAuthUsers([]);
              setTeamUsers([]);
              setManagedCompanies([]);
              handleLogout(false);
            }}
          />
        );
      case 'fornecedores':
        return (
          <SupplierView
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            activeCompanyId={activeCompany?.id || user?.companyId || '1'}
          />
        );
      case 'dashboard':
        return user?.role === 'USUARIO' 
          ? <TechnicianDashboardView onViewOS={(id) => setViewingOSId(id)} allOrders={allOrders} user={user} equipmentTypes={equipmentTypes} setAllOrders={setAllOrders} />
          : <DashboardView onViewOS={(id) => setViewingOSId(id)} onNavigate={setActiveTab} allOrders={allOrders} allProducts={allProducts} salesHistory={salesHistory} financeTransactions={financeTransactions} />;
      case 'os':
        return (
          <OSListView 
            onViewOS={(id) => setViewingOSId(id)} 
            allOrders={allOrders} 
            sortOrder={osSortOrder} 
            teamUsers={teamUsers} 
            user={user as User} 
            equipmentTypes={equipmentTypes} 
            setEquipmentTypes={setEquipmentTypes}
            globalCustomers={globalCustomers}
            setGlobalCustomers={setGlobalCustomers}
            setAllOrders={setAllOrders} 
            printTemplates={printTemplates} 
            company={company}
            holidayCalendar={holidayCalendar}
            setHolidayCalendar={setHolidayCalendar}
          />
        );
      case 'conferencia-os':
        return (
          <OSConferenceView
            allOrders={allOrders}
            setAllOrders={setAllOrders}
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
            fiscalStrictModeEnabled={activeCompany.fiscalStrictModeEnabled !== false}
            companyFiscalSettings={{
              fiscalUf: activeCompany.fiscalUf,
              fiscalActivitySector: activeCompany.fiscalActivitySector,
              fiscalActivityCode: activeCompany.fiscalActivityCode,
              accountantAssistantEnabled: activeCompany.accountantAssistantEnabled,
            }}
            allProducts={allProducts}
            setAllProducts={setAllProducts}
            rmaHistory={rmaHistory}
            setRmaHistory={setRmaHistory}
            salesHistory={salesHistory}
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
        return (
          <CalendarView
            allOrders={allOrders}
            tasks={tasks}
            onViewOS={(id) => setViewingOSId(id)}
            onNavigate={setActiveTab}
            holidayCalendar={holidayCalendar}
          />
        );
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
      case 'suporte-tecnico':
        return (
          <TechnicalSupportView
            user={user as User}
            company={company}
            allOrders={allOrders}
            allProducts={allProducts}
            supportSessions={supportSessions}
            setSupportSessions={setSupportSessions}
            isPremiumEnabled={!!isTechnicalSupportEnabled}
          />
        );
      case 'assistente-contador':
        return (
          <AccountantAssistantView
            company={company}
            allProducts={allProducts}
          />
        );
      case 'migracao':
        return (
          <MigrationAssistantView
            activeCompanyId={company.id}
            setAllProducts={setAllProducts}
            setGlobalCustomers={setGlobalCustomers}
            setAllOrders={setAllOrders}
            setSuppliers={setSuppliers}
          />
        );
      case 'config':
        return (
          <SettingsView 
            user={user as User} 
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
            companies={managedCompanies}
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

  if (!isAppStateLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader>
            <CardTitle>Carregando dados do sistema</CardTitle>
            <CardDescription>Sincronizando usuários, empresas e dashboards a partir do banco de dados.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!hasSuperAdmin) {
    return (
      <SetupView
        onSetupComplete={(superAdmin) => {
          setAuthUsers([superAdmin]);
          setTeamUsers([]);
          handleLoginSuccess(superAdmin);
        }}
      />
    );
  }

  if (!user) {
    return <LoginView onLogin={handleLoginSuccess} authUsers={authUsers} />;
  }

  return (
    <div className={cn("theme-auto flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 transition-colors duration-300", darkMode && "dark")}>
      <Toaster position="top-right" richColors />
      <Dialog open={holidayPromptOpen} onOpenChange={setHolidayPromptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Planejamento de Feriado</DialogTitle>
            <DialogDescription>
              {holidayPromptHoliday
                ? `Faltam até 5 dias para ${holidayPromptHoliday.name} (${format(new Date(holidayPromptHoliday.date), 'dd/MM/yyyy')}).`
                : 'Configure o horário para o próximo feriado.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label>Vai abrir no feriado?</Label>
              <Button
                type="button"
                size="sm"
                variant={holidayPromptOpenOnHoliday ? 'default' : 'outline'}
                onClick={() => setHolidayPromptOpenOnHoliday((prev) => !prev)}
              >
                {holidayPromptOpenOnHoliday ? 'SIM' : 'NÃO'}
              </Button>
            </div>
            {holidayPromptOpenOnHoliday && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Início</Label>
                    <Input type="time" value={holidayPromptStart} onChange={(e) => setHolidayPromptStart(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Fim</Label>
                    <Input type="time" value={holidayPromptEnd} onChange={(e) => setHolidayPromptEnd(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <Label>Usar intervalo?</Label>
                  <input
                    type="checkbox"
                    checked={holidayPromptBreakEnabled}
                    onChange={(e) => setHolidayPromptBreakEnabled(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                </div>
                {holidayPromptBreakEnabled && (
                  <div className="space-y-1">
                    <Label>Início do intervalo</Label>
                    <Input type="time" value={holidayPromptBreakStart} onChange={(e) => setHolidayPromptBreakStart(e.target.value)} />
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHolidayPromptOpen(false)}>Agora não</Button>
            <Button onClick={confirmHolidayPrompt}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 bg-background border-r shadow-sm lg:relative",
          isSidebarOpen ? "w-72 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0 lg:w-20",
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

        <nav className={cn(
          "flex-1 px-3 py-4 overflow-y-auto",
          isSidebarOpen ? "space-y-1" : "space-y-0.5"
        )}>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              collapsed={!isSidebarOpen}
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
            label="Sair"
            collapsed={!isSidebarOpen}
            onClick={() => {
              handleLogout();
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
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role] || user.role}</p>
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

function SuperAdminDashboardView({ allUsers }: { allUsers: AuthUser[] }) {
  const totalUsers = allUsers.length;
  const totalAdmins = allUsers.filter((u) => u.role === 'ADMIN-USER').length;
  const totalTechnicians = allUsers.filter((u) => u.role === 'USUARIO').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão do Aplicativo</h1>
        <p className="text-muted-foreground">Painel exclusivo do superadmin para gerenciamento da plataforma.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total de Usuários</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalUsers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Admins de Empresa</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalAdmins}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Usuários Técnicos</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalTechnicians}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}

function SuperAdminCompaniesView({
  companies,
  setCompanies,
  users,
}: {
  companies: ManagedCompany[];
  setCompanies: React.Dispatch<React.SetStateAction<ManagedCompany[]>>;
  users: AuthUser[];
}) {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isCnpjLookupLoading, setIsCnpjLookupLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) =>
      [company.name, company.document || '', company.email || '', company.id]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [companies, searchTerm]);

  const clearForm = () => {
    setName('');
    setDocument('');
    setEmail('');
    setPhone('');
    setIsCnpjLookupLoading(false);
    setEditingId(null);
  };

  const handleLookupCompanyByCnpj = async () => {
    const cleanCnpj = onlyDigits(document);
    if (cleanCnpj.length !== 14) {
      toast.error('Informe um CNPJ válido com 14 dígitos para consultar.');
      return;
    }

    try {
      setIsCnpjLookupLoading(true);
      const data = await fetchCnpjByBrasilApi(cleanCnpj);
      setDocument(formatCpfCnpj(cleanCnpj));
      setName(data.razao_social || data.nome_fantasia || name);
      setEmail((data.email || '').toLowerCase());
      setPhone(formatPhone(data.ddd_telefone_1 || phone));
      toast.success('Dados da empresa carregados via CNPJ.');
    } catch {
      toast.error('Não foi possível consultar este CNPJ na BrasilAPI.');
    } finally {
      setIsCnpjLookupLoading(false);
    }
  };

  const saveCompany = () => {
    if (!name.trim()) {
      toast.error('Nome da empresa é obrigatório.');
      return;
    }

    setCompanies((prev) => {
      const duplicateByName = prev.some(
        (company) => company.name.toLowerCase() === name.trim().toLowerCase() && company.id !== editingId
      );
      if (duplicateByName) {
        toast.error('Já existe uma empresa com esse nome.');
        return prev;
      }

      if (editingId) {
        return prev.map((company) =>
          company.id === editingId
            ? {
                ...company,
                name: name.trim(),
                document: document.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
              }
            : company
        );
      }

      return [
        ...prev,
        {
          id: safeRandomUUID(),
          name: name.trim(),
          document: document.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          active: true,
          createdAt: new Date().toISOString(),
        },
      ];
    });

    toast.success(editingId ? 'Empresa atualizada.' : 'Empresa cadastrada.');
    clearForm();
  };

  const startEdit = (company: ManagedCompany) => {
    setEditingId(company.id);
    setName(company.name);
    setDocument(company.document || '');
    setEmail(company.email || '');
    setPhone(company.phone || '');
  };

  const deleteCompany = (companyId: string) => {
    const inUse = users.some((u) => u.role !== 'ADMIN-SAAS' && u.companyId === companyId);
    if (inUse) {
      toast.error('Esta empresa está vinculada a usuários e não pode ser removida.');
      return;
    }

    setCompanies((prev) => {
      if (prev.length <= 1) {
        toast.error('É necessário manter pelo menos uma empresa cadastrada.');
        return prev;
      }
      return prev.filter((company) => company.id !== companyId);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <p className="text-muted-foreground">Cadastre as empresas disponíveis para vincular nos usuários.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Editar Empresa' : 'Nova Empresa'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da empresa" />
            <div className="flex gap-2">
              <Input value={document} onChange={(e) => setDocument(formatCpfCnpj(e.target.value))} placeholder="CNPJ/Documento (opcional)" />
              <Button
                type="button"
                variant="outline"
                onClick={handleLookupCompanyByCnpj}
                disabled={isCnpjLookupLoading}
              >
                {isCnpjLookupLoading ? 'Consultando...' : 'Buscar CNPJ'}
              </Button>
            </div>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail (opcional)" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone (opcional)" />
          </div>
          <div className="flex justify-end gap-2">
            {editingId && (
              <Button type="button" variant="outline" onClick={clearForm}>
                Cancelar
              </Button>
            )}
            <Button type="button" onClick={saveCompany}>
              {editingId ? 'Salvar Empresa' : 'Cadastrar Empresa'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Empresas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar empresa por nome, documento ou ID"
            />
            <Button type="button" variant="outline" onClick={() => setSearchTerm(searchTerm.trim())}>
              <Search className="w-4 h-4 mr-2" />
              Pesquisar
            </Button>
          </div>

          {filteredCompanies.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
          ) : (
            filteredCompanies.map((company) => (
              <div key={company.id} className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {company.document ? `${company.document}` : 'Sem CNPJ'} {company.email ? `| ${company.email}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => startEdit(company)}>
                    Editar
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => deleteCompany(company.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SuperAdminUsersView({
  users,
  setUsers,
  setTeamUsers,
  companies,
}: {
  users: AuthUser[];
  setUsers: React.Dispatch<React.SetStateAction<AuthUser[]>>;
  setTeamUsers: React.Dispatch<React.SetStateAction<User[]>>;
  companies: ManagedCompany[];
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('USUARIO');
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [companySearch, setCompanySearch] = useState('');
  const [appliedCompanySearch, setAppliedCompanySearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const visibleCompanies = useMemo(() => {
    const query = appliedCompanySearch.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) =>
      [company.name, company.document || '', company.id].join(' ').toLowerCase().includes(query)
    );
  }, [companies, appliedCompanySearch]);

  useEffect(() => {
    if (role === 'ADMIN-SAAS') {
      setCompanyId('app-superadmin');
      return;
    }

    if (companyId && companies.some((company) => company.id === companyId)) return;
    setCompanyId(companies[0]?.id || '');
  }, [companies, role, companyId]);

  const syncTeamUsers = (nextUsers: AuthUser[]) => {
    setTeamUsers(
      nextUsers
        .filter((u) => u.role !== 'ADMIN-SAAS')
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          companyId: u.companyId,
          privilege: u.role === 'ADMIN-USER' ? 'Completo' : 'Profissional',
          allowedTabs:
            u.role === 'ADMIN-USER'
              ? ['dashboard', 'os', 'conferencia-os', 'kanban', 'tarefas', 'clientes', 'estoque', 'financeiro', 'calendario', 'vendas', 'config', 'suporte-tecnico', 'assistente-contador', 'migracao']
              : ['dashboard', 'os', 'tarefas', 'suporte-tecnico', 'assistente-contador', 'migracao'],
        }))
    );
  };

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('USUARIO');
    setCompanySearch('');
    setAppliedCompanySearch('');
    setCompanyId(companies[0]?.id || '');
    setEditingId(null);
  };

  const saveUser = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Nome e e-mail são obrigatórios.');
      return;
    }
    if (!editingId && !password.trim()) {
      toast.error('Senha é obrigatória para novo usuário.');
      return;
    }
    if (role !== 'ADMIN-SAAS' && !companyId) {
      toast.error('Selecione uma empresa para o usuário.');
      return;
    }

    const resolvedCompanyId = role === 'ADMIN-SAAS' ? 'app-superadmin' : companyId;

    setUsers((prev) => {
      const duplicate = prev.some((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== editingId);
      if (duplicate) {
        toast.error('Já existe um usuário com esse e-mail.');
        return prev;
      }

      const next = editingId
        ? prev.map((u) =>
            u.id === editingId
              ? {
                  ...u,
                  name: name.trim(),
                  email: email.trim().toLowerCase(),
                  role,
                  companyId: resolvedCompanyId,
                  password: password.trim() ? password : u.password,
                }
              : u
          )
        : [
            ...prev,
            {
              id: safeRandomUUID(),
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password: password.trim(),
              role,
              companyId: resolvedCompanyId,
              allowedTabs:
                role === 'ADMIN-SAAS'
                  ? ['superadmin-dashboard', 'superadmin-companies', 'superadmin-users', 'superadmin-settings']
                  : role === 'ADMIN-USER'
                  ? ['dashboard', 'os', 'conferencia-os', 'kanban', 'tarefas', 'clientes', 'estoque', 'financeiro', 'calendario', 'vendas', 'config', 'suporte-tecnico', 'assistente-contador', 'migracao']
                  : ['dashboard', 'os', 'tarefas', 'suporte-tecnico', 'assistente-contador', 'migracao'],
            } as AuthUser,
          ];

      syncTeamUsers(next);
      return next;
    });

    toast.success(editingId ? 'Usuário atualizado.' : 'Usuário criado.');
    clearForm();
  };

  const startEdit = (u: AuthUser) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setCompanyId(u.companyId || companies[0]?.id || '');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => {
      const target = prev.find((u) => u.id === id);
      if (!target) return prev;
      if (target.role === 'ADMIN-SAAS' && prev.filter((u) => u.role === 'ADMIN-SAAS').length <= 1) {
        toast.error('Não é possível remover o único superadmin.');
        return prev;
      }
      const next = prev.filter((u) => u.id !== id);
      syncTeamUsers(next);
      return next;
    });
    toast.success('Usuário removido.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">Adicionar, editar e remover usuários do aplicativo.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editingId ? 'Nova senha (opcional)' : 'Senha'} />
            <Select value={role} onValueChange={(v) => v && setRole(v as User['role'])}>
              <SelectTrigger>
                <SelectValue>{ROLE_LABELS[role] || role}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN-SAAS">Gerente Geral</SelectItem>
                <SelectItem value="ADMIN-USER">Gerente de Empresa</SelectItem>
                <SelectItem value="USUARIO">Técnico</SelectItem>
              </SelectContent>
            </Select>

            {role !== 'ADMIN-SAAS' && (
              <div className="md:col-span-2 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Pesquisar empresas disponíveis"
                  />
                  <Button type="button" variant="outline" onClick={() => setAppliedCompanySearch(companySearch)}>
                    <Search className="w-4 h-4 mr-2" />
                    Pesquisar
                  </Button>
                </div>
                <Select value={companyId} onValueChange={(v) => setCompanyId(v || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa">
                      {companies.find(c => c.id === companyId)?.name || 'Selecione uma empresa'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {visibleCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {visibleCompanies.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma empresa encontrada para o filtro informado.</p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            {editingId && <Button type="button" variant="outline" onClick={clearForm}>Cancelar</Button>}
            <Button type="button" onClick={saveUser}>{editingId ? 'Salvar' : 'Adicionar Usuário'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Usuários Cadastrados</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.email} | {ROLE_LABELS[u.role] || u.role} {u.role !== 'ADMIN-SAAS' && companies.find(c => c.id === u.companyId) ? `| ${companies.find(c => c.id === u.companyId)?.name}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => startEdit(u)}>Editar</Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>Remover</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SuperAdminSettingsView({ onFactoryReset }: { onFactoryReset: () => void }) {
  const [busy, setBusy] = useState(false);
  const localBackupKeys = ['techmanager_darkmode', 'techmanager_os_sort'] as const;

  const downloadBackup = async () => {
    setBusy(true);
    try {
      const serverBackup = await axios.get('/api/system/backup');
      const localStorageDump: Record<string, string> = {};
      localBackupKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          localStorageDump[key] = value;
        }
      });

      const payload = {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        localStorage: localStorageDump,
        serverBackup: serverBackup.data,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `techmanager-backup-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      toast.success('Backup gerado.');
    } catch (error) {
      console.error('Erro ao gerar backup:', error);
      toast.error('Falha ao gerar backup.');
    } finally {
      setBusy(false);
    }
  };

  const restoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      if (payload?.localStorage && typeof payload.localStorage === 'object') {
        Object.entries(payload.localStorage).forEach(([key, value]) => {
          if (localBackupKeys.includes(key as (typeof localBackupKeys)[number])) {
            localStorage.setItem(String(key), String(value));
          }
        });
      }

      if (payload?.serverBackup && typeof payload.serverBackup === 'object') {
        await axios.post('/api/system/restore', payload.serverBackup);
      } else if (payload?.db && typeof payload.db === 'object') {
        await axios.post('/api/system/restore', payload);
      }

      toast.success('Backup restaurado. Recarregando...');
      setTimeout(() => window.location.reload(), 600);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Falha ao restaurar backup.');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const resetFactory = async () => {
    const ok = window.confirm('Confirma reset de fábrica? Isso apagará todos os dados.');
    if (!ok) return;
    setBusy(true);
    try {
      await axios.post('/api/system/factory-reset', {});
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('techmanager_')) localStorage.removeItem(k);
      });
      toast.success('Aplicativo resetado.');
      onFactoryReset();
    } catch (error) {
      console.error('Erro no reset de fábrica:', error);
      toast.error('Falha no reset de fábrica.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Superadmin</h1>
        <p className="text-muted-foreground">Backup, restauração e reset de fábrica.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Backup e Restauração</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" onClick={downloadBackup} disabled={busy}>Gerar Backup</Button>
          <label className="inline-flex items-center gap-2 text-xs cursor-pointer border rounded-md px-3 py-2 hover:bg-secondary/30">
            <UploadCloud className="w-4 h-4" /> Restaurar Backup
            <input type="file" accept="application/json" className="hidden" onChange={restoreBackup} disabled={busy} />
          </label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Padrão de Fábrica</CardTitle></CardHeader>
        <CardContent>
          <Button type="button" variant="destructive" onClick={resetFactory} disabled={busy}>Resetar Aplicativo</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceOrderDetailsView({ 
  osId, 
  onBack, 
  allOrders, 
  setAllOrders,
  customSubStatuses,
  allProducts,
  teamUsers,
  globalCustomers,
  user,
  company,
  printTemplates
}: { 
  osId: string, 
  onBack: () => void, 
  allOrders: ServiceOrder[], 
  setAllOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>,
  customSubStatuses: Record<string, string[]>,
  allProducts: any[],
  teamUsers: User[],
  globalCustomers: any[],
  user: User | null,
  company: Company,
  printTemplates: PrintTemplate[]
}) {
  const os = allOrders.find(o => o.id === osId);
  const [status, setStatus] = useState<OSStatus | string>(os?.status || '');
  const [subStatus, setSubStatus] = useState(os?.subStatus || '');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const osPrintAreaRef = useRef<HTMLDivElement | null>(null);
  const [templateToPrint, setTemplateToPrint] = useState<PrintTemplate | null>(null);

  const isOwner = user?.role === 'ADMIN-USER' || user?.role === 'ADMIN-SAAS';
  const waitingPartOptions = company.waitingPartOptions || [];
  const [selectedWaitingPartOptionId, setSelectedWaitingPartOptionId] = useState('');
  const orderedStatusColumns = useMemo(() => {
    if (company.osStatuses && company.osStatuses.length > 0) {
      return [...company.osStatuses]
        .sort((a, b) => a.order - b.order)
        .map((item) => item.name as OSStatus);
    }
    return STATUS_COLUMNS;
  }, [company.osStatuses]);

  // Reset sub-status if main status changes and it's not applicable
  useEffect(() => {
    if (!['Aguardando peça', 'Em reparo', 'Testes finais'].includes(status as string)) {
      setSubStatus('');
    }
  }, [status]);
  useEffect(() => {
    const normalizedStatus = String(status || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    if (normalizedStatus !== 'aguardando peca') {
      setSelectedWaitingPartOptionId('');
    }
  }, [status]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [arrivalDate, setArrivalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [completionDate, setCompletionDate] = useState(os?.completionDeadline ? format(new Date(os.completionDeadline), 'yyyy-MM-dd') : format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const isWaitingPartsStatus = String(status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase() === 'aguardando peca';

  const products = allProducts;

  const handlePrint = () => {
    const target = osPrintAreaRef.current;
    if (!target) {
      toast.error('Nao foi possivel localizar o layout de impressao.');
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n');

    const printHtml = `
      <!doctype html>
      <html>
        <head>
          <title>${os.number}</title>
          ${styles}
          <style>
            @page { size: A4; margin: 0; }
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            #os-print-area {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              background: #ffffff !important;
              color: #000000 !important;
              overflow: hidden !important;
            }
            .os-print-page-inner {
              width: 198mm !important;
              min-height: 285mm !important;
              margin: 6mm auto !important;
              box-sizing: border-box !important;
            }
          </style>
        </head>
        <body>${target.outerHTML}</body>
      </html>
    `;

    const started = printHtmlUsingHiddenFrame(printHtml);
    if (!started) {
      toast.error('Nao foi possivel iniciar a impressao nativa do navegador.');
    }
  };

  const resolveTemplateByType = (templates: PrintTemplate[], type: PrintTemplate['type']) => {
    const filtered = templates.filter((template) => template.type === type);
    return filtered.find((template) => template.isDefault) || filtered[0] || null;
  };

  const loadTemplatesFromBackend = async () => {
    try {
      const response = await axios.get('/api/app-state', { params: { keys: 'printTemplates' } });
      const payload = response?.data;
      return Array.isArray(payload?.printTemplates) ? payload.printTemplates as PrintTemplate[] : [];
    } catch (error) {
      console.error('Erro ao carregar templates do backend:', error);
      return [];
    }
  };

  const handleEntryLabelPrint = async () => {
    const backendTemplates = await loadTemplatesFromBackend();
    const templatesSource = backendTemplates.length ? backendTemplates : printTemplates;
    const template = resolveTemplateByType(templatesSource, 'Etiqueta');
    if (!template) {
      toast.error('Nenhum layout de etiqueta salvo em Personalizar Impressao.');
      return;
    }
    setTemplateToPrint(template);
  };

  const handleCupomPrint = async () => {
    const backendTemplates = await loadTemplatesFromBackend();
    const templatesSource = backendTemplates.length ? backendTemplates : printTemplates;
    const template = resolveTemplateByType(templatesSource, 'Cupom');
    if (!template) {
      toast.error('Nenhum layout de cupom salvo em Personalizar Impressao.');
      return;
    }
    setTemplateToPrint(template);
  };

  const handlePDF = async () => {
    const target = osPrintAreaRef.current;
    if (!target) {
      toast.error('Nao foi possivel localizar o layout de impressao.');
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // Use html2canvas cloning step to strip unsupported oklch colors
      const pdfCloneId = `pdf-clone-${os.id}`;
      target.setAttribute('data-pdf-clone-id', pdfCloneId);

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedTarget = clonedDoc.querySelector(`[data-pdf-clone-id="${pdfCloneId}"]`) as HTMLElement | null;
          if (!clonedTarget) {
            return;
          }

          // Drop stylesheets that use oklch and inline computed styles instead.
          clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());

          const originalElements = [target, ...Array.from(target.querySelectorAll('*'))];
          const clonedElements = [clonedTarget, ...Array.from(clonedTarget.querySelectorAll('*'))];
          const safeFallbacks: Record<string, string> = {
            color: '#000000',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            fill: '#000000',
            stroke: '#000000',
          };

          originalElements.forEach((originalEl, index) => {
            const clonedEl = clonedElements[index] as HTMLElement | undefined;
            if (!clonedEl) {
              return;
            }

            const computed = window.getComputedStyle(originalEl as Element);
            for (let i = 0; i < computed.length; i += 1) {
              const prop = computed[i];
              let val = computed.getPropertyValue(prop);
              const priority = computed.getPropertyPriority(prop);

              if (val && val.includes('oklch')) {
                const fallback = safeFallbacks[prop];
                if (fallback) {
                  val = fallback;
                } else {
                  continue;
                }
              }

              if (val) {
                clonedEl.style.setProperty(prop, val, priority);
              }
            }
          });
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      const totalPages = Math.max(1, Math.ceil((imgHeight - 1) / pageHeight));

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);

      for (let page = 1; page < totalPages; page += 1) {
        const position = -pageHeight * page;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      }

      pdf.save(`os-${os.number}.pdf`);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Falha ao gerar o PDF.');
    } finally {
      target.removeAttribute('data-pdf-clone-id');
      setIsGeneratingPdf(false);
    }
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

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      toast.error('Informe o motivo do cancelamento.');
      return;
    }
    const now = new Date().toISOString();
    setAllOrders(prev => prev.map(o => o.id === osId ? {
      ...o,
      status: 'Cancelada' as OSStatus,
      subStatus: '',
      cancellationReason: cancelReason.trim(),
      cancellationDate: now,
      updatedAt: now,
    } : o));
    setStatus('Cancelada');
    setShowCancelDialog(false);
    setCancelReason('');
    setIsUpdating(false);
    toast.success('OS cancelada com sucesso.');
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

  const normalizeValue = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const customerRecord =
    globalCustomers.find((customer) => customer.id === os.customerId) ||
    globalCustomers.find((customer) => normalizeValue(customer.name || '') === normalizeValue(os.customerName || ''));

  const parseDateTime = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const timeline = [
    {
      date: parseDateTime(os.updatedAt),
      user: os.technicianName || teamUsers.find((member) => member.id === os.technicianId)?.name || 'Sistema',
      action: `Status atual: ${os.status}`,
      detail: os.subStatus ? `Substatus: ${os.subStatus}` : 'Última atualização registrada da ordem.',
    },
    os.diagnosisDate
      ? {
          date: parseDateTime(os.diagnosisDate),
          user: os.technicianName || teamUsers.find((member) => member.id === os.technicianId)?.name || 'Técnico',
          action: 'Diagnóstico registrado',
          detail: os.diagnosis || 'Diagnóstico salvo sem detalhes.',
        }
      : null,
    os.completionDeadline
      ? {
          date: parseDateTime(os.completionDeadline),
          user: 'Sistema',
          action: 'Prazo de conclusão definido',
          detail: parseDateTime(os.completionDeadline)
            ? `Prazo previsto para ${format(parseDateTime(os.completionDeadline) as Date, 'dd/MM/yyyy')}.`
            : 'Prazo de conclusão configurado na ordem.',
        }
      : null,
    {
      date: parseDateTime(os.createdAt),
      user: 'Sistema',
      action: 'OS Aberta',
      detail: 'Entrada do equipamento registrada no sistema.',
    },
  ]
    .filter((entry): entry is { date: Date | null; user: string; action: string; detail: string } => !!entry)
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
    .map((entry) => ({
      ...entry,
      date: entry.date ? format(entry.date, 'dd/MM/yyyy HH:mm') : 'Data indisponível',
    }));

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
            <Printer className="w-4 h-4" /> Imprimir A4
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleEntryLabelPrint}>
            <Tag className="w-4 h-4" /> Imprimir Etiqueta Entrada
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCupomPrint}>
            <Receipt className="w-4 h-4" /> Cupom Nao Fiscal (Status Atual)
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
                          <Select value={status} onValueChange={(value) => setStatus(value || '')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o novo status" />
                            </SelectTrigger>
                            <SelectContent>
                              {orderedStatusColumns.map(statusOption => (
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

                      {isWaitingPartsStatus && (
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
                          <div className="mt-3 space-y-2">
                            <Label className="text-xs font-bold uppercase text-amber-800">Instituição / Tipo de Compra</Label>
                            <Select
                              value={selectedWaitingPartOptionId}
                              onValueChange={(value) => {
                                setSelectedWaitingPartOptionId(value);
                                const selected = waitingPartOptions.find((item) => item.id === value);
                                if (!selected) return;
                                const nextDate = addDays(new Date(), Math.max(0, Number(selected.deadlineDays || 0)));
                                setCompletionDate(format(nextDate, 'yyyy-MM-dd'));
                              }}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione origem da peça para aplicar prazo..." />
                              </SelectTrigger>
                              <SelectContent>
                                {waitingPartOptions.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.institutionName} {item.purchaseType ? `• ${item.purchaseType}` : ''} ({item.deadlineDays} dias)
                                  </SelectItem>
                                ))}
                                {waitingPartOptions.length === 0 && (
                                  <SelectItem value="none" disabled>Nenhum padrão cadastrado em Configurações</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
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
                        if (status === 'Cancelada') {
                          setShowCancelDialog(true);
                          return;
                        }
                        if (isWaitingPartsStatus && waitingPartOptions.length > 0 && !selectedWaitingPartOptionId) {
                          toast.error('Selecione a instituição/tipo de compra para aplicar o prazo de aguardando peça.');
                          return;
                        }
                        const now = new Date().toISOString();
                        const selectedWaiting = waitingPartOptions.find((item) => item.id === selectedWaitingPartOptionId);
                        const resolvedSubStatus = isWaitingPartsStatus && selectedWaiting
                          ? `${selectedWaiting.institutionName}${selectedWaiting.purchaseType ? ` - ${selectedWaiting.purchaseType}` : ''}`
                          : subStatus;
                        const resolvedCompletionDeadline = completionDate
                          ? new Date(`${completionDate}T12:00:00`).toISOString()
                          : undefined;
                        setAllOrders(prev => prev.map(o => o.id === osId ? {
                          ...o,
                          status: status as OSStatus,
                          subStatus: resolvedSubStatus,
                          completionDeadline: resolvedCompletionDeadline ?? o.completionDeadline,
                          cancellationReason: undefined,
                          cancellationDate: undefined,
                          updatedAt: now,
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
                  <p className="text-xs text-muted-foreground">Cliente identificado por nome</p>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <MessageSquare className="w-3 h-3 text-muted-foreground" />
                  <span>{customerRecord?.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <span>{customerRecord?.document || 'Não informado'}</span>
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
                      const now = new Date().toISOString();
                      setAllOrders(prev => prev.map(o => o.id === osId ? { 
                        ...o, 
                        status: 'Entregue' as OSStatus, 
                        paymentStatus: 'Pago',
                        paymentDate: now,
                        updatedAt: now 
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

          <Dialog open={showCancelDialog} onOpenChange={(open) => {
            setShowCancelDialog(open);
            if (!open) {
              setCancelReason('');
              if (os.status !== 'Cancelada' && status === 'Cancelada') {
                setStatus(os.status);
              }
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cancelar Ordem de Serviço</DialogTitle>
                <DialogDescription>Informe o motivo do cancelamento para análise no dashboard.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label>Motivo do Cancelamento</Label>
                <textarea
                  className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Descreva o motivo do cancelamento..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>Voltar</Button>
                <Button variant="destructive" onClick={handleConfirmCancel}>Confirmar Cancelamento</Button>
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

      <div className="hidden">
        <OSPrintContentForRef ref={osPrintAreaRef} os={os} company={company} customer={customerRecord} />
      </div>

      {templateToPrint && (
        <DynamicPrintView
          template={templateToPrint}
          data={os}
          company={company}
          onClose={() => setTemplateToPrint(null)}
        />
      )}


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

  const openOrders = myOrders.filter(o => o.status !== 'Finalizada' && o.status !== 'Cancelada' && o.status !== 'Entregue' && o.status !== 'Reprovado');
  const monthDone = myOrders.filter(o => o.status === 'Finalizada' || o.status === 'Entregue').length;
  const waitingParts = myOrders.filter(o => o.status === 'Aguardando peça').length;
  const urgentOrders = myOrders.filter(o => o.priority === 'Urgente').length;
  const myOrdersStatusData = [
    { name: 'Em Reparo', value: myOrders.filter(o => o.status === 'Em reparo').length, color: '#3b82f6' },
    { name: 'Testes', value: myOrders.filter(o => o.status === 'Testes finais').length, color: '#8b5cf6' },
    { name: 'Aguardando', value: myOrders.filter(o => o.status === 'Aguardando peça' || o.status === 'Aguardando aprovação').length, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const productivityData = [
    { name: 'Equipe', abertas: allOrders.filter(o => o.status === 'Aberta').length, concluidas: allOrders.filter(o => o.status === 'Finalizada').length },
    { name: 'Minhas', abertas: openOrders.length, concluidas: monthDone },
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
                <Bar dataKey="concluidas" fill="#10b981" radius={[4, 4, 0, 0]} name="Concluídas" />
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
                  data={myOrdersStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {myOrdersStatusData.map((entry, index) => (
                    <Cell key={`tech-status-${index}`} fill={entry.color} />
                  ))}
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
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    if (!activeCompany?.id || !activeCompany?.name) {
      setCompanies([]);
      return;
    }

    setCompanies((prev) => {
      const existing = prev.find((item) => item.id === activeCompany.id);
      const fallbackPlan = activeCompany.subscriptionPlan || 'Basic';
      const nextCompany = {
        id: activeCompany.id,
        name: activeCompany.name,
        cnpj: activeCompany.cnpj || '',
        plan: existing?.plan || fallbackPlan,
        status: 'Ativo',
        users: existing?.users || 0,
        os: allOrders.length,
        fiscal: Boolean(activeCompany.fiscalEnabled),
      };
      return [nextCompany];
    });
  }, [activeCompany, allOrders.length]);

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
              <div className="py-8 text-center text-muted-foreground text-sm">
                Nenhum log global disponível no momento.
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
        <StatCard title="Total de Empresas" value={companies.length.toString()} icon={Building2} color="bg-indigo-500" />
        <StatCard title="Usuários Ativos" value={companies.reduce((sum, item) => sum + Number(item.users || 0), 0).toString()} icon={Users} color="bg-blue-500" />
        <StatCard title="Faturamento SaaS" value="R$ 0,00" icon={DollarSign} color="bg-emerald-500" />
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
  allOrders,
  allProducts,
  salesHistory,
  financeTransactions,
}: { 
  onViewOS: (id: string) => void, 
  onNavigate: (tab: string) => void,
  allOrders: ServiceOrder[],
  allProducts: any[],
  salesHistory: any[],
  financeTransactions: any[],
}) {
  const [hasPlayedAlert, setHasPlayedAlert] = useState(false);

  const parseRecordDate = (value: string) => {
    if (!value) return null;
    if (value.includes('/')) {
      const [day, month, year] = value.split('/').map(Number);
      if (!day || !month || !year) return null;
      return new Date(year, month - 1, day);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const reminders = financeTransactions
    .filter((item) => item.type === 'OUT' || Number(item.val) < 0 || item.status === 'Pendente')
    .map((item) => {
      const dueDate = parseRecordDate(item.date);
      const daysDiff = dueDate ? differenceInDays(startOfDay(dueDate), startOfDay(new Date())) : 999;
      const reminderType = daysDiff < 0 ? 'Atrasado' : daysDiff === 0 ? 'Vencendo Hoje' : 'Programado';
      return {
        id: item.id,
        type: reminderType,
        desc: item.desc,
        val: Math.abs(Number(item.val) || 0),
        date: item.date,
        entity: item.category || 'Financeiro',
        sortValue: dueDate?.getTime() || Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => a.sortValue - b.sortValue)
    .slice(0, 5);

  const canceledOrders = allOrders.filter((order) => order.status === 'Cancelada');
  const rejectedOrders = allOrders.filter((order) => order.status === 'Reprovado');
  const canceledThisMonth = canceledOrders.filter((order) => {
    const parsed = parseRecordDate(order.cancellationDate || order.updatedAt || order.createdAt);
    if (!parsed) return false;
    const now = new Date();
    return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
  }).length;
  const rejectedThisMonth = rejectedOrders.filter((order) => {
    const parsed = parseRecordDate(order.rejectionDate || order.updatedAt || order.createdAt);
    if (!parsed) return false;
    const now = new Date();
    return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
  }).length;

  const cancelReasonSummary = Object.entries(
    canceledOrders.reduce((acc, order) => {
      const reason = (order.cancellationReason || 'Sem motivo informado').trim();
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const rejectionReasonSummary = Object.entries(
    rejectedOrders.reduce((acc, order) => {
      const reason = (order.rejectionReason || 'Sem motivo informado').trim();
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  useEffect(() => {
    if (reminders.length > 0 && !hasPlayedAlert) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log("Audio play blocked by browser", e));
      setHasPlayedAlert(true);
    }
  }, [hasPlayedAlert]);

  const weeklyData = eachDayOfInterval({ start: addDays(startOfDay(new Date()), -6), end: startOfDay(new Date()) }).map((date) => {
    const osCount = allOrders.filter((order) => {
      const createdAt = parseRecordDate(order.createdAt);
      return createdAt ? isSameDay(createdAt, date) : false;
    }).length;

    const salesCount = salesHistory.filter((sale) => {
      const createdAt = parseRecordDate(sale.date);
      return createdAt ? isSameDay(createdAt, date) : false;
    }).length;

    return {
      name: format(date, 'EEE', { locale: ptBR }),
      os: osCount,
      vendas: salesCount,
    };
  });

  const piePalette = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  const pieData = Object.entries(
    allOrders.reduce((acc, order) => {
      const key = order.equipment || 'Não informado';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], index) => ({ name, value, color: piePalette[index % piePalette.length] }));

  const financialData = Array.from({ length: 6 }, (_, offset) => {
    const baseDate = addMonths(startOfMonth(new Date()), offset - 5);
    const monthTransactions = financeTransactions.filter((item) => {
      const parsed = parseRecordDate(item.date);
      return parsed && parsed.getMonth() === baseDate.getMonth() && parsed.getFullYear() === baseDate.getFullYear();
    });
    const receita = monthTransactions
      .filter((item) => item.type === 'IN' || Number(item.val) > 0)
      .reduce((acc, item) => acc + Math.abs(Number(item.val) || 0), 0);
    const despesa = monthTransactions
      .filter((item) => item.type === 'OUT' || Number(item.val) < 0)
      .reduce((acc, item) => acc + Math.abs(Number(item.val) || 0), 0);

    return {
      name: format(baseDate, 'MMM', { locale: ptBR }),
      receita,
      despesa,
      lucro: receita - despesa,
    };
  });

  const monthlyRevenue = financeTransactions
    .filter((item) => {
      const parsed = parseRecordDate(item.date);
      return parsed && parsed.getMonth() === new Date().getMonth() && parsed.getFullYear() === new Date().getFullYear() && (item.type === 'IN' || Number(item.val) > 0);
    })
    .reduce((acc, item) => acc + Math.abs(Number(item.val) || 0), 0);

  const todaySalesCount = salesHistory.filter((sale) => {
    const parsed = parseRecordDate(sale.date);
    return parsed ? isToday(parsed) : false;
  }).length;

  const lowStockCount = allProducts.filter((product) => product.stock <= (product.min ?? product.minStock ?? 0)).length;

  const recentTransactions = financeTransactions
    .slice()
    .sort((a, b) => {
      const aTime = parseRecordDate(a.date)?.getTime() || 0;
      const bTime = parseRecordDate(b.date)?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      date: item.date || '-',
      type: item.type === 'OUT' || Number(item.val) < 0 ? 'Despesa' : 'Venda',
      desc: item.desc || item.description || 'Sem descrição',
      client: item.customer || item.category || '-',
      method: item.method || item.status || '-',
      val: Math.abs(Number(item.val) || 0),
    }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo da sua assistência hoje.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard title="OS Abertas" value={allOrders.filter(o => o.status === 'Aberta').length.toString()} icon={Wrench} trend={12} color="bg-blue-500" description="Total de ordens de serviço em andamento no sistema." />
        <StatCard title="Faturamento Mensal" value={`R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} trend={monthlyRevenue > 0 ? 8 : 0} color="bg-emerald-500" description="Soma das entradas registradas no financeiro neste mês." />
        <StatCard title="Prontas / Retirada" value={allOrders.filter(o => o.status === 'Pronta').length.toString()} icon={CheckCircle2} color="bg-emerald-600" description="Equipamentos aguardando o cliente retirar." />
        <StatCard title="Entregue p/ Conferência" value={allOrders.filter(o => o.status === 'Entregue').length.toString()} icon={ShieldCheck} color="bg-amber-500" description="OS entregues que aguardam conferência administrativa." />
        <StatCard title="Vendas Hoje" value={todaySalesCount.toString()} icon={ShoppingCart} trend={todaySalesCount > 0 ? todaySalesCount : 0} color="bg-indigo-500" description="Quantidade de vendas registradas hoje no banco de dados." />
        <StatCard title="Estoque Baixo" value={lowStockCount.toString()} icon={Package} color="bg-rose-500" description="Produtos com quantidade abaixo do limite mínimo." />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Motivos de Cancelamento</CardTitle>
            <CardDescription>{canceledOrders.length} canceladas no total • {canceledThisMonth} neste mês</CardDescription>
          </CardHeader>
          <CardContent>
            {cancelReasonSummary.length > 0 ? (
              <div className="space-y-2">
                {cancelReasonSummary.map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between text-sm">
                    <span className="truncate">{reason}</span>
                    <Badge variant="outline" className="text-[10px]">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma OS cancelada registrada.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Motivos de Reprovação de Orçamento</CardTitle>
            <CardDescription>{rejectedOrders.length} reprovados no total • {rejectedThisMonth} neste mês</CardDescription>
          </CardHeader>
          <CardContent>
            {rejectionReasonSummary.length > 0 ? (
              <div className="space-y-2">
                {rejectionReasonSummary.map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between text-sm">
                    <span className="truncate">{reason}</span>
                    <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum orçamento reprovado registrado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Movimentação Semanal</CardTitle>
            <CardDescription>Comparativo entre Ordens de Serviço e Vendas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
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
                {allOrders.filter((os: ServiceOrder) => os.status === 'Pronta').map((os) => (
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
                {allOrders.filter((os: ServiceOrder) => os.status === 'Pronta').length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8 italic">Nenhum equipamento pronto no momento.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OSPrintView({
  os,
  onClose,
  company,
  autoAction = null,
}: {
  os: ServiceOrder;
  onClose: () => void;
  company: Company;
  autoAction?: 'print' | 'pdf' | null;
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const autoTriggered = useRef(false);
  const printPreviewHostRef = useRef<HTMLDivElement | null>(null);
  const printPreviewAreaRef = useRef<HTMLDivElement | null>(null);
  const [printPreviewScale, setPrintPreviewScale] = useState(1);
  const [printPreviewAreaSize, setPrintPreviewAreaSize] = useState({ width: 0, height: 0 });
  const orderTotalValue = getOrderTotalValue(os);
  const pixPayload = buildPixPayload({
    key: company.pixKey || '',
    keyType: company.pixKeyType,
    amount: orderTotalValue,
    merchantName: company.name || company.razaoSocial || 'TechManager',
    merchantCity: company.address || 'Sao Paulo',
    txid: os.number.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***',
  });
  const pixQrCodeCandidates = useMemo(
    () => (pixPayload ? buildQrCodeCandidates(pixPayload, 180) : []),
    [pixPayload]
  );
  const [pixQrCandidateIndex, setPixQrCandidateIndex] = useState(0);

  useEffect(() => {
    setPixQrCandidateIndex(0);
  }, [pixPayload]);

  const handlePrint = () => {
    const target = document.getElementById('os-print-area');
    if (!target) {
      toast.error('Nao foi possivel localizar o layout de impressao.');
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n');

    const printHtml = `
      <!doctype html>
      <html>
        <head>
          <title>${os.number}</title>
          ${styles}
          <style>
            @page { size: A4; margin: 0; }
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            #os-print-area {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              background: #ffffff !important;
              color: #000000 !important;
              overflow: hidden !important;
            }
            .os-print-page-inner {
              width: 198mm !important;
              min-height: 285mm !important;
              margin: 6mm auto !important;
              box-sizing: border-box !important;
            }
          </style>
        </head>
        <body>${target.outerHTML}</body>
      </html>
    `;

    const started = printHtmlUsingHiddenFrame(printHtml);
    if (!started) {
      toast.error('Nao foi possivel iniciar a impressao nativa do navegador.');
    }
  };

  const handleDownloadPDF = async () => {
    const target = document.getElementById('os-print-area');
    if (!target) {
      toast.error('Nao foi possivel localizar o layout de impressao.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      let remainingHeight = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(`os-${os.number}.pdf`);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Falha ao gerar o PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (!autoAction || autoTriggered.current) return;
    autoTriggered.current = true;
    if (autoAction === 'pdf') {
      handleDownloadPDF();
      return;
    }
    if (autoAction === 'print') {
      setTimeout(() => handlePrint(), 150);
    }
  }, [autoAction]);

  useEffect(() => {
    const updateScale = () => {
      const hostWidth = printPreviewHostRef.current?.clientWidth || 0;
      const hostHeight = printPreviewHostRef.current?.clientHeight || 0;
      const contentWidth = printPreviewAreaRef.current?.scrollWidth || 0;
      const contentHeight = printPreviewAreaRef.current?.scrollHeight || 0;
      if (!hostWidth || !hostHeight || !contentWidth || !contentHeight) return;

      const nextScale = Math.min(
        1,
        Math.max(
          0.25,
          Math.min((hostWidth - 24) / contentWidth, (hostHeight - 24) / contentHeight)
        )
      );

      setPrintPreviewAreaSize({ width: contentWidth, height: contentHeight });
      setPrintPreviewScale(nextScale);
    };

    updateScale();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScale) : null;
    if (observer && printPreviewHostRef.current) {
      observer.observe(printPreviewHostRef.current);
    }
    if (observer && printPreviewAreaRef.current) {
      observer.observe(printPreviewAreaRef.current);
    }
    window.addEventListener('resize', updateScale);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [company.osCopiesPerPage, os.id, os.items?.length, os.diagnosis, os.defect]);

  const OSContent = () => (
    <div
      className="bg-white text-black font-sans flex flex-col os-print-page-inner"
      style={{ width: `${OS_PRINT_INNER_WIDTH_MM}mm`, minHeight: `${OS_PRINT_INNER_HEIGHT_MM}mm`, margin: '6mm auto' }}
    >
      {/* Header */}
      <div className="flex flex-row justify-between items-start gap-3 border-b-2 border-black pb-3 mb-3">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
            {company.logo ? (
              <img src={company.logo} alt={company.name || 'Logo'} className="w-full h-full object-contain bg-white" />
            ) : (
              'TM'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">{company.name}</h1>
            <p className="text-xs uppercase font-bold text-gray-600">{company.address}</p>
            <p className="text-xs font-bold text-gray-600">{company.cnpj} • {company.phone}</p>
            <p className="text-[10px] font-bold text-gray-600">{company.email || '--'}</p>
          </div>
        </div>
        <div className="text-right shrink-0 w-auto">
          <div className="bg-black text-white px-4 py-2 mb-2 block w-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Ordem de Serviço</p>
            <p className="text-xl font-black">{os.number}</p>
          </div>
          <p className="text-[10px] font-bold text-gray-600 italic">Data de Entrada: {format(new Date(os.createdAt), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </div>

      {/* Customer + Equipment + PIX */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-5 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-gray-200 pb-1">Dados do Cliente</h3>
          <div>
            <p className="text-sm font-black">{os.customerName}</p>
            <p className="text-xs text-gray-600">Cliente registrado por nome</p>
          </div>
        </div>
        <div className="col-span-4 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-gray-200 pb-1">Equipamento</h3>
          <div>
            <p className="text-sm font-black">{os.equipment}</p>
            <p className="text-xs text-gray-600">{os.brand} {os.model}</p>
            <p className="text-xs text-gray-600 font-mono">S/N: {os.serialNumber}</p>
          </div>
        </div>
        <div className="col-span-3 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-gray-200 pb-1">PIX</h3>
          <div className="border rounded-xl p-2">
            {pixPayload ? (
              <>
                <img
                  src={pixQrCodeCandidates[pixQrCandidateIndex] || ''}
                  alt="QRCode PIX"
                  className="w-[78px] h-[78px] border ml-auto my-1"
                  onError={() => {
                    setPixQrCandidateIndex((prev) => (prev + 1 < pixQrCodeCandidates.length ? prev + 1 : prev));
                  }}
                />
                <p className="text-[9px] uppercase font-bold text-right">Tipo: {company.pixKeyType || 'PIX'}</p>
                <p className="text-[9px] font-mono text-right break-all">Chave: {formatPixKeyPreview(company.pixKey || '', company.pixKeyType)}</p>
              </>
            ) : (
              <p className="text-[10px] text-right text-gray-500">Configure a chave PIX em Dados da Empresa</p>
            )}
          </div>
        </div>
      </div>

      {/* Defect & Diagnosis */}
      <div className="space-y-3 mb-4">
        <div className="p-3 border rounded-xl">
          <h3 className="text-xs font-black uppercase tracking-widest mb-2">Defeito Informado</h3>
          <p className="text-sm italic text-gray-700">"{os.defect}"</p>
        </div>
        {os.diagnosis && (
          <div className="p-3 border border-black/10 rounded-xl">
            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Diagnóstico Técnico</h3>
            <p className="text-sm">{os.diagnosis}</p>
          </div>
        )}
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="border rounded-xl p-2 text-center">
          <p className="text-[9px] uppercase font-bold text-gray-500 mb-1 leading-none">Status</p>
          <p className="text-sm font-black">{os.status}</p>
        </div>
        <div className="border rounded-xl p-2 text-center">
          <p className="text-[9px] uppercase font-bold text-gray-500 mb-1 leading-none">Prioridade</p>
          <p className="text-sm font-black">{os.priority}</p>
        </div>
        <div className="border rounded-xl p-2 text-center">
          <p className="text-[9px] uppercase font-bold text-gray-500 mb-1 leading-none">Prazo Diag.</p>
          <p className="text-sm font-black">
            {os.diagnosisDeadline ? format(new Date(os.diagnosisDeadline), 'dd/MM/yyyy') : '--/--/----'}
          </p>
        </div>
        <div className="border rounded-xl p-2 text-center">
          <p className="text-[9px] uppercase font-bold text-gray-500 mb-1 leading-none">Prazo Entrega</p>
          <p className="text-sm font-black">
            {os.completionDeadline ? format(new Date(os.completionDeadline), 'dd/MM/yyyy') : '--/--/----'}
          </p>
        </div>
      </div>

      {/* Items / Parts / Services */}
      <div className="mb-4 border rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-full">
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
                <td className="px-4 py-3 font-medium">
                  {item.description}
                  {item.type === 'Serviço' && item.executionTimeValue && item.executionTimeUnit && (
                    <div className="text-[9px] text-gray-500">Prazo: {item.executionTimeValue} {item.executionTimeUnit}</div>
                  )}
                </td>
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
              <td className="px-4 py-3 text-right text-lg">R$ {orderTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Terms & Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-5">
        <div className="space-y-2">
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
      <div className="mt-auto text-center border-t pt-3">
        <p className="text-[10px] text-gray-400">Este documento é uma representação digital da Ordem de Serviço {os.number}. Gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}.</p>
      </div>
    </div>
  );

  return (
    <Dialog open={!!os} onOpenChange={() => onClose()}>
      <DialogContent className="w-[98vw] max-w-[1200px] max-h-[98vh] overflow-hidden p-0 border-none bg-gray-100">
        <div ref={printPreviewHostRef} className="h-[calc(98vh-88px)] overflow-auto p-4 flex justify-center">
          <div
            className="mx-auto"
            style={{
              width: `${(printPreviewAreaSize.width || 794) * printPreviewScale}px`,
              minHeight: `${(printPreviewAreaSize.height || 1123) * printPreviewScale}px`,
            }}
          >
            <div style={{ transform: `scale(${printPreviewScale})`, transformOrigin: 'top center' }}>
              <div
                id="os-print-area"
                ref={printPreviewAreaRef}
                className="bg-white text-black shadow-sm"
                style={{ width: '210mm', height: '297mm', padding: 0, boxSizing: 'border-box', overflow: 'hidden' }}
              >
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
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-100 border-t flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button variant="outline" className="gap-2" onClick={handleDownloadPDF} disabled={isGeneratingPdf}>
            <Download className="w-4 h-4" /> {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF'}
          </Button>
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
    'Cancelada': { color: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: XCircle, label: 'CANCELADA' },
    'Reprovado': { color: 'bg-red-500/10 text-red-700 border-red-300', icon: XCircle, label: 'REPROVADO' }
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
  setEquipmentTypes,
  globalCustomers,
  setGlobalCustomers,
  setAllOrders,
  printTemplates,
  company,
  holidayCalendar,
  setHolidayCalendar
}: { 
  onViewOS: (id: string) => void, 
  allOrders: ServiceOrder[], 
  sortOrder: 'number' | 'date' | 'priority',
  teamUsers: User[],
  user: User | null,
  equipmentTypes: EquipmentType[],
  setEquipmentTypes: React.Dispatch<React.SetStateAction<EquipmentType[]>>,
  globalCustomers: Array<{ id: string; name: string; doc?: string; phone?: string; email?: string }>,
  setGlobalCustomers: React.Dispatch<React.SetStateAction<any[]>>,
  setAllOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>,
  printTemplates: PrintTemplate[],
  company: Company,
  holidayCalendar: HolidayCalendarCache,
  setHolidayCalendar: React.Dispatch<React.SetStateAction<HolidayCalendarCache>>
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [quickCustomer, setQuickCustomer] = useState({
    name: '',
    doc: '',
    ie: '',
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
  const [isQuickCustomerCepLookupLoading, setIsQuickCustomerCepLookupLoading] = useState(false);
  const lastQuickCustomerCepLookupRef = useRef('');
  const [newOSTechnicianId, setNewOSTechnicianId] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [showPostSavePrintDialog, setShowPostSavePrintDialog] = useState(false);
  const [lastCreatedOS, setLastCreatedOS] = useState<ServiceOrder | null>(null);
  const [printCheckboxes, setPrintCheckboxes] = useState({
    label: true,
    entry: true,
    warranty: false
  });
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isDirectPrinting, setIsDirectPrinting] = useState(false);
  const [directPrintTargets, setDirectPrintTargets] = useState({
    label: '',
    entry: '',
    warranty: '',
  });
  const [filterField, setFilterField] = useState<'status' | 'nome' | 'data' | 'os' | 'equipamento' | 'marca' | 'modelo'>('nome');
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRejectionDialog, setIsRejectionDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [selectedOSForA4Print, setSelectedOSForA4Print] = useState<ServiceOrder | null>(null);
  const [selectedOSForA4Action, setSelectedOSForA4Action] = useState<'print' | 'pdf' | null>(null);
  const [selectedOSForTemplatePrint, setSelectedOSForTemplatePrint] = useState<ServiceOrder | null>(null);
  const [isPrintTemplateDialogOpen, setIsPrintTemplateDialogOpen] = useState(false);
  const [isTemplatePreviewOpen, setIsTemplatePreviewOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const directA4PrintRef = useRef<HTMLDivElement | null>(null);
  const holidayFetchInFlightYearsRef = useRef<Set<number>>(new Set());
  const holidayCalendarRef = useRef<HolidayCalendarCache>(holidayCalendar);
  const orderedStatusColumns = useMemo(() => {
    if (company.osStatuses && company.osStatuses.length > 0) {
      return [...company.osStatuses]
        .sort((a, b) => a.order - b.order)
        .map((item) => item.name as OSStatus);
    }
    return STATUS_COLUMNS;
  }, [company.osStatuses]);

  useEffect(() => {
    holidayCalendarRef.current = holidayCalendar;
  }, [holidayCalendar]);

  const ensureHolidayYearCache = async (year: number): Promise<HolidayApiItem[]> => {
    const yearKey = String(year);
    const cached = holidayCalendarRef.current[yearKey];
    if (cached?.holidays?.length) {
      return cached.holidays;
    }

    if (holidayFetchInFlightYearsRef.current.has(year)) {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 100));
        const refreshed = holidayCalendarRef.current[yearKey];
        if (refreshed?.holidays) return refreshed.holidays;
      }
      return [];
    }

    holidayFetchInFlightYearsRef.current.add(year);
    try {
      const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`);
      const payload = Array.isArray(response.data) ? response.data : [];
      const holidays: HolidayApiItem[] = payload
        .map((item: any) => ({
          date: String(item?.date || '').slice(0, 10),
          name: String(item?.name || 'Feriado'),
          type: String(item?.type || 'national'),
        }))
        .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date));

      setHolidayCalendar((prev) => {
        const next = {
          ...prev,
          [yearKey]: {
            fetchedAt: new Date().toISOString(),
            holidays,
          },
        };
        holidayCalendarRef.current = next;
        return next;
      });
      return holidays;
    } catch (error) {
      console.error(`Erro ao carregar feriados de ${year}:`, error);
      toast.error(`Não foi possível consultar os feriados de ${year}.`);
      return [];
    } finally {
      holidayFetchInFlightYearsRef.current.delete(year);
    }
  };

  const pushDeadlineIfHoliday = async (baseDate: Date) => {
    let deadline = new Date(baseDate);
    for (let guard = 0; guard < 20; guard += 1) {
      const holidays = await ensureHolidayYearCache(deadline.getFullYear());
      const holidaySet = new Set(holidays.map((item) => item.date));
      const deadlineKey = format(deadline, 'yyyy-MM-dd');
      if (!holidaySet.has(deadlineKey)) {
        return deadline;
      }
      deadline = addDays(deadline, 1);
    }
    return deadline;
  };

  const parseTimeToMinutes = (value?: string, fallback = '08:00') => {
    const text = String(value || fallback);
    const [h, m] = text.split(':').map((part) => Number(part));
    const hours = Number.isFinite(h) ? Math.min(Math.max(h, 0), 23) : 0;
    const minutes = Number.isFinite(m) ? Math.min(Math.max(m, 0), 59) : 0;
    return hours * 60 + minutes;
  };

  const getBusinessScheduleForDate = async (date: Date) => {
    const day = date.getDay();
    const isSaturday = day === 6;
    const isSunday = day === 0;
    const weekdayEnabled = (company.businessHoursWeekdays || []).includes(day);
    const openWeekday = isSunday
      ? company.businessHoursSundayEnabled === true
      : isSaturday
        ? company.businessHoursSaturdayEnabled !== false
        : weekdayEnabled;

    const baseStart = isSunday
      ? (company.businessHoursSundayStart || '00:00')
      : isSaturday
        ? (company.businessHoursSaturdayStart || '08:30')
        : (company.businessHoursStart || '08:30');
    const baseEnd = isSunday
      ? (company.businessHoursSundayEnd || '00:00')
      : isSaturday
        ? (company.businessHoursSaturdayEnd || '12:30')
        : (company.businessHoursEnd || '18:00');

    const breakEnabled = (company.businessHoursBreakWeekdays || []).includes(day);
    const breakStart = company.businessHoursBreakStart || '12:00';
    const breakEnd = company.businessHoursBreakEnd || '13:30';

    let open = openWeekday;
    let startValue = baseStart;
    let endValue = baseEnd;
    let breakStartValue = breakStart;
    let breakEndValue = breakEnd;
    let breakActive = breakEnabled;

    const dateKey = format(date, 'yyyy-MM-dd');
    const override = company.holidayWorkOverrides?.[dateKey];
    const holidayClosed = company.businessHoursHolidayClosed !== false;

    if (override) {
      open = override.open;
      startValue = override.start || startValue;
      endValue = override.end || endValue;
      breakActive = override.breakEnabled ?? breakActive;
      breakStartValue = override.breakStart || breakStartValue;
      breakEndValue = override.breakEnd || breakEndValue;
    } else if (holidayClosed) {
      const holidays = await ensureHolidayYearCache(date.getFullYear());
      const holidaySet = new Set(holidays.map((item) => item.date));
      if (holidaySet.has(dateKey)) {
        open = false;
      }
    }

    return {
      open,
      startMinutes: parseTimeToMinutes(startValue, '08:00'),
      endMinutes: parseTimeToMinutes(endValue, '18:00'),
      breakEnabled: breakActive,
      breakStartMinutes: parseTimeToMinutes(breakStartValue, '12:00'),
      breakEndMinutes: parseTimeToMinutes(breakEndValue, '13:30'),
    };
  };

  const adjustDeadlineToBusinessHours = async (baseDate: Date) => {
    if (!company.businessHoursEnabled) {
      return pushDeadlineIfHoliday(baseDate);
    }

    const desiredMinutes = baseDate.getHours() * 60 + baseDate.getMinutes();
    let deadline = new Date(baseDate);

    for (let guard = 0; guard < 30; guard += 1) {
      const schedule = await getBusinessScheduleForDate(deadline);
      if (!schedule.open) {
        const nextDay = addDays(startOfDay(deadline), 1);
        deadline = new Date(nextDay);
        deadline.setHours(Math.floor(desiredMinutes / 60), desiredMinutes % 60, 0, 0);
        continue;
      }

      const minutes = deadline.getHours() * 60 + deadline.getMinutes();
      let adjustedMinutes = minutes;

      if (minutes < schedule.startMinutes) adjustedMinutes = schedule.startMinutes;
      if (minutes > schedule.endMinutes) adjustedMinutes = schedule.endMinutes;
      if (schedule.breakEnabled && adjustedMinutes > schedule.breakStartMinutes && adjustedMinutes < schedule.breakEndMinutes) {
        adjustedMinutes = schedule.breakStartMinutes;
      }

      const adjusted = new Date(deadline);
      adjusted.setHours(Math.floor(adjustedMinutes / 60), adjustedMinutes % 60, 0, 0);
      return adjusted;
    }

    return deadline;
  };

  useEffect(() => {
    if (!showPostSavePrintDialog) return;
    let cancelled = false;

    const loadPrinters = async () => {
      try {
        setIsLoadingPrinters(true);
        const response = await axios.get('/api/system/printers');
        const printers = Array.isArray(response.data?.printers) ? response.data.printers as string[] : [];
        if (cancelled) return;
        setAvailablePrinters(printers);
        setDirectPrintTargets((prev) => ({
          label: prev.label || printers[0] || '',
          entry: prev.entry || printers[0] || '',
          warranty: prev.warranty || printers[0] || '',
        }));
      } catch {
        if (!cancelled) {
          setAvailablePrinters([]);
          toast.error('Não foi possível carregar as impressoras do sistema.');
        }
      } finally {
        if (!cancelled) setIsLoadingPrinters(false);
      }
    };

    loadPrinters();
    return () => {
      cancelled = true;
    };
  }, [showPostSavePrintDialog]);

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

  const handleEntryLabelPrint = (os: ServiceOrder) => {
    const labelTemplates = printTemplates.filter((template) => template.type === 'Etiqueta');
    const template =
      labelTemplates.find((item) => item.isDefault) ||
      labelTemplates.find((item) => /entrada|o\.?s|ordem/i.test(item.name || '')) ||
      labelTemplates[0];

    if (!template) {
      toast.error('Nenhum layout de etiqueta salvo em Personalizar Impressão.');
      return;
    }

    setSelectedOSForTemplatePrint(os);
    setSelectedTemplateId(template.id);
    setIsPrintTemplateDialogOpen(false);
    setIsTemplatePreviewOpen(true);
  };

  const handleA4Print = (os: ServiceOrder) => {
    setSelectedOSForA4Action('print');
    setSelectedOSForA4Print(os);
  };

  const handleA4Pdf = (os: ServiceOrder) => {
    setSelectedOSForA4Action('pdf');
    setSelectedOSForA4Print(os);
  };

  const parseOrderDate = (value?: string) => {
    if (!value) return null;
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct;
    if (value.includes('/')) {
      const [day, month, year] = value.split('/').map(Number);
      if (!day || !month || !year) return null;
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const openCancelDialog = (osId: string) => {
    setCancelTargetId(osId);
    setCancelReason('');
    setIsRejectionDialog(false);
    setIsCancelDialogOpen(true);
  };

  const openRejectionDialog = (osId: string) => {
    setCancelTargetId(osId);
    setCancelReason('');
    setIsRejectionDialog(true);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (!cancelTargetId) return;
    if (!cancelReason.trim()) {
      toast.error(isRejectionDialog ? 'Informe o motivo da reprovação.' : 'Informe o motivo do cancelamento.');
      return;
    }
    const now = new Date().toISOString();
    if (isRejectionDialog) {
      let chargedCount = 0;
      setAllOrders((prev) => prev.map((order) =>
        order.id === cancelTargetId
          ? (() => {
              const equipmentName = String(order.equipment || '').trim().toUpperCase();
              const eqConfig = equipmentTypes.find((eq) => String(eq.name || '').trim().toUpperCase() === equipmentName);
              const shouldChargeDiagnosis = Boolean(eqConfig?.chargeDiagnosisOnRejection && Number(eqConfig?.diagnosisChargeValue || 0) > 0);
              const diagnosisCharge = shouldChargeDiagnosis ? Math.max(0, Number(eqConfig?.diagnosisChargeValue || 0)) : 0;

              if (shouldChargeDiagnosis) chargedCount += 1;

              const nextItems = shouldChargeDiagnosis
                ? [
                    ...(order.items || []),
                    {
                      id: safeRandomUUID(),
                      description: 'TAXA DE DIAGNOSTICO (REPROVACAO DE ORCAMENTO)',
                      quantity: 1,
                      unitPrice: diagnosisCharge,
                      totalPrice: diagnosisCharge,
                      type: 'Serviço' as const,
                    },
                  ]
                : order.items;

              return {
                ...order,
                status: 'Reprovado' as OSStatus,
                subStatus: '',
                rejectionReason: cancelReason.trim(),
                rejectionDate: now,
                cancellationReason: undefined,
                cancellationDate: undefined,
                items: nextItems,
                value: shouldChargeDiagnosis ? Number(order.value || 0) + diagnosisCharge : order.value,
                updatedAt: now,
              };
            })()
          : order
      ));
      setIsCancelDialogOpen(false);
      setCancelTargetId(null);
      setCancelReason('');
      setIsRejectionDialog(false);
      toast.success(chargedCount > 0 ? 'Orçamento reprovado e taxa de diagnóstico lançada.' : 'Orçamento reprovado registrado.');
      return;
    }
    setAllOrders((prev) => prev.map((order) =>
      order.id === cancelTargetId
        ? {
            ...order,
            status: 'Cancelada',
            subStatus: '',
            cancellationReason: cancelReason.trim(),
            cancellationDate: now,
            rejectionReason: undefined,
            rejectionDate: undefined,
            updatedAt: now,
          }
        : order
    ));
    setIsCancelDialogOpen(false);
    setCancelTargetId(null);
    setCancelReason('');
    toast.success('OS cancelada com sucesso.');
  };

  const handleStatusChange = (osId: string, nextStatus: OSStatus) => {
    if (nextStatus === 'Cancelada') {
      openCancelDialog(osId);
      return;
    }
    if (nextStatus === 'Reprovado') {
      openRejectionDialog(osId);
      return;
    }
    const now = new Date().toISOString();
    setAllOrders((prev) => prev.map((order) =>
      order.id === osId
        ? {
            ...order,
            status: nextStatus,
            subStatus: '',
            cancellationReason: undefined,
            cancellationDate: undefined,
            rejectionReason: undefined,
            rejectionDate: undefined,
            updatedAt: now,
          }
        : order
    ));
    toast.success(`Status atualizado para ${nextStatus}.`);
  };

  const handleDeleteOrder = (osId: string) => {
    if (!confirm('Tem certeza que deseja apagar esta OS?')) return;
    setAllOrders((prev) => prev.filter((order) => order.id !== osId));
    toast.success('OS apagada com sucesso.');
  };

  const selectedTemplate = useMemo(
    () => printTemplates.find(t => t.id === selectedTemplateId) || null,
    [printTemplates, selectedTemplateId]
  );
  const [newOsItems, setNewOsItems] = useState<OSItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('0');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemType, setNewItemType] = useState<'Produto' | 'Serviço'>('Produto');
  const [newItemExecTimeValue, setNewItemExecTimeValue] = useState('1');
  const [newItemExecTimeUnit, setNewItemExecTimeUnit] = useState<'Horas' | 'Dias'>('Horas');
  const [newOSEquipmentTypeId, setNewOSEquipmentTypeId] = useState('');
  const [newOSEquipment, setNewOSEquipment] = useState('');
  const [newOSBrand, setNewOSBrand] = useState('');
  const [newOSModel, setNewOSModel] = useState('');
  const [isServiceSuggestionOpen, setIsServiceSuggestionOpen] = useState(false);

  const normalizeUpperText = (value: string) => String(value || '').trim().toUpperCase();

  const brandSuggestions = useMemo(() => {
    const equipmentQuery = normalizeUpperText(newOSEquipment);
    const brandQuery = normalizeUpperText(newOSBrand);
    const unique = new Set<string>();

    const equipmentMatch = equipmentTypes.find((eq) =>
      equipmentQuery ? normalizeUpperText(eq.name) === equipmentQuery : eq.id === newOSEquipmentTypeId
    );
    (equipmentMatch?.brandModels || []).forEach((entry) => {
      const brand = normalizeUpperText(entry.brand);
      if (!brand) return;
      if (brandQuery && !fuzzyMatch(brand, brandQuery)) return;
      unique.add(brand);
    });

    allOrders.forEach((order) => {
      const orderEquipment = normalizeUpperText(order.equipment);
      const orderBrand = normalizeUpperText(order.brand);
      if (!orderBrand) return;
      if (equipmentQuery && !fuzzyMatch(orderEquipment, equipmentQuery)) return;
      if (brandQuery && !fuzzyMatch(orderBrand, brandQuery)) return;
      unique.add(orderBrand);
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b)).slice(0, 20);
  }, [allOrders, equipmentTypes, newOSEquipment, newOSEquipmentTypeId, newOSBrand]);

  const modelSuggestions = useMemo(() => {
    const equipmentQuery = normalizeUpperText(newOSEquipment);
    const brandQuery = normalizeUpperText(newOSBrand);
    const modelQuery = normalizeUpperText(newOSModel);
    const unique = new Set<string>();

    const equipmentMatch = equipmentTypes.find((eq) =>
      equipmentQuery ? normalizeUpperText(eq.name) === equipmentQuery : eq.id === newOSEquipmentTypeId
    );
    (equipmentMatch?.brandModels || []).forEach((entry) => {
      const brand = normalizeUpperText(entry.brand);
      if (brandQuery && !fuzzyMatch(brand, brandQuery)) return;
      (entry.models || []).forEach((model) => {
        const modelUpper = normalizeUpperText(model);
        if (!modelUpper) return;
        if (modelQuery && !fuzzyMatch(modelUpper, modelQuery)) return;
        unique.add(modelUpper);
      });
    });

    allOrders.forEach((order) => {
      const orderEquipment = normalizeUpperText(order.equipment);
      const orderBrand = normalizeUpperText(order.brand);
      const orderModel = normalizeUpperText(order.model);
      if (!orderModel) return;
      if (equipmentQuery && !fuzzyMatch(orderEquipment, equipmentQuery)) return;
      if (brandQuery && !fuzzyMatch(orderBrand, brandQuery)) return;
      if (modelQuery && !fuzzyMatch(orderModel, modelQuery)) return;
      unique.add(orderModel);
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b)).slice(0, 20);
  }, [allOrders, equipmentTypes, newOSEquipment, newOSEquipmentTypeId, newOSBrand, newOSModel]);

  const serviceSuggestions = useMemo(() => {
    const equipmentQuery = normalizeUpperText(newOSEquipment);
    const brandQuery = normalizeUpperText(newOSBrand);
    const modelQuery = normalizeUpperText(newOSModel);
    const descriptionQuery = normalizeUpperText(newItemDesc);

    if (!equipmentQuery && !brandQuery && !modelQuery) return [];

    const map = new Map<string, { description: string; unitPrice: number; occurrences: number; lastUsedAt: string }>();

    const equipmentMatch = equipmentTypes.find((eq) =>
      equipmentQuery ? normalizeUpperText(eq.name) === equipmentQuery : eq.id === newOSEquipmentTypeId
    );
    (equipmentMatch?.services || []).forEach((service) => {
      const description = String(service.description || '').trim();
      if (!description) return;
      if (descriptionQuery && !fuzzyMatch(description, descriptionQuery)) return;
      const key = normalizeUpperText(description);
      if (!map.has(key)) {
        map.set(key, {
          description,
          unitPrice: Number(service.unitPrice) || 0,
          occurrences: 0,
          lastUsedAt: '',
        });
      }
    });

    allOrders.forEach((order) => {
      const orderEquipment = normalizeUpperText(order.equipment);
      const orderBrand = normalizeUpperText(order.brand);
      const orderModel = normalizeUpperText(order.model);
      if (equipmentQuery && !fuzzyMatch(orderEquipment, equipmentQuery)) return;
      if (brandQuery && !fuzzyMatch(orderBrand, brandQuery)) return;
      if (modelQuery && !fuzzyMatch(orderModel, modelQuery)) return;

      (order.items || []).forEach((item) => {
        if (item.type !== 'Serviço') return;
        const description = String(item.description || '').trim();
        if (!description) return;
        if (descriptionQuery && !fuzzyMatch(description, descriptionQuery)) return;

        const key = normalizeUpperText(description);
        const current = map.get(key);
        const itemDate = order.updatedAt || order.createdAt || '';
        const itemUnitPrice = Number(item.unitPrice) || 0;

        if (!current) {
          map.set(key, {
            description,
            unitPrice: itemUnitPrice,
            occurrences: 1,
            lastUsedAt: itemDate,
          });
          return;
        }

        const currentDateMs = current.lastUsedAt ? new Date(current.lastUsedAt).getTime() : 0;
        const itemDateMs = itemDate ? new Date(itemDate).getTime() : 0;
        map.set(key, {
          description: current.description,
          unitPrice: itemDateMs >= currentDateMs ? itemUnitPrice : current.unitPrice,
          occurrences: current.occurrences + 1,
          lastUsedAt: itemDateMs >= currentDateMs ? itemDate : current.lastUsedAt,
        });
      });
    });

    return Array.from(map.values())
      .sort((a, b) => (b.occurrences - a.occurrences) || (new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()))
      .slice(0, 8);
  }, [allOrders, equipmentTypes, newOSEquipment, newOSEquipmentTypeId, newOSBrand, newOSModel, newItemDesc]);

  const addItem = () => {
    if (!newItemDesc.trim()) return;
    const price = Number.parseFloat(newItemPrice) || 0;
    const qty = Math.max(1, Number.parseInt(newItemQty, 10) || 1);
    const execTimeValue = newItemType === 'Serviço'
      ? Math.max(0, Number.parseInt(newItemExecTimeValue, 10) || 0)
      : 0;
    const item: OSItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newItemDesc,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
      type: newItemType,
      executionTimeValue: execTimeValue > 0 ? execTimeValue : undefined,
      executionTimeUnit: execTimeValue > 0 ? newItemExecTimeUnit : undefined
    };
    setNewOsItems([...newOsItems, item]);
    setNewItemDesc('');
    setNewItemPrice('0');
    setNewItemQty('1');
    setNewItemExecTimeValue('1');
    setNewItemExecTimeUnit('Horas');
  };

  const removeItem = (id: string) => {
    setNewOsItems(newOsItems.filter(i => i.id !== id));
  };

  const totalOSValue = newOsItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const filteredCustomers = globalCustomers.filter(c =>
    fuzzyMatch(c.name, customerSearch) ||
    fuzzyMatch(c.doc || '', customerSearch) ||
    fuzzyMatch(c.phone || '', customerSearch) ||
    fuzzyMatch(c.email || '', customerSearch)
  );

  const filteredOrders = allOrders.filter(os => {
    const normalizedQuery = filterQuery.trim();
    const matchesText = (() => {
      if (!normalizedQuery) return true;
      switch (filterField) {
        case 'nome':
          return fuzzyMatch(os.customerName, normalizedQuery);
        case 'os':
          return os.number.toLowerCase().includes(normalizedQuery.toLowerCase());
        case 'equipamento':
          return fuzzyMatch(os.equipment, normalizedQuery);
        case 'marca':
          return fuzzyMatch(os.brand, normalizedQuery);
        case 'modelo':
          return fuzzyMatch(os.model, normalizedQuery);
        case 'data': {
          const filterDate = parseOrderDate(normalizedQuery);
          const createdAt = parseOrderDate(os.createdAt || os.updatedAt);
          if (!filterDate || !createdAt) return false;
          return isSameDay(filterDate, createdAt);
        }
        default:
          return true;
      }
    })();

    const matchesStatus = filterField === 'status'
      ? (statusFilter === 'todos' || os.status === statusFilter)
      : true;

    // Filtro por equipamento permitido para técnicos
    const isTech = user?.role === 'USUARIO';
    const allowedEquipmentNames = equipmentTypes
      .filter(eq => (user?.allowedEquipmentIds || []).includes(eq.id))
      .map(eq => eq.name.toLowerCase());
    
    const matchesEquipPerm = !isTech || allowedEquipmentNames.includes(os.equipment.toLowerCase());
    
    return matchesText && matchesStatus && matchesEquipPerm;
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

  const handleSaveOS = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eqTypeId = newOSEquipmentTypeId || (formData.get('equipmentType') as string);
    const equipment = normalizeUpperText(newOSEquipment || (formData.get('equipment') as string));
    const brand = normalizeUpperText(newOSBrand || (formData.get('brand') as string));
    const model = normalizeUpperText(newOSModel || (formData.get('model') as string));
    const eqType = equipmentTypes.find(et => et.id === eqTypeId);
    const selectedTechnician = teamUsers.find(u => u.id === newOSTechnicianId);

    const now = new Date();
    const baseDiagDays = eqType?.defaultDiagnosisDays || 1;
    const baseCompDays = eqType?.defaultCompletionDays || 3;
    const customerName = customerSearch.trim();
    if (!customerName) {
      toast.error('Informe o nome do cliente para continuar.');
      return;
    }
    if (!equipment) {
      toast.error('Selecione o equipamento para continuar.');
      return;
    }
    const exactCustomer = selectedCustomerId
      ? globalCustomers.find((c) => c.id === selectedCustomerId)
      : globalCustomers.find((c) => c.name.toLowerCase() === customerName.toLowerCase());

    const activeEquipmentLoad = allOrders.filter((order) =>
      String(order.equipment || '').toUpperCase() === equipment &&
      !['Finalizada', 'Cancelada', 'Entregue', 'Reprovado'].includes(order.status)
    ).length;
    const overloadEnabled = Boolean(eqType?.overloadFromQty && eqType.overloadFromQty > 0 && activeEquipmentLoad >= (eqType.overloadFromQty || 0));
    const extraDiagDays = overloadEnabled ? Math.max(0, Number(eqType?.overloadDiagnosisDays || 0)) : 0;
    const extraCompDays = overloadEnabled ? Math.max(0, Number(eqType?.overloadCompletionDays || 0)) : 0;

    // ── HIERARCHICAL DEADLINE CALCULATION ──
    // Level 1 (max): service exception (Formatação = 3h or equipment deadline rule)
    // Level 2: equipment category (Notebook = 2 dias diag / 4 dias conclusão)
    // Level 3: fallback (48h)
    let diagDeadline: string;
    let compDeadline: string;

    const serviceItems = newOsItems.filter(i => i.type === 'Serviço');
    const deadlineRules = eqType?.deadlineRules || [];
    const isNotebook = String(equipment || '').toLowerCase().includes('notebook');
    const hasFormattingService = serviceItems.some((item) => String(item.description || '').toLowerCase().includes('format'));

    // Check each service item for matching deadline rules (sorted by priority)
    const matchedRules: EquipmentDeadlineRule[] = [];
    for (const item of serviceItems) {
      const itemDesc = (item.description || '').toLowerCase();
      for (const rule of deadlineRules) {
        const keyword = (rule.serviceKeyword || '').toLowerCase();
        if (keyword && itemDesc.includes(keyword)) {
          matchedRules.push(rule);
        }
      }
    }

    // Also check via executionTimeValue on service items (quick services like formatação)
    const quickServiceItems = serviceItems.filter(i => i.executionTimeValue && i.executionTimeValue > 0);

    if (matchedRules.length > 0 || hasFormattingService) {
      // Level 1 — Use highest priority rule (lowest priority number)
      const topRule = hasFormattingService
        ? ({
            id: 'builtin-formatacao',
            serviceKeyword: 'Formatação',
            completionHours: 3,
            priority: 0,
          } as EquipmentDeadlineRule)
        : matchedRules.sort((a, b) => a.priority - b.priority)[0];
      // Also sum extra hours from all quick service items not already covered
      let extraHoursFromServices = 0;
      for (const item of quickServiceItems) {
        if (item.executionTimeUnit === 'Horas') {
          extraHoursFromServices += item.executionTimeValue || 0;
        }
      }

      let rawDiag: Date;
      let rawComp: Date;

      if (topRule.completionHours) {
        // Service is "quick" — completion deadline is X hours from now
        const totalCompHours = topRule.completionHours;
        // Diagnosis: use rule's diagnosisHours or equipment default
        if (topRule.diagnosisHours) {
          rawDiag = new Date(now.getTime() + topRule.diagnosisHours * 60 * 60 * 1000);
        } else {
          rawDiag = addDays(now, baseDiagDays + extraDiagDays);
        }
        // Completion: rule hours + any additional equipment base completion days
        const baseCompMs = (topRule.completionDays || 0) * 24 * 60 * 60 * 1000;
        rawComp = new Date(rawDiag.getTime() + totalCompHours * 60 * 60 * 1000 + baseCompMs);
      } else if (topRule.completionDays) {
        rawDiag = addDays(now, topRule.diagnosisHours ? 0 : baseDiagDays + extraDiagDays);
        if (topRule.diagnosisHours) {
          rawDiag = new Date(now.getTime() + topRule.diagnosisHours * 60 * 60 * 1000);
        }
        rawComp = addDays(now, topRule.completionDays);
        // Sum hours from other quick services
        if (extraHoursFromServices > 0) {
          rawComp = new Date(rawComp.getTime() + extraHoursFromServices * 60 * 60 * 1000);
        }
      } else {
        // Fallback to equipment defaults
        rawDiag = addDays(now, baseDiagDays + extraDiagDays);
        rawComp = addDays(now, baseCompDays + extraCompDays);
      }

      diagDeadline = (await adjustDeadlineToBusinessHours(rawDiag)).toISOString();
      compDeadline = (await adjustDeadlineToBusinessHours(rawComp)).toISOString();

      // Visual alert
      toast.info(`Fluxo rápido detectado: prazo ajustado por "${topRule.serviceKeyword}".`, { duration: 4000 });

    } else if (quickServiceItems.length > 0) {
      // Service items have execution times set (e.g., from equipment service catalog)
      // Sum all hours; completion = diagnosis + total service hours
      const totalServiceHours = quickServiceItems.reduce((sum, item) => {
        if (item.executionTimeUnit === 'Horas') return sum + (item.executionTimeValue || 0);
        if (item.executionTimeUnit === 'Dias') return sum + (item.executionTimeValue || 0) * 24;
        return sum;
      }, 0);

      const diagDays = baseDiagDays + extraDiagDays;
      const rawDiag = addDays(now, diagDays);
      const rawComp = new Date(rawDiag.getTime() + totalServiceHours * 60 * 60 * 1000);

      diagDeadline = (await adjustDeadlineToBusinessHours(rawDiag)).toISOString();
      compDeadline = (await adjustDeadlineToBusinessHours(rawComp)).toISOString();

      const serviceLabel = quickServiceItems.map(i => i.description).join(' + ');
      toast.info(`⚡ Prazo calculado com tempo de execução do serviço: ${serviceLabel}`, { duration: 4000 });

    } else if (isNotebook) {
      // Level 2 — Notebook category rule when there is no service exception
      const rawDiag = addDays(now, 2 + extraDiagDays);
      const rawComp = addDays(now, 4 + extraCompDays);
      diagDeadline = (await adjustDeadlineToBusinessHours(rawDiag)).toISOString();
      compDeadline = (await adjustDeadlineToBusinessHours(rawComp)).toISOString();

    } else {
      // Level 3 — Fallback 48h when no explicit exception/category rule applies
      const rawDiagFallback = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const rawCompFallback = new Date(rawDiagFallback.getTime());
      diagDeadline = (await adjustDeadlineToBusinessHours(rawDiagFallback)).toISOString();
      compDeadline = (await adjustDeadlineToBusinessHours(rawCompFallback)).toISOString();
      toast.info('Regra padrão aplicada: prazo fallback de 48h.');
    }

    const newOS: ServiceOrder = {
      id: Math.random().toString(36).substr(2, 9),
      number: `OS-${new Date().getFullYear()}-${(allOrders.length + 1).toString().padStart(3, '0')}`,
      customerId: exactCustomer?.id || `manual-${Date.now()}`,
      customerName,
      equipment,
      brand,
      model,
      serialNumber: (formData.get('serial') as string || '').toUpperCase(),
      defect: (formData.get('defeito') as string || '').toUpperCase(),
      details: (formData.get('defeito_balcao') as string || '').toUpperCase(),
      accessories: (formData.get('acessorios') as string || '').toUpperCase(),
      status: formData.get('status') as any || 'Aberta',
      serviceType: formData.get('serviceType') as any,
      isApproved: formData.get('isApproved') !== null,
      priority: formData.get('priority') as any,
      value: totalOSValue,
      items: newOsItems,
      technicianId: selectedTechnician?.id || '',
      technicianName: selectedTechnician?.name || '',
      diagnosisDeadline: diagDeadline,
      completionDeadline: compDeadline,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      companyId: '1'
    };

    if (eqTypeId) {
      setEquipmentTypes((prev) => prev.map((eq) => {
        if (eq.id !== eqTypeId) return eq;
        const nextBrandModels = [...(eq.brandModels || [])];
        const normalizedBrand = normalizeUpperText(brand);
        const normalizedModel = normalizeUpperText(model);

        if (normalizedBrand) {
          const existingBrandIndex = nextBrandModels.findIndex((entry) =>
            normalizeUpperText(entry.brand) === normalizedBrand
          );
          if (existingBrandIndex === -1) {
            nextBrandModels.push({
              brand: normalizedBrand,
              models: normalizedModel ? [normalizedModel] : [],
            });
          } else if (normalizedModel) {
            const existingBrand = nextBrandModels[existingBrandIndex];
            const models = Array.from(new Set([...(existingBrand.models || []), normalizedModel]));
            nextBrandModels[existingBrandIndex] = {
              ...existingBrand,
              models,
            };
          }
        }

        const nextServices = [...(eq.services || [])];
        newOsItems
          .filter((item) => item.type === 'Serviço')
          .forEach((item) => {
            const description = normalizeUpperText(item.description || '');
            if (!description) return;
            const existingServiceIndex = nextServices.findIndex((service) =>
              normalizeUpperText(service.description) === description
            );
            const servicePayload = {
              id: existingServiceIndex >= 0 ? nextServices[existingServiceIndex].id : Math.random().toString(36).substr(2, 9),
              description,
              unitPrice: Number(item.unitPrice) || 0,
              executionTimeValue: item.executionTimeValue,
              executionTimeUnit: item.executionTimeUnit,
            };

            if (existingServiceIndex >= 0) {
              nextServices[existingServiceIndex] = {
                ...nextServices[existingServiceIndex],
                ...servicePayload,
              };
              return;
            }

            nextServices.push(servicePayload);
          });

        return {
          ...eq,
          brandModels: nextBrandModels,
          services: nextServices,
        };
      }));
    }

    setAllOrders(prev => [newOS, ...prev]);
    setIsDialogOpen(false);
    
    // Clear form
    setNewOsItems([]);
    setCustomerSearch('');
    setSelectedCustomerId('');
    setNewOSTechnicianId('');
    setNewOSEquipmentTypeId('');
    setNewOSEquipment('');
    setNewOSBrand('');
    setNewOSModel('');
    setNewItemDesc('');
    setNewItemPrice('0');
    setNewItemQty('1');
    setNewItemType('Produto');
    setNewItemExecTimeValue('1');
    setNewItemExecTimeUnit('Horas');
    
    // Open Print Selection Dialog
    setLastCreatedOS(newOS);
    setShowPostSavePrintDialog(true);

    if (overloadEnabled && (extraDiagDays > 0 || extraCompDays > 0)) {
      toast.info(`Acúmulo detectado em ${equipment}: prazo ajustado (+${extraDiagDays}d diag / +${extraCompDays}d conclusão).`);
    }
  };

  const handleShareLink = (os: ServiceOrder) => {
    const text = `Olá ${os.customerName}! A Ordem de Serviço ${os.number} para o seu ${os.equipment} já está em andamento. Status atual: ${os.status}. Você pode acompanhar as novidades por este canal.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    toast.success('Link de acompanhamento gerado!');
  };

  const captureElementAsPngDataUrl = async (element: HTMLElement) => {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    return canvas.toDataURL('image/png');
  };

  const buildEntryLabelDataUrl = (os: ServiceOrder) => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = '#111111';
    ctx.font = 'bold 52px Arial';
    ctx.fillText(os.number, 32, 74);

    ctx.font = 'bold 28px Arial';
    ctx.fillText('CLIENTE', 32, 124);
    ctx.font = '26px Arial';
    ctx.fillText(String(os.customerName || '-').slice(0, 52), 32, 162);

    ctx.font = 'bold 28px Arial';
    ctx.fillText('EQUIPAMENTO', 32, 220);
    ctx.font = '26px Arial';
    ctx.fillText(String(os.equipment || '-').slice(0, 52), 32, 258);

    ctx.font = 'bold 24px Arial';
    ctx.fillText('MARCA/MODELO', 32, 312);
    ctx.font = '22px Arial';
    ctx.fillText(`${os.brand || '-'} ${os.model || ''}`.trim().slice(0, 58), 32, 346);

    ctx.font = 'bold 22px Arial';
    ctx.fillText(`ENTRADA: ${format(new Date(os.createdAt), 'dd/MM/yyyy HH:mm')}`, 32, 404);
    ctx.fillText(`STATUS: ${os.status}`, 32, 444);
    ctx.font = '20px Arial';
    ctx.fillText('TechManager', 32, 510);

    return canvas.toDataURL('image/png');
  };

  const handleDirectPrintJobs = async () => {
    if (!lastCreatedOS) {
      toast.error('Não foi possível localizar a OS criada.');
      return;
    }

    const hasSelectedPrint = printCheckboxes.label || printCheckboxes.entry || printCheckboxes.warranty;
    if (!hasSelectedPrint) {
      toast.error('Selecione pelo menos uma impressão.');
      return;
    }

    if (printCheckboxes.label && !directPrintTargets.label) {
      toast.error('Selecione a impressora da Etiqueta de Entrada.');
      return;
    }
    if (printCheckboxes.entry && !directPrintTargets.entry) {
      toast.error('Selecione a impressora do Comprovante de Entrada.');
      return;
    }
    if (printCheckboxes.warranty && !directPrintTargets.warranty) {
      toast.error('Selecione a impressora do Termo de Garantia.');
      return;
    }

    try {
      setIsDirectPrinting(true);
      const jobs: Array<{ printerName: string; documentName: string; dataUrl: string }> = [];

      if (printCheckboxes.label) {
        const labelDataUrl = buildEntryLabelDataUrl(lastCreatedOS);
        if (labelDataUrl) {
          jobs.push({
            printerName: directPrintTargets.label,
            documentName: `${lastCreatedOS.number}-etiqueta`,
            dataUrl: labelDataUrl,
          });
        }
      }

      if ((printCheckboxes.entry || printCheckboxes.warranty) && directA4PrintRef.current) {
        const a4DataUrl = await captureElementAsPngDataUrl(directA4PrintRef.current);
        if (printCheckboxes.entry) {
          jobs.push({
            printerName: directPrintTargets.entry,
            documentName: `${lastCreatedOS.number}-comprovante`,
            dataUrl: a4DataUrl,
          });
        }
        if (printCheckboxes.warranty) {
          jobs.push({
            printerName: directPrintTargets.warranty,
            documentName: `${lastCreatedOS.number}-garantia`,
            dataUrl: a4DataUrl,
          });
        }
      }

      if (jobs.length === 0) {
        toast.error('Não foi possível montar os arquivos de impressão.');
        return;
      }

      const response = await axios.post('/api/system/print-jobs', { jobs });
      const results = Array.isArray(response.data?.results) ? response.data.results : [];
      const successCount = results.filter((item: any) => item?.success).length;
      const failureCount = results.length - successCount;

      if (failureCount === 0) {
        toast.success(`Impressão direta enviada (${successCount} job${successCount > 1 ? 's' : ''}).`);
      } else {
        toast.error(`Algumas impressões falharam (${failureCount}). Verifique as impressoras.`);
      }
      setShowPostSavePrintDialog(false);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Falha ao enviar impressão direta.';
      toast.error(message);
    } finally {
      setIsDirectPrinting(false);
    }
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

  const resetQuickCustomer = () => {
    lastQuickCustomerCepLookupRef.current = '';
    setQuickCustomer({
      name: '',
      doc: '',
      ie: '',
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
  };

  const handleLookupQuickCustomerCep = async (rawCep: string) => {
    const cep = onlyDigits(rawCep || '');
    if (cep.length !== 8) return;
    if (lastQuickCustomerCepLookupRef.current === cep) return;

    try {
      setIsQuickCustomerCepLookupLoading(true);
      const data = await fetchCepByBrasilApi(cep);
      setQuickCustomer((prev) => ({
        ...prev,
        zip: formatCep(cep),
        street: data.street || prev.street,
        neighborhood: data.neighborhood || prev.neighborhood,
        city: data.city || prev.city,
        state: (data.state || prev.state || 'SP').toUpperCase().slice(0, 2),
      }));
      lastQuickCustomerCepLookupRef.current = cep;
    } catch {
      toast.error('Não foi possível consultar este CEP na BrasilAPI.');
    } finally {
      setIsQuickCustomerCepLookupLoading(false);
    }
  };

  const handleSaveQuickCustomer = () => {
    const email = normalizeEmail(quickCustomer.email);
    if (!quickCustomer.name.trim()) {
      toast.error('Nome do cliente é obrigatório.');
      return;
    }
    if (!isValidOptionalEmail(email)) {
      toast.error('Informe um e-mail válido, como nome@provedor.com, ou deixe vazio.');
      return;
    }

    const customer = {
      ...quickCustomer,
      id: Math.random().toString(36).substr(2, 9),
      name: quickCustomer.name.trim(),
      doc: formatCpfCnpj(quickCustomer.doc),
      ie: formatStateRegistration(quickCustomer.ie),
      email,
      phone: formatPhone(quickCustomer.phone),
    };

    setGlobalCustomers(prev => [...prev, customer]);
    setCustomerSearch(customer.name);
    setSelectedCustomerId(customer.id);
    setShowCustomerResults(false);
    setIsNewCustomerOpen(false);
    resetQuickCustomer();
    toast.success('Cliente cadastrado e selecionado!');
  };

  const lastCreatedCustomerRecord = lastCreatedOS
    ? (globalCustomers.find((c) => c.id === lastCreatedOS.customerId) as any)
    : null;

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
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setSelectedCustomerId('');
                        }}
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
                                setSelectedCustomerId(c.id);
                                setShowCustomerResults(false);
                              }}
                            >
                              {c.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {showCustomerResults && customerSearch.trim() && filteredCustomers.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-3">
                          <p className="text-sm font-medium text-rose-600">Este cliente não existe no cadastro.</p>
                          <p className="text-xs text-muted-foreground mt-1">Clique no botão + para cadastrar este nome.</p>
                        </div>
                      )}
                    </div>
                    <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
                      <DialogTrigger render={
                        <Button
                          variant="outline"
                          size="icon"
                          title="Adicionar Novo Cliente"
                          onClick={() => {
                            const typedName = customerSearch.trim();
                            if (!typedName) return;
                            setQuickCustomer((prev) => ({ ...prev, name: typedName }));
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      } />
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome / Razão Social</Label>
                              <Input
                                placeholder="Nome do cliente"
                                value={quickCustomer.name}
                                onChange={(e) => setQuickCustomer({ ...quickCustomer, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>CPF / CNPJ</Label>
                              <Input
                                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                value={quickCustomer.doc}
                                onChange={(e) => setQuickCustomer({ ...quickCustomer, doc: formatCpfCnpj(e.target.value) })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Inscrição Estadual</Label>
                              <Input
                                placeholder="ISENTO ou números"
                                value={quickCustomer.ie}
                                onChange={(e) => setQuickCustomer({ ...quickCustomer, ie: formatStateRegistration(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>E-mail</Label>
                              <Input
                                type="email"
                                placeholder="email@provedor.com"
                                value={quickCustomer.email}
                                onChange={(e) => setQuickCustomer({ ...quickCustomer, email: normalizeEmail(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Telefone</Label>
                              <Input
                                placeholder="(00) 0000-0000 ou (00) 00000-0000"
                                value={quickCustomer.phone}
                                onChange={(e) => setQuickCustomer({ ...quickCustomer, phone: formatPhone(e.target.value) })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                            <div className="space-y-2">
                              <Label>CEP</Label>
                              <Input
                                placeholder="00000-000"
                                value={quickCustomer.zip}
                                onChange={(e) => {
                                  const formattedCep = formatCep(e.target.value);
                                  setQuickCustomer((prev) => ({ ...prev, zip: formattedCep }));
                                  const cepDigits = onlyDigits(formattedCep);
                                  if (cepDigits.length === 8) {
                                    handleLookupQuickCustomerCep(cepDigits);
                                  }
                                }}
                                onBlur={() => handleLookupQuickCustomerCep(quickCustomer.zip)}
                              />
                              {isQuickCustomerCepLookupLoading && (
                                <p className="text-[10px] text-muted-foreground">Consultando CEP...</p>
                              )}
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <Label>Logradouro</Label>
                              <Input placeholder="Rua, avenida..." value={quickCustomer.street} onChange={(e) => setQuickCustomer({ ...quickCustomer, street: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Número</Label>
                              <Input placeholder="123" value={quickCustomer.number} onChange={(e) => setQuickCustomer({ ...quickCustomer, number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Complemento</Label>
                              <Input placeholder="Sala, apto..." value={quickCustomer.complement} onChange={(e) => setQuickCustomer({ ...quickCustomer, complement: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Bairro</Label>
                              <Input placeholder="Centro" value={quickCustomer.neighborhood} onChange={(e) => setQuickCustomer({ ...quickCustomer, neighborhood: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-2">
                              <Label>Cidade</Label>
                              <Input placeholder="Cidade" value={quickCustomer.city} onChange={(e) => setQuickCustomer({ ...quickCustomer, city: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Estado</Label>
                              <Input placeholder="UF" maxLength={2} value={quickCustomer.state} onChange={(e) => setQuickCustomer({ ...quickCustomer, state: e.target.value.toUpperCase().slice(0, 2) })} />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setIsNewCustomerOpen(false);
                            resetQuickCustomer();
                          }}>Cancelar</Button>
                          <Button onClick={handleSaveQuickCustomer}>Salvar e Continuar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Equipamento</Label>
                  <Select name="equipmentType" value={newOSEquipmentTypeId} onValueChange={(val) => {
                    setNewOSEquipmentTypeId(val);
                    const eqType = equipmentTypes.find(e => e.id === val);
                    setNewOSEquipment((eqType?.name || '').toUpperCase());
                  }}>
                    <SelectTrigger className="h-10 text-xs w-full">
                      <span className="truncate">
                        {equipmentTypes.find((e) => e.id === newOSEquipmentTypeId)?.name.toUpperCase() || 'SELECIONE O TIPO...'}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map(eq => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.name.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold">Técnico Responsável</Label>
                  <Select value={newOSTechnicianId} onValueChange={setNewOSTechnicianId}>
                    <SelectTrigger className="h-10 text-xs w-full">
                      <span className="truncate">{teamUsers.find(u => u.id === newOSTechnicianId)?.name.toUpperCase() || 'SELECIONE UM TÉCNICO...'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {teamUsers.filter(u => u.role === 'USUARIO').map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="technicianId" value={newOSTechnicianId} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca" className="uppercase text-[10px] font-bold">Marca</Label>
                  <Input
                    id="marca"
                    name="brand"
                    list="os-brand-suggestions"
                    placeholder="EX: APPLE"
                    required
                    className="uppercase"
                    value={newOSBrand}
                    onChange={(e) => setNewOSBrand(e.target.value.toUpperCase())}
                  />
                  <datalist id="os-brand-suggestions">
                    {brandSuggestions.map((brand) => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
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
                  <Input
                    id="modelo"
                    name="model"
                    list="os-model-suggestions"
                    placeholder="EX: PRO MAX"
                    required
                    className="uppercase"
                    value={newOSModel}
                    onChange={(e) => setNewOSModel(e.target.value.toUpperCase())}
                  />
                  <datalist id="os-model-suggestions">
                    {modelSuggestions.map((model) => (
                      <option key={model} value={model} />
                    ))}
                  </datalist>
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
                  <div className="col-span-3">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Tipo de operação</Label>
                    <Select value={newItemType} onValueChange={(v: any) => {
                      setNewItemType(v);
                      if (v === 'Produto') {
                        setNewItemExecTimeValue('1');
                        setNewItemExecTimeUnit('Horas');
                      }
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Produto">Produto</SelectItem>
                        <SelectItem value="Serviço">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 relative">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Descrição</Label>
                    <Input 
                      placeholder="Descrição..." 
                      value={newItemDesc} 
                      onChange={(e) => setNewItemDesc(e.target.value)} 
                      onFocus={() => setIsServiceSuggestionOpen(true)}
                      onBlur={() => setTimeout(() => setIsServiceSuggestionOpen(false), 120)}
                    />
                    {isServiceSuggestionOpen && serviceSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-44 overflow-y-auto">
                        {serviceSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.description}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-secondary/40 text-xs"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setNewItemDesc(suggestion.description.toUpperCase());
                              setNewItemPrice(String(suggestion.unitPrice || 0));
                              setIsServiceSuggestionOpen(false);
                            }}
                          >
                            <span className="font-semibold">{suggestion.description}</span>
                            <span className="ml-2 text-muted-foreground">R$ {(suggestion.unitPrice || 0).toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Qtd</Label>
                    <Input 
                      type="number" 
                      placeholder="Qtd" 
                      value={newItemQty} 
                      onChange={(e) => setNewItemQty(e.target.value)} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Valor (R$)</Label>
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
                {newItemType === 'Serviço' && (
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Prazo de execução</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Quantidade"
                        value={newItemExecTimeValue}
                        onChange={(e) => setNewItemExecTimeValue(e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Unidade</Label>
                      <Select value={newItemExecTimeUnit} onValueChange={(v: any) => setNewItemExecTimeUnit(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Horas">Horas</SelectItem>
                          <SelectItem value="Dias">Dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Digite descrição, marca e modelo para buscar serviços já usados nesse equipamento. Ao selecionar uma sugestão, o valor é preenchido automaticamente.
                </p>

                <div className="space-y-2">
                  {newOsItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-secondary/30 p-2 rounded-lg text-xs">
                      <div className="flex-1">
                        <span className="font-bold">[{item.type}]</span> {item.description}
                        <p className="text-muted-foreground">{item.quantity}x R$ {item.unitPrice.toFixed(2)}</p>
                        {item.type === 'Serviço' && item.executionTimeValue && item.executionTimeUnit && (
                          <p className="text-[10px] text-muted-foreground">Prazo: {item.executionTimeValue} {item.executionTimeUnit}</p>
                        )}
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
                  <Select name="status" defaultValue={orderedStatusColumns[0] || 'Aberta'}>
                    <SelectTrigger className="h-10 text-xs text-left w-full uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderedStatusColumns.map(status => (
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
      <div className="flex flex-1 gap-2">
        <Select
          value={filterField}
          onValueChange={(value) => {
            const nextField = value as typeof filterField;
            setFilterField(nextField);
            setFilterQuery('');
            if (nextField === 'status') {
              setStatusFilter('todos');
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>
                {filterField === 'status' ? 'Status' :
                filterField === 'nome' ? 'Nome' :
                filterField === 'data' ? 'Data' :
                filterField === 'os' ? 'O.S.' :
                filterField === 'equipamento' ? 'Equipamento' :
                filterField === 'marca' ? 'Marca' : 'Modelo'}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="nome">Nome</SelectItem>
            <SelectItem value="data">Data</SelectItem>
            <SelectItem value="os">O.S.</SelectItem>
            <SelectItem value="equipamento">Equipamento</SelectItem>
            <SelectItem value="marca">Marca</SelectItem>
            <SelectItem value="modelo">Modelo</SelectItem>
          </SelectContent>
        </Select>

        {filterField === 'status' ? (
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'todos')}>
            <SelectTrigger className="flex-1 min-w-[180px]">
              <span>{statusFilter === 'todos' ? 'Todos Status' : statusFilter}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              {orderedStatusColumns.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={filterField === 'data' ? 'date' : 'text'}
              placeholder={
                filterField === 'nome' ? 'Filtrar por nome...' :
                filterField === 'data' ? 'Selecionar data...' :
                filterField === 'os' ? 'Filtrar por O.S...' :
                filterField === 'equipamento' ? 'Filtrar por equipamento...' :
                filterField === 'marca' ? 'Filtrar por marca...' :
                'Filtrar por modelo...'
              }
              className={cn('pl-9', filterField === 'data' && 'pl-3')}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="flex gap-2">
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
                    case 'Aberta': return 'bg-blue-50/60 dark:bg-blue-500/10';
                    case 'Em análise': return 'bg-purple-50/60 dark:bg-purple-500/10';
                    case 'Aguardando aprovação': return 'bg-yellow-50/60 dark:bg-yellow-500/10';
                    case 'Aguardando peça': return 'bg-orange-50/60 dark:bg-orange-500/10';
                    case 'Em reparo': return 'bg-indigo-50/60 dark:bg-indigo-500/10';
                    case 'Testes finais': return 'bg-cyan-50/60 dark:bg-cyan-500/10';
                    case 'Pronta': return 'bg-emerald-50/60 dark:bg-emerald-500/10';
                    case 'Entregue': return 'bg-slate-50/60 dark:bg-slate-500/10';
                    case 'Finalizada': return 'bg-green-50/60 dark:bg-green-500/10';
                    case 'Cancelada': return 'bg-rose-50/60 dark:bg-rose-500/10';
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
                    <td className="px-6 py-4"><span className="flex items-center flex-wrap gap-0.5">{os.customerName}{(os as any).importedFromBackup && <BackupBadge />}</span></td>
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
                      <div className="flex flex-col leading-tight">
                        <span>{formatOrderDeadlineLabel(os.diagnosisDeadline)}</span>
                        <span className="text-[10px] text-muted-foreground font-medium mt-1">
                          {formatOrderDeadlineWeekday(os.diagnosisDeadline)}
                        </span>
                      </div>
                    </td>
                    <td className={cn("px-6 py-4 text-xs", getDeadlineColor(os.completionDeadline))}>
                      <div className="flex flex-col leading-tight">
                        <span>{formatOrderDeadlineLabel(os.completionDeadline)}</span>
                        <span className="text-[10px] text-muted-foreground font-medium mt-1">
                          {formatOrderDeadlineWeekday(os.completionDeadline)}
                        </span>
                      </div>
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
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => onViewOS(os.id)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleA4Print(os)}
                        title="Imprimir A4"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Alterar status">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {orderedStatusColumns.map((status) => (
                            <DropdownMenuItem key={status} onClick={() => handleStatusChange(os.id, status as OSStatus)}>
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-600"
                        onClick={() => handleStatusChange(os.id, 'Cancelada')}
                        title="Cancelar"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleA4Pdf(os)}
                        title="Baixar PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </Button>
                      {(user?.role === 'ADMIN-USER' || user?.role === 'ADMIN-SAAS') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500"
                          onClick={() => handleDeleteOrder(os.id)}
                          title="Apagar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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

      <Dialog open={isCancelDialogOpen} onOpenChange={(open) => {
        setIsCancelDialogOpen(open);
        if (!open) {
          setCancelReason('');
          setCancelTargetId(null);
          setIsRejectionDialog(false);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isRejectionDialog ? 'Reprovar Orçamento' : 'Cancelar Ordem de Serviço'}</DialogTitle>
            <DialogDescription>{isRejectionDialog ? 'Informe o motivo da reprovação para análise e estatísticas.' : 'Informe o motivo do cancelamento para análise no dashboard.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>{isRejectionDialog ? 'Motivo da Reprovação' : 'Motivo do Cancelamento'}</Label>
            <textarea
              className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={isRejectionDialog ? 'Descreva o motivo da reprovação...' : 'Descreva o motivo do cancelamento...'}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Voltar</Button>
            <Button variant="destructive" onClick={confirmCancel}>{isRejectionDialog ? 'Confirmar Reprovação' : 'Confirmar Cancelamento'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedOSForA4Print && (
        <OSPrintView 
          os={selectedOSForA4Print} 
          onClose={() => {
            setSelectedOSForA4Print(null);
            setSelectedOSForA4Action(null);
          }} 
          company={company}
          autoAction={selectedOSForA4Action}
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
          company={company}
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
            {printCheckboxes.label && (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Impressora da Etiqueta</Label>
                <Select
                  value={directPrintTargets.label}
                  onValueChange={(value) => setDirectPrintTargets((prev) => ({ ...prev, label: value }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={isLoadingPrinters ? 'Carregando impressoras...' : 'Selecione a impressora'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrinters.map((printer) => (
                      <SelectItem key={printer} value={printer}>{printer}</SelectItem>
                    ))}
                    {!isLoadingPrinters && availablePrinters.length === 0 && (
                      <SelectItem value="none" disabled>Nenhuma impressora encontrada</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

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
            {printCheckboxes.entry && (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Impressora do Comprovante</Label>
                <Select
                  value={directPrintTargets.entry}
                  onValueChange={(value) => setDirectPrintTargets((prev) => ({ ...prev, entry: value }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={isLoadingPrinters ? 'Carregando impressoras...' : 'Selecione a impressora'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrinters.map((printer) => (
                      <SelectItem key={printer} value={printer}>{printer}</SelectItem>
                    ))}
                    {!isLoadingPrinters && availablePrinters.length === 0 && (
                      <SelectItem value="none" disabled>Nenhuma impressora encontrada</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

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
            {printCheckboxes.warranty && (
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Impressora do Termo</Label>
                <Select
                  value={directPrintTargets.warranty}
                  onValueChange={(value) => setDirectPrintTargets((prev) => ({ ...prev, warranty: value }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={isLoadingPrinters ? 'Carregando impressoras...' : 'Selecione a impressora'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrinters.map((printer) => (
                      <SelectItem key={printer} value={printer}>{printer}</SelectItem>
                    ))}
                    {!isLoadingPrinters && availablePrinters.length === 0 && (
                      <SelectItem value="none" disabled>Nenhuma impressora encontrada</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3 pt-6">
              <Button variant="ghost" className="flex-1 h-12 font-bold uppercase" onClick={() => setShowPostSavePrintDialog(false)}>
                Sair sem imprimir
              </Button>
              <Button 
                className="flex-1 h-12 font-black bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-lg shadow-emerald-200"
                disabled={isDirectPrinting || isLoadingPrinters}
                onClick={handleDirectPrintJobs}
              >
                <Printer className="w-5 h-5" strokeWidth={3} /> {isDirectPrinting ? 'ENVIANDO...' : 'IMPRIMIR DIRETO'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {lastCreatedOS && (
        <div className="sr-only" aria-hidden="true">
          <OSPrintContentForRef
            ref={directA4PrintRef}
            os={lastCreatedOS}
            company={company}
            customer={lastCreatedCustomerRecord as Customer}
          />
        </div>
      )}
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
  const emptyCustomer = {
    name: '',
    doc: '',
    ie: '',
    email: '',
    phone: '',
    zip: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP'
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustomer, setNewCustomer] = useState<any>(emptyCustomer);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [isCustomerCnpjLookupLoading, setIsCustomerCnpjLookupLoading] = useState(false);
  const [isCustomerCepLookupLoading, setIsCustomerCepLookupLoading] = useState(false);
  
  const filteredCustomers = customers.filter(c => 
    fuzzyMatch(c.name, customerSearch) ||
    fuzzyMatch(c.doc || '', customerSearch) ||
    fuzzyMatch(c.phone || '', customerSearch) ||
    fuzzyMatch(c.email || '', customerSearch)
  );

  const handleLookupCustomerByCnpj = async () => {
    const cnpj = onlyDigits(newCustomer.doc || '');
    if (cnpj.length !== 14) {
      toast.error('Digite um CNPJ válido no campo CPF/CNPJ para consultar.');
      return;
    }

    try {
      setIsCustomerCnpjLookupLoading(true);
      const data = await fetchCnpjByBrasilApi(cnpj);

      setNewCustomer((prev: any) => ({
        ...prev,
        doc: formatCpfCnpj(cnpj),
        name: data.razao_social || data.nome_fantasia || prev.name,
        email: normalizeEmail(data.email || prev.email),
        phone: formatPhone(data.ddd_telefone_1 || prev.phone),
        zip: formatCep(data.cep || prev.zip),
        street: data.logradouro || prev.street,
        number: data.numero || prev.number,
        complement: data.complemento || prev.complement,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.municipio || prev.city,
        state: (data.uf || prev.state || 'SP').toUpperCase().slice(0, 2),
      }));

      toast.success('Dados de cadastro preenchidos via CNPJ.');
    } catch {
      toast.error('Não foi possível consultar este CNPJ na BrasilAPI.');
    } finally {
      setIsCustomerCnpjLookupLoading(false);
    }
  };

  const handleLookupCustomerCep = async () => {
    const cep = onlyDigits(newCustomer.zip || '');
    if (cep.length !== 8) {
      toast.error('Digite um CEP válido com 8 dígitos.');
      return;
    }

    try {
      setIsCustomerCepLookupLoading(true);
      const data = await fetchCepByBrasilApi(cep);
      setNewCustomer((prev: any) => ({
        ...prev,
        zip: formatCep(cep),
        street: data.street || prev.street,
        neighborhood: data.neighborhood || prev.neighborhood,
        city: data.city || prev.city,
        state: (data.state || prev.state || 'SP').toUpperCase().slice(0, 2),
      }));
      toast.success('Endereço preenchido via CEP.');
    } catch {
      toast.error('Não foi possível consultar este CEP na BrasilAPI.');
    } finally {
      setIsCustomerCepLookupLoading(false);
    }
  };

  const handleSaveCustomer = () => {
    if (!newCustomer.name?.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    const email = normalizeEmail(newCustomer.email);
    if (!isValidOptionalEmail(email)) {
      toast.error('Informe um e-mail válido, como nome@provedor.com, ou deixe vazio.');
      return;
    }
    const normalizedCustomer = {
      ...newCustomer,
      name: newCustomer.name.trim(),
      doc: formatCpfCnpj(newCustomer.doc),
      ie: formatStateRegistration(newCustomer.ie),
      email,
      phone: formatPhone(newCustomer.phone),
    };

    if (editingCustomerId) {
      setCustomers(prev => prev.map((customer) => customer.id === editingCustomerId ? { ...customer, ...normalizedCustomer } : customer));
      toast.success('Cliente atualizado com sucesso!');
    } else {
      const customer = {
        ...normalizedCustomer,
        id: Math.random().toString(36).substr(2, 9)
      };
      setCustomers(prev => [...prev, customer]);
      toast.success('Cliente cadastrado com sucesso!');
    }

    setIsDialogOpen(false);
    setEditingCustomerId(null);
    setNewCustomer(emptyCustomer);
  };

  const handleEditCustomer = (customer: any) => {
    setNewCustomer({ ...emptyCustomer, ...customer });
    setEditingCustomerId(customer.id);
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (!confirm('Deseja realmente excluir este cliente? Esta ação não pode ser desfeita.')) return;
    setCustomers(prev => prev.filter((customer) => customer.id !== customerId));
    if (editingCustomerId === customerId) {
      setEditingCustomerId(null);
      setNewCustomer(emptyCustomer);
    }
    toast.success('Cliente excluído com sucesso!');
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
              <Button
                className="gap-2"
                onClick={() => {
                  setEditingCustomerId(null);
                  setNewCustomer(emptyCustomer);
                }}
              >
                <Plus className="w-4 h-4" /> Novo Cliente
              </Button>
            } />
            <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-5xl">
              <DialogHeader>
                <DialogTitle>{editingCustomerId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</DialogTitle>
                <DialogDescription>
                  {editingCustomerId ? 'Atualize os dados do cliente selecionado.' : 'Preencha os dados abaixo para registrar um novo cliente no sistema.'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold">Nome Completo / Razão Social</Label>
                      <Input id="name" placeholder="Nome do cliente" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc" className="font-bold">CPF / CNPJ</Label>
                    <div className="flex gap-2">
                      <Input id="doc" placeholder="000.000.000-00 ou 00.000.000/0000-00" value={newCustomer.doc} onChange={e => setNewCustomer({...newCustomer, doc: formatCpfCnpj(e.target.value)})} />
                      <Button type="button" variant="outline" onClick={handleLookupCustomerByCnpj} disabled={isCustomerCnpjLookupLoading}>
                        {isCustomerCnpjLookupLoading ? 'Consultando...' : 'Buscar CNPJ'}
                      </Button>
                    </div>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ie" className="font-bold">Inscrição Estadual</Label>
                  <Input id="ie" placeholder="ISENTO ou números" value={newCustomer.ie} onChange={e => setNewCustomer({...newCustomer, ie: formatStateRegistration(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold">E-mail</Label>
                  <Input id="email" type="email" placeholder="cliente@provedor.com" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: normalizeEmail(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold">Telefone / WhatsApp</Label>
                  <Input id="phone" placeholder="(00) 0000-0000 ou (00) 00000-0000" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: formatPhone(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Informações de Endereço</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="font-bold">CEP</Label>
                    <div className="flex gap-2">
                      <Input id="cep" placeholder="00000-000" value={newCustomer.zip} onChange={e => setNewCustomer({...newCustomer, zip: formatCep(e.target.value)})} />
                      <Button type="button" variant="outline" onClick={handleLookupCustomerCep} disabled={isCustomerCepLookupLoading}>
                        {isCustomerCepLookupLoading ? 'Consultando...' : 'Buscar CEP'}
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address" className="font-bold">Logradouro (Rua, Av.)</Label>
                    <Input id="address" placeholder="Logradouro" value={newCustomer.street} onChange={e => setNewCustomer({...newCustomer, street: e.target.value})} />
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

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingCustomerId(null);
                    setNewCustomer(emptyCustomer);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveCustomer}>
                  {editingCustomerId ? 'Salvar Alterações' : 'Salvar Cliente'}
                </Button>
              </DialogFooter>
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
                  <td className="px-6 py-4 font-medium"><span className="flex items-center flex-wrap gap-0.5">{c.name}{c.importedFromBackup && <BackupBadge />}</span></td>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar cliente"
                        onClick={() => handleEditCustomer(c)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-600 hover:text-rose-700"
                        title="Apagar cliente"
                        onClick={() => handleDeleteCustomer(c.id)}
                      >
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

function StockView({ 
  fiscalEnabled, 
  fiscalStrictModeEnabled = true,
  companyFiscalSettings,
  allProducts, 
  setAllProducts,
  rmaHistory,
  setRmaHistory,
  salesHistory = []
}: { 
  fiscalEnabled: boolean, 
  fiscalStrictModeEnabled?: boolean,
  companyFiscalSettings?: Pick<Company, 'fiscalUf' | 'fiscalActivitySector' | 'fiscalActivityCode' | 'accountantAssistantEnabled'>,
  allProducts: any[], 
  setAllProducts: React.Dispatch<React.SetStateAction<any[]>>,
  rmaHistory: any[],
  setRmaHistory: React.Dispatch<React.SetStateAction<any[]>>,
  salesHistory?: any[]
}) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [buySearch, setBuySearch] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageFit, setProductImageFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [bestSellersPeriod, setBestSellersPeriod] = useState('30d');
  const [bestSellersDisplayCount, setBestSellersDisplayCount] = useState(10);
  
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);

  const [editingCategory, setEditingCategory] = useState<{id: string, name: string, type: string} | null>(null);

  const [stockSearch, setStockSearch] = useState('');
  const [stockFilterCategory, setStockFilterCategory] = useState('todas');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productNameValue, setProductNameValue] = useState('');
  const [isNcmLookupLoading, setIsNcmLookupLoading] = useState(false);
  const [ncmLookupResults, setNcmLookupResults] = useState<BrasilApiNcmItem[]>([]);
  const [isNcmResultsModalOpen, setIsNcmResultsModalOpen] = useState(false);
  const [ncmModalSearch, setNcmModalSearch] = useState('');
  const [ncmModalChapterFilter, setNcmModalChapterFilter] = useState('all');
  const [selectedNcmLookupCode, setSelectedNcmLookupCode] = useState('');
  const [ncmChosenFromList, setNcmChosenFromList] = useState(false);
  const [ncmInputValue, setNcmInputValue] = useState('');
  const [cestInputValue, setCestInputValue] = useState('');
  const [taxApiCodeValue, setTaxApiCodeValue] = useState('');
  const [taxCategoryValue, setTaxCategoryValue] = useState('');
  const [fiscalCfopValue, setFiscalCfopValue] = useState('');
  const [fiscalCstIcmsValue, setFiscalCstIcmsValue] = useState('');
  const [fiscalCstPisValue, setFiscalCstPisValue] = useState('');
  const [fiscalCstCofinsValue, setFiscalCstCofinsValue] = useState('');
  const products = allProducts;

  const productImageFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
  }[productImageFit];

  const activeFiscalProfile = useMemo(() => getFiscalProfileByNcm(ncmInputValue), [ncmInputValue]);

  const companyActivityTemplate = useMemo(
    () => resolveFiscalActivityTemplate(companyFiscalSettings?.fiscalActivityCode, companyFiscalSettings?.fiscalActivitySector),
    [companyFiscalSettings?.fiscalActivityCode, companyFiscalSettings?.fiscalActivitySector]
  );

  const prioritizeFiscalOptions = (options: FiscalOption[], preferredValue?: string): FiscalOption[] => {
    if (!preferredValue) return options;
    const existing = options.find((item) => item.value === preferredValue);
    if (existing) return [existing, ...options.filter((item) => item.value !== preferredValue)];

    return [
      {
        value: preferredValue,
        label: preferredValue,
        description: 'Sugestao com base no ramo/codigo de atividade fiscal da empresa.',
      },
      ...options,
    ];
  };

  const taxCategoryOptions = useMemo(
    () => prioritizeFiscalOptions(activeFiscalProfile.taxCategoryOptions, companyActivityTemplate?.suggestedTaxCategory),
    [activeFiscalProfile.taxCategoryOptions, companyActivityTemplate?.suggestedTaxCategory]
  );
  const cfopOptions = useMemo(
    () => prioritizeFiscalOptions(activeFiscalProfile.cfopOptions, companyActivityTemplate?.suggestedCfop),
    [activeFiscalProfile.cfopOptions, companyActivityTemplate?.suggestedCfop]
  );
  const cstIcmsOptions = useMemo(
    () => prioritizeFiscalOptions(activeFiscalProfile.cstIcmsOptions, companyActivityTemplate?.suggestedCstIcms),
    [activeFiscalProfile.cstIcmsOptions, companyActivityTemplate?.suggestedCstIcms]
  );
  const cstPisOptions = useMemo(
    () => prioritizeFiscalOptions(activeFiscalProfile.cstPisOptions, companyActivityTemplate?.suggestedCstPis),
    [activeFiscalProfile.cstPisOptions, companyActivityTemplate?.suggestedCstPis]
  );
  const cstCofinsOptions = useMemo(
    () => prioritizeFiscalOptions(activeFiscalProfile.cstCofinsOptions, companyActivityTemplate?.suggestedCstCofins),
    [activeFiscalProfile.cstCofinsOptions, companyActivityTemplate?.suggestedCstCofins]
  );

  const selectedTaxCategoryOption = taxCategoryOptions.find((opt) => opt.value === taxCategoryValue);
  const selectedCfopOption = cfopOptions.find((opt) => opt.value === fiscalCfopValue);
  const selectedCstIcmsOption = cstIcmsOptions.find((opt) => opt.value === fiscalCstIcmsValue);
  const selectedCstPisOption = cstPisOptions.find((opt) => opt.value === fiscalCstPisValue);
  const selectedCstCofinsOption = cstCofinsOptions.find((opt) => opt.value === fiscalCstCofinsValue);
  const strictFiscalModeActive = fiscalEnabled && fiscalStrictModeEnabled;

  const getProductFiscalConfidence = (product: any) => {
    const ncmDigits = onlyDigits(String(product?.ncm || ''));
    const hasValidNcm = ncmDigits.length === 8;
    const fromList = String(product?.ncmSource || '') === 'list';
    const hasCest = !!String(product?.cest || '').trim();
    const hasCfop = !!String(product?.fiscalCfop || '').trim();
    const hasCstIcms = !!String(product?.fiscalCstIcms || '').trim();
    const hasCstPis = !!String(product?.fiscalCstPis || '').trim();
    const hasCstCofins = !!String(product?.fiscalCstCofins || '').trim();
    const hasTaxCategory = !!String(product?.taxCategory || '').trim();

    let score = 0;
    if (hasValidNcm) score += 35;
    if (fromList) score += 25;
    if (hasCest) score += 10;
    if (hasCfop) score += 10;
    if (hasCstIcms) score += 7;
    if (hasCstPis) score += 7;
    if (hasCstCofins) score += 6;
    if (hasTaxCategory) score += 5;

    const clamped = Math.max(0, Math.min(100, score));
    if (clamped >= 80) {
      return { score: clamped, level: 'Alta', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
    if (clamped >= 55) {
      return { score: clamped, level: 'Media', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    return { score: clamped, level: 'Baixa', className: 'bg-rose-100 text-rose-700 border-rose-200' };
  };

  const ncmModalChapterOptions = useMemo(() => {
    const chapters = new Set<string>();
    ncmLookupResults.forEach((item) => {
      const chapter = normalizeNcmCode(item.codigo).slice(0, 2);
      if (chapter.length === 2) chapters.add(chapter);
    });
    return Array.from(chapters).sort((a, b) => a.localeCompare(b));
  }, [ncmLookupResults]);

  const filteredNcmModalResults = useMemo(() => {
    const q = normalizeLookupText(ncmModalSearch);
    const qDigits = normalizeNcmCode(ncmModalSearch);
    return ncmLookupResults.filter((item) => {
      const chapter = normalizeNcmCode(item.codigo).slice(0, 2);
      const chapterMatches = ncmModalChapterFilter === 'all' || chapter === ncmModalChapterFilter;
      if (!chapterMatches) return false;
      if (!q && !qDigits) return true;

      const itemCodeDigits = normalizeNcmCode(item.codigo);
      const codeMatches = qDigits ? itemCodeDigits.startsWith(qDigits) || itemCodeDigits.includes(qDigits) : false;
      const textMatches = q ? normalizeLookupText(item.descricao).includes(q) : false;
      return codeMatches || textMatches;
    });
  }, [ncmLookupResults, ncmModalSearch, ncmModalChapterFilter]);

  useEffect(() => {
    if (categories.length > 0) return;
    const unique = Array.from(new Set(allProducts.map((p) => p.cat).filter(Boolean))) as string[];
    if (unique.length === 0) return;
    setCategories(unique.map((name) => ({ id: safeRandomUUID(), name, type: 'Produto' })));
  }, [allProducts, categories.length]);

  const bestSellers = Object.values(
    salesHistory.reduce((acc: Record<string, any>, sale: any) => {
      (sale.items || []).forEach((item: any) => {
        const existing = acc[item.sku] || {
          id: item.id || item.sku || safeRandomUUID(),
          name: item.name || item.description || 'Item sem nome',
          totalSales: 0,
          value: 0,
          cat: allProducts.find((product) => product.sku === item.sku)?.cat || 'Sem categoria',
          cost: 0,
        };
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.price ?? item.unitPrice) || 0;
        existing.totalSales += quantity;
        existing.value += quantity * unitPrice;
        acc[item.sku] = existing;
      });
      return acc;
    }, {})
  ).sort((a: any, b: any) => b.totalSales - a.totalSales);

  const lowStockProducts = allProducts.filter(p => p.stock <= p.min);
  const filteredBuyProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(buySearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(buySearch.toLowerCase()) ||
    String(p.brand || '').toLowerCase().includes(buySearch.toLowerCase()) ||
    String(p.model || '').toLowerCase().includes(buySearch.toLowerCase())
  );

  const filteredStockProducts = allProducts.filter(p => {
    const matchesSearch =
      fuzzyMatch(p.name, stockSearch) ||
      fuzzyMatch(p.sku, stockSearch) ||
      fuzzyMatch(String(p.brand || ''), stockSearch) ||
      fuzzyMatch(String(p.model || ''), stockSearch);
    const matchesCategory = stockFilterCategory === 'todas' || p.cat === stockFilterCategory;
    return matchesSearch && matchesCategory;
  });

  const parseSalesDate = (value: string) => {
    if (!value) return null;
    if (value.includes('/')) {
      const [day, month, year] = value.split('/').map(Number);
      if (!day || !month || !year) return null;
      const parsed = new Date(year, month - 1, day);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const now = new Date();
  const thirtyDaysAgo = addDays(now, -30);
  const sixtyDaysAgo = addDays(now, -60);

  const salesInLast30Days = salesHistory.filter((sale: any) => {
    const parsedDate = parseSalesDate(String(sale.date || ''));
    return parsedDate ? parsedDate >= thirtyDaysAgo && parsedDate <= now : false;
  });

  const salesInPrevious30Days = salesHistory.filter((sale: any) => {
    const parsedDate = parseSalesDate(String(sale.date || ''));
    return parsedDate ? parsedDate >= sixtyDaysAgo && parsedDate < thirtyDaysAgo : false;
  });

  const sumSalesItems = (sales: any[]) => sales.reduce((acc, sale) => (
    acc + (sale.items || []).reduce((itemAcc: number, item: any) => itemAcc + (Number(item.quantity) || 0), 0)
  ), 0);

  const soldLast30Days = sumSalesItems(salesInLast30Days);
  const soldPrevious30Days = sumSalesItems(salesInPrevious30Days);
  const stockUnits = products.reduce((acc, product) => acc + (Number(product.stock) || 0), 0);
  const inventoryTurnover = stockUnits > 0 ? soldLast30Days / stockUnits : 0;
  const inventoryTrend = soldPrevious30Days > 0
    ? ((soldLast30Days - soldPrevious30Days) / soldPrevious30Days) * 100
    : soldLast30Days > 0
      ? 100
      : 0;

  const rmaLast30Days = rmaHistory.filter((entry: any) => {
    const parsedDate = parseSalesDate(String(entry.date || entry.createdAt || ''));
    return parsedDate ? parsedDate >= thirtyDaysAgo && parsedDate <= now : false;
  }).length;

  const inventoryAccuracy = soldLast30Days > 0
    ? Math.max(0, 100 - (rmaLast30Days / soldLast30Days) * 100)
    : 100;

  const lastMovementBySku = salesHistory.reduce((acc: Record<string, Date>, sale: any) => {
    const parsedDate = parseSalesDate(String(sale.date || ''));
    if (!parsedDate) return acc;

    (sale.items || []).forEach((item: any) => {
      const sku = String(item.sku || '');
      if (!sku) return;
      if (!acc[sku] || parsedDate > acc[sku]) {
        acc[sku] = parsedDate;
      }
    });

    return acc;
  }, {});

  const totalStockValue = products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
  const stockHealthLabel = inventoryAccuracy >= 90 ? 'Excelente' : inventoryAccuracy >= 75 ? 'Boa' : 'Atencao';

  const handleDeleteProduct = (id: string) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      setAllProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Produto excluído com sucesso');
    }
  };

  const resetProductFiscalLookup = () => {
    setNcmLookupResults([]);
    setIsNcmResultsModalOpen(false);
    setNcmModalSearch('');
    setNcmModalChapterFilter('all');
    setSelectedNcmLookupCode('');
    setNcmChosenFromList(false);
    setNcmInputValue('');
    setCestInputValue('');
    setTaxApiCodeValue('');
    setTaxCategoryValue('');
    setFiscalCfopValue('');
    setFiscalCstIcmsValue('');
    setFiscalCstPisValue('');
    setFiscalCstCofinsValue('');
    setProductNameValue('');
    setIsNcmLookupLoading(false);
  };

  const initializeProductFiscalLookup = (product?: any | null) => {
    setNcmLookupResults([]);
    setIsNcmResultsModalOpen(false);
    setNcmModalSearch('');
    setNcmModalChapterFilter('all');
    setSelectedNcmLookupCode(product?.ncm || '');
    setNcmChosenFromList(!!product?.ncm);
    setNcmInputValue(product?.ncm || '');
    setCestInputValue(product?.cest || '');
    setTaxApiCodeValue(product?.taxApiCode || '');
    setTaxCategoryValue(product?.taxCategory || '');
    setFiscalCfopValue(product?.fiscalCfop || '');
    setFiscalCstIcmsValue(product?.fiscalCstIcms || '');
    setFiscalCstPisValue(product?.fiscalCstPis || '');
    setFiscalCstCofinsValue(product?.fiscalCstCofins || '');
    setProductNameValue(product?.name || '');
    setIsNcmLookupLoading(false);
  };

  const handleLookupNcmByProductName = async () => {
    const queryByName = String(productNameValue || '').trim();
    const queryByCode = String(ncmInputValue || '').trim();
    const query = queryByName || queryByCode;
    if (!query) {
      toast.error('Informe o nome do produto ou os primeiros dígitos do NCM para buscar.');
      return;
    }

    try {
      setIsNcmLookupLoading(true);
      const foundItems = await fetchNcmByBrasilApi(query);
      if (!foundItems.length) {
        setNcmLookupResults([]);
        setSelectedNcmLookupCode('');
        toast.error('Nenhum NCM encontrado. Tente nome mais específico ou prefixo numérico do NCM.');
        return;
      }
      setNcmLookupResults(foundItems);
      setNcmModalSearch('');
      setNcmModalChapterFilter('all');
      setSelectedNcmLookupCode('');
      setNcmChosenFromList(false);
      setIsNcmResultsModalOpen(true);
    } catch {
      toast.error('Não foi possível consultar NCM na BrasilAPI.');
    } finally {
      setIsNcmLookupLoading(false);
    }
  };

  const handleSelectNcmLookupResult = (item: BrasilApiNcmItem) => {
    const profile = getFiscalProfileByNcm(item.codigo);
    const template = resolveFiscalActivityTemplate(
      companyFiscalSettings?.fiscalActivityCode,
      companyFiscalSettings?.fiscalActivitySector
    );
    setSelectedNcmLookupCode(item.codigo);
    setNcmChosenFromList(true);
    setNcmInputValue(item.codigo);
    if (!cestInputValue && profile.cestOptions[0]?.value) setCestInputValue(profile.cestOptions[0].value);
    if (!taxCategoryValue) {
      setTaxCategoryValue(template?.suggestedTaxCategory || profile.taxCategoryOptions[0]?.value || '');
    }
    if (!fiscalCfopValue) {
      setFiscalCfopValue(template?.suggestedCfop || profile.cfopOptions[0]?.value || '');
    }
    if (!fiscalCstIcmsValue) {
      setFiscalCstIcmsValue(template?.suggestedCstIcms || profile.cstIcmsOptions[0]?.value || '');
    }
    if (!fiscalCstPisValue) {
      setFiscalCstPisValue(template?.suggestedCstPis || profile.cstPisOptions[0]?.value || '');
    }
    if (!fiscalCstCofinsValue) {
      setFiscalCstCofinsValue(template?.suggestedCstCofins || profile.cstCofinsOptions[0]?.value || '');
    }
    setTaxApiCodeValue(item.codigo);
    setIsNcmResultsModalOpen(false);
    toast.success(`NCM selecionado: ${item.codigo} — ${item.descricao}`);
  };

  useEffect(() => {
    if (!isProductModalOpen) return;
    initializeProductFiscalLookup(editingProduct);
    loadNcmLocalBase().catch(() => {
      // ignore preload failures
    });
  }, [isProductModalOpen, editingProduct]);

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
                          <div>
                            <p className="text-sm">{p.name}</p>
                            {(p.brand || p.model) && (
                              <p className="text-[10px] text-muted-foreground uppercase">{[p.brand, p.model].filter(Boolean).join(' / ')}</p>
                            )}
                          </div>
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
              setProductImageFit('cover');
              resetProductFiscalLookup();
            } else {
              initializeProductFiscalLookup(editingProduct);
              setProductImageFit((editingProduct?.imageFit as 'cover' | 'contain' | 'fill') || 'cover');
            }
          }}>
            <DialogTrigger render={
              <Button className="gap-2" onClick={() => {
                setEditingProduct(null);
                setProductImage(null);
                setProductImageFit('cover');
                resetProductFiscalLookup();
              }}><Plus className="w-4 h-4" /> Novo Produto</Button>
            } />
            <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-5xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}</DialogTitle>
                <DialogDescription>Preencha os dados abaixo para {editingProduct ? 'atualizar' : 'cadastrar'} um item no estoque.</DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const rawNcm = String(formData.get('ncm') || ncmInputValue || '').trim();
                const rawCest = String(formData.get('cest') || cestInputValue || '').trim();
                const normalizedCest = rawCest === '__none__' ? '' : rawCest;
                const rawTaxApiCode = String(formData.get('taxApiCode') || taxApiCodeValue || '').trim();

                const ncmDigits = onlyDigits(rawNcm);
                if (strictFiscalModeActive) {
                  if (ncmDigits.length !== 8) {
                    toast.error('Modo fiscal estrito: informe um NCM válido com 8 dígitos.');
                    return;
                  }

                  if (!ncmChosenFromList) {
                    toast.error('Modo fiscal estrito: selecione o NCM pela lista de resultados.');
                    return;
                  }

                  const localNcmBase = await loadNcmLocalBase();
                  const hasNcmInOfficialBase = localNcmBase.some((item) => normalizeNcmCode(item.codigo) === ncmDigits);
                  if (!hasNcmInOfficialBase) {
                    toast.error('Modo fiscal estrito: NCM não encontrado na base oficial local.');
                    return;
                  }
                }

                const prodData: any = {
                  ...(editingProduct || {}),
                  id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
                  name: String(formData.get('name') || '').trim(),
                  brand: String(formData.get('brand') || '').trim(),
                  model: String(formData.get('model') || '').trim(),
                  image: productImage || editingProduct?.image || '',
                  imageFit: productImageFit,
                  sku: String(formData.get('sku') || '').trim(),
                  price: Number(formData.get('price')),
                  stock: Number(formData.get('stock')),
                  min: Number(formData.get('min')),
                  cat: formData.get('cat') as string,
                  ncm: rawNcm,
                  ncmSource: ncmChosenFromList ? 'list' : 'manual',
                  cest: normalizedCest,
                  origin: String(formData.get('origin') || '').trim(),
                  taxApiCode: rawTaxApiCode,
                  taxCategory: String(formData.get('taxCategory') || taxCategoryValue || '').trim(),
                  fiscalCfop: String(formData.get('fiscalCfop') || fiscalCfopValue || '').trim(),
                  fiscalCstIcms: String(formData.get('fiscalCstIcms') || fiscalCstIcmsValue || '').trim(),
                  fiscalCstPis: String(formData.get('fiscalCstPis') || fiscalCstPisValue || '').trim(),
                  fiscalCstCofins: String(formData.get('fiscalCstCofins') || fiscalCstCofinsValue || '').trim(),
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
                setProductImageFit('cover');
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Imagem do Produto</Label>
                      <p className="text-[10px] text-muted-foreground">
                        Campo opcional. Essa imagem ajuda a identificar o produto na venda, estoque e impressão.
                      </p>
                      <div 
                        className="border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-2 bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer relative overflow-hidden group"
                        onClick={() => document.getElementById('product-image-upload')?.click()}
                      >
                        {productImage || editingProduct?.image ? (
                          <>
                            <img src={productImage || editingProduct?.image} alt="Preview" className={cn('w-full h-full', productImageFitClass)} />
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
                      <div className="space-y-2">
                        <Label className="text-xs">Ajuste de Enquadramento da Imagem</Label>
                        <Select value={productImageFit} onValueChange={(value: 'cover' | 'contain' | 'fill') => setProductImageFit(value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Selecione o ajuste" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cover">Preencher (corta bordas, mantém proporção)</SelectItem>
                            <SelectItem value="contain">Ajustar (mostra tudo, pode sobrar espaço)</SelectItem>
                            <SelectItem value="fill">Esticar (preenche sem sobras)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">Esse ajuste será salvo para o produto e aplicado nas visualizações.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prod-name">Nome do Produto</Label>
                      <Input
                        id="prod-name"
                        name="name"
                        value={productNameValue}
                        onChange={(e) => setProductNameValue(e.target.value)}
                        placeholder="Ex: Tela iPhone 14"
                        required
                      />
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
                        <Label htmlFor="prod-brand">Marca</Label>
                        <Input id="prod-brand" name="brand" defaultValue={editingProduct?.brand || ''} placeholder="Ex: Samsung, Apple, JBL" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prod-model">Modelo</Label>
                        <Input id="prod-model" name="model" defaultValue={editingProduct?.model || ''} placeholder="Ex: A54, iPhone 14, Tune 510BT" />
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

                    <div className="pt-4 border-t mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                         <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                           <ShieldCheck className="w-3 h-3" /> Dados Fiscais (NFC-e)
                         </h4>
                         <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-secondary/20">
                           <span
                             className={cn(
                               'inline-flex items-center rounded-md px-2 py-1 text-[10px] font-black uppercase',
                               strictFiscalModeActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                             )}
                           >
                             {strictFiscalModeActive ? 'Estrito Ativo' : 'Estrito Desativado'}
                           </span>
                           <p className="text-[11px] text-muted-foreground">
                             {strictFiscalModeActive
                               ? 'Exige NCM valido e selecionado da lista oficial para salvar.'
                               : 'Permite cadastro fiscal flexivel; ainda recomendamos selecionar NCM pela lista.'}
                           </p>
                         </div>
                         {!fiscalEnabled && (
                           <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                             Módulo fiscal da empresa está inativo. Você ainda pode preencher os campos fiscais para preparar o cadastro.
                           </div>
                         )}
                         <div className="space-y-2">
                           <Label className="text-xs">Buscar NCM por nome do produto</Label>
                           <div className="flex gap-2 flex-wrap items-center">
                             <Button
                               type="button"
                               variant="outline"
                               className="h-8 text-xs"
                               onClick={handleLookupNcmByProductName}
                               disabled={isNcmLookupLoading}
                             >
                               {isNcmLookupLoading ? 'Consultando...' : 'Buscar NCM e Tributos'}
                             </Button>
                             {selectedNcmLookupCode && (
                               <button
                                 type="button"
                                 className="text-xs text-primary underline underline-offset-2"
                                 onClick={() => setIsNcmResultsModalOpen(true)}
                               >
                                 {selectedNcmLookupCode} — ver resultados
                               </button>
                             )}
                           </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">NCM</Label>
                             <Input
                               name="ncm"
                               placeholder="Ex: 8517.13.00"
                               className="h-8 text-xs"
                               value={ncmInputValue}
                                onChange={(e) => {
                                  setNcmInputValue(e.target.value);
                                  setNcmChosenFromList(false);
                                }}
                               list="ncm-suggestions"
                             />
                             <datalist id="ncm-suggestions">
                               {ncmLookupResults.map((item) => (
                                 <option key={`${item.codigo}-ncm`} value={item.codigo}>{item.descricao}</option>
                               ))}
                             </datalist>
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">CEST</Label>
                             <Select name="cest" value={cestInputValue} onValueChange={(value) => setCestInputValue(value)}>
                               <SelectTrigger className="h-8 text-xs">
                                 <SelectValue placeholder="Selecione o CEST sugerido" />
                               </SelectTrigger>
                               <SelectContent>
                                 {activeFiscalProfile.cestOptions.map((opt) => (
                                   <SelectItem key={`cest-${opt.value}-${opt.label}`} value={opt.value}>
                                     {opt.label} - {opt.description}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <p className="text-[10px] text-muted-foreground">Sugestoes relacionadas ao NCM selecionado.</p>
                             {strictFiscalModeActive && !ncmChosenFromList && (
                               <p className="text-[10px] text-amber-700">Modo fiscal estrito: escolha um NCM da lista de resultados para salvar.</p>
                             )}
                           </div>
                         </div>
                         <div className="rounded-md border bg-secondary/20 px-3 py-2">
                           <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                             Perfil Fiscal Ativo: {activeFiscalProfile.title}
                           </p>
                           <p className="text-[11px] text-muted-foreground mt-1">
                             As opcoes abaixo sao sugestoes por NCM para afinar o cadastro. Valide com seu contador para a UF de emissao.
                           </p>
                           {companyFiscalSettings?.accountantAssistantEnabled && (
                             <p className="text-[11px] text-emerald-700 mt-1">
                               Assistente Contador IA ativo para apoiar sugestoes fiscais neste cadastro.
                             </p>
                           )}
                           {companyActivityTemplate && (
                             <p className="text-[11px] text-emerald-700 mt-1">
                               Relacao por atividade fiscal ({companyFiscalSettings?.fiscalActivityCode || 'sem codigo'}):
                               {' '}{companyActivityTemplate.name}.
                             </p>
                           )}
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">Código API de Tributo</Label>
                             <Input
                               name="taxApiCode"
                               placeholder="Código para consulta fiscal"
                               className="h-8 text-xs"
                               value={taxApiCodeValue}
                               onChange={(e) => setTaxApiCodeValue(e.target.value)}
                             />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">Categoria Fiscal (Opcional)</Label>
                             <Select name="taxCategory" value={taxCategoryValue} onValueChange={setTaxCategoryValue}>
                               <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                               <SelectContent>
                                 {taxCategoryOptions.map((opt) => (
                                   <SelectItem key={`taxcat-${opt.value}`} value={opt.value}>{opt.label}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <p className="text-[10px] text-muted-foreground">{selectedTaxCategoryOption?.description || 'Escolha a categoria fiscal mais adequada para a operacao.'}</p>
                           </div>
                         </div>
                         <div className="space-y-2">
                           <Label className="text-xs">Origem da Mercadoria</Label>
                           <Select name="origin" defaultValue={editingProduct?.origin || '0'}>
                             <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="0">0 - Nacional</SelectItem>
                               <SelectItem value="1">1 - Estrangeira - Direta</SelectItem>
                               <SelectItem value="2">2 - Estrangeira - Interna</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">CFOP (Opcional)</Label>
                             <Select name="fiscalCfop" value={fiscalCfopValue} onValueChange={setFiscalCfopValue}>
                               <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione CFOP" /></SelectTrigger>
                               <SelectContent>
                                 {cfopOptions.map((opt) => (
                                   <SelectItem key={`cfop-${opt.value}`} value={opt.value}>{opt.value}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <p className="text-[10px] text-muted-foreground">{selectedCfopOption?.description || 'Codigo fiscal da natureza da operacao de venda.'}</p>
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">CST ICMS (Opcional)</Label>
                             <Select name="fiscalCstIcms" value={fiscalCstIcmsValue} onValueChange={setFiscalCstIcmsValue}>
                               <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione CST ICMS" /></SelectTrigger>
                               <SelectContent>
                                 {cstIcmsOptions.map((opt) => (
                                   <SelectItem key={`icms-${opt.value}`} value={opt.value}>{opt.value}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <p className="text-[10px] text-muted-foreground">{selectedCstIcmsOption?.description || 'Situacao tributaria do ICMS para esta operacao.'}</p>
                           </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-xs">CST PIS (Opcional)</Label>
                             <Select name="fiscalCstPis" value={fiscalCstPisValue} onValueChange={setFiscalCstPisValue}>
                               <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione CST PIS" /></SelectTrigger>
                               <SelectContent>
                                 {cstPisOptions.map((opt) => (
                                   <SelectItem key={`pis-${opt.value}`} value={opt.value}>{opt.value}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <p className="text-[10px] text-muted-foreground">{selectedCstPisOption?.description || 'Classificacao da tributacao do PIS na saida.'}</p>
                           </div>
                           <div className="space-y-2">
                             <Label className="text-xs">CST COFINS (Opcional)</Label>
                             <Select name="fiscalCstCofins" value={fiscalCstCofinsValue} onValueChange={setFiscalCstCofinsValue}>
                               <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione CST COFINS" /></SelectTrigger>
                               <SelectContent>
                                 {cstCofinsOptions.map((opt) => (
                                   <SelectItem key={`cofins-${opt.value}`} value={opt.value}>{opt.value}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <p className="text-[10px] text-muted-foreground">{selectedCstCofinsOption?.description || 'Classificacao da tributacao da COFINS na saida.'}</p>
                           </div>
                         </div>
                    </div>
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

          {/* Modal de resultados NCM */}
          <Dialog open={isNcmResultsModalOpen} onOpenChange={setIsNcmResultsModalOpen}>
            <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Resultados NCM — {productNameValue}
                </DialogTitle>
                <DialogDescription>
                  {filteredNcmModalResults.length} de {ncmLookupResults.length} resultado(s). Você pode filtrar por capítulo e pesquisar por código NCM ou descrição.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Filtrar por código (ex: 8517) ou descrição..."
                      value={ncmModalSearch}
                      onChange={(e) => setNcmModalSearch(e.target.value)}
                      className="h-9 text-sm"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Select value={ncmModalChapterFilter} onValueChange={setNcmModalChapterFilter}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Capítulo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os capítulos</SelectItem>
                        {ncmModalChapterOptions.map((chapter) => (
                          <SelectItem key={`chapter-${chapter}`} value={chapter}>Capítulo {chapter}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Base local de NCM com atualização automática periódica. A API externa é usada como backup quando necessário.
                </p>
                <div className="max-h-[55vh] overflow-y-auto rounded-md border custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                      <tr>
                        <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest w-32">Código NCM</th>
                        <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest">Descrição</th>
                        <th className="px-4 py-2 w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNcmModalResults
                        .map((item, index) => (
                          <tr
                            key={`${item.codigo}-${index}`}
                            className={`border-b transition-colors cursor-pointer hover:bg-primary/8 ${selectedNcmLookupCode === item.codigo ? 'bg-primary/10 font-medium' : index % 2 === 0 ? 'bg-background' : 'bg-secondary/10'}`}
                            onClick={() => handleSelectNcmLookupResult(item)}
                          >
                            <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">{item.codigo}</td>
                            <td className="px-4 py-2.5 text-xs leading-snug">{item.descricao}</td>
                            <td className="px-4 py-2.5 text-right">
                              {selectedNcmLookupCode === item.codigo ? (
                                <span className="text-[10px] font-black uppercase text-primary">Selecionado</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Selecionar</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {filteredNcmModalResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <p className="text-sm">Nenhum resultado para "{ncmModalSearch}"</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNcmResultsModalOpen(false)}>Fechar</Button>
              </DialogFooter>
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
                 <h3 className="text-3xl font-black mt-1">R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-2 mt-4 bg-white/20 px-3 py-1 rounded-full w-fit">
                   <TrendingUp className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase">Saude: {stockHealthLabel}</span>
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
          value={`${inventoryTurnover.toFixed(1)}x / mês`} 
          icon={RefreshCw} 
          color="bg-blue-600" 
          trend={Number.isFinite(inventoryTrend) ? Math.round(inventoryTrend) : 0}
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
                  placeholder="Buscar produto por nome, marca, modelo ou SKU..." 
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
                    <th className="px-6 py-3">Conf. Fiscal</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStockProducts.length > 0 ? filteredStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg border bg-secondary/20 overflow-hidden flex items-center justify-center">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className={cn(
                                  'w-full h-full',
                                  p.imageFit === 'contain'
                                    ? 'object-contain'
                                    : p.imageFit === 'fill'
                                      ? 'object-fill'
                                      : 'object-cover'
                                )}
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="flex items-center flex-wrap gap-0.5">{p.name}{p.importedFromBackup && <BackupBadge />}</p>
                            {(p.brand || p.model) && (
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                {[p.brand, p.model].filter(Boolean).join(' / ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
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
                      <td className="px-6 py-4">
                        {(() => {
                          const confidence = getProductFiscalConfidence(p);
                          return (
                            <div className="flex flex-col gap-1">
                              <span className={cn('inline-flex items-center justify-center rounded-md border px-2 py-1 text-[10px] font-black uppercase w-fit', confidence.className)}>
                                {confidence.level}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{confidence.score}%</span>
                            </div>
                          );
                        })()}
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
                <div className="text-2xl font-bold">{inventoryTurnover.toFixed(2)}x</div>
                <p className={cn(
                  'text-xs mt-1 flex items-center gap-1',
                  inventoryTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'
                )}>
                  {inventoryTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {inventoryTrend >= 0 ? '+' : ''}{inventoryTrend.toFixed(1)}% vs. últimos 30 dias
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Acuracidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryAccuracy.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Baseado em vendas e ocorrências de RMA dos últimos 30 dias</p>
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
                        <td className="px-6 py-4 text-xs text-muted-foreground">{lastMovementBySku[p.sku] ? format(lastMovementBySku[p.sku], 'dd/MM/yyyy') : 'Sem movimentação'}</td>
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

  const [expenseCategories, setExpenseCategories] = useState<{ id: string; name: string; icon: any }[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<{ id: string; name: string; icon: any }[]>([]);

  useEffect(() => {
    if (expenseCategories.length === 0) {
      const names = Array.from(
        new Set(
          transactions
            .filter((item) => item.type === 'OUT' || Number(item.val) < 0)
            .map((item) => item.category)
            .filter(Boolean)
        )
      ) as string[];
      if (names.length > 0) {
        setExpenseCategories(names.map((name) => ({ id: safeRandomUUID(), name, icon: Tag })));
      }
    }

    if (incomeCategories.length === 0) {
      const names = Array.from(
        new Set(
          transactions
            .filter((item) => item.type === 'IN' || Number(item.val) > 0)
            .map((item) => item.category)
            .filter(Boolean)
        )
      ) as string[];
      if (names.length > 0) {
        setIncomeCategories(names.map((name) => ({ id: safeRandomUUID(), name, icon: Tag })));
      }
    }
  }, [transactions, expenseCategories.length, incomeCategories.length]);

  const payable = transactions.filter((item) => item.type === 'OUT' || Number(item.val) < 0);

  const receivable = transactions.filter((item) => item.type === 'IN' || Number(item.val) > 0);

  const fixedExpenses = payable.filter((item) => item.category).map((item) => ({
    id: item.id,
    desc: item.desc,
    val: Math.abs(Number(item.val) || 0),
    dueDay: item.date && String(item.date).includes('/') ? Number(String(item.date).split('/')[0]) : 0,
    category: item.category || 'Sem categoria',
  }));

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      date: item.date || '-',
      type: item.type === 'OUT' || Number(item.val) < 0 ? 'Despesa' : 'Venda',
      desc: item.desc || 'Sem descrição',
      client: item.customer || item.category || '-',
      method: item.method || item.status || '-',
      val: Math.abs(Number(item.val) || 0),
    }));

  // Cálculos de Saúde Financeira
  const totalCash = transactions.reduce((acc, curr) => acc + Number(curr.val || 0), 0);
  const totalReceivable = receivable.reduce((acc, curr) => acc + Math.abs(Number(curr.val) || 0), 0);
  const totalPayable = payable.reduce((acc, curr) => acc + Math.abs(Number(curr.val) || 0), 0);
  const fixedExpensesTotal = fixedExpenses.reduce((acc, curr) => acc + curr.val, 0);
  const stockValue = 0;

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
                      {expenseCategories.length > 0 ? (
                        expenseCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Nenhuma categoria cadastrada</SelectItem>
                      )}
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
                      {incomeCategories.length > 0 ? (
                        incomeCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Nenhuma categoria cadastrada</SelectItem>
                      )}
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
        <StatCard title="Saldo Atual" value={`R$ ${totalCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="bg-blue-600" />
        <StatCard title="A Receber" value={`R$ ${totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={ChevronRight} color="bg-emerald-500" />
        <StatCard title="A Pagar" value={`R$ ${totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={X} color="bg-rose-500" />
        <StatCard title="Custos Fixos" value={`R$ ${fixedExpensesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Clock} color="bg-amber-600" />
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
                    {recentTransactions.map((row) => (
                      <tr key={row.id} className="hover:bg-secondary/10 transition-colors">
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
                    {recentTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground italic">
                          Nenhuma transação registrada no banco de dados até o momento.
                        </td>
                      </tr>
                    )}
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
                                  case 'Aberta': return 'bg-blue-50/80 dark:bg-blue-500/10';
                                  case 'Em análise': return 'bg-purple-50/80 dark:bg-purple-500/10';
                                  case 'Aguardando aprovação': return 'bg-yellow-50/80 dark:bg-yellow-500/10';
                                  case 'Aguardando peça': return 'bg-orange-50/80 dark:bg-orange-500/10';
                                  case 'Em reparo': return 'bg-indigo-50/80 dark:bg-indigo-500/10';
                                  case 'Testes finais': return 'bg-cyan-50/80 dark:bg-cyan-500/10';
                                  case 'Pronta': return 'bg-emerald-50/80 dark:bg-emerald-500/10';
                                  case 'Entregue': return 'bg-slate-50/80 dark:bg-slate-500/10';
                                  case 'Finalizada': return 'bg-green-50/80 dark:bg-green-500/10';
                                  case 'Cancelada': return 'bg-rose-50/80 dark:bg-rose-500/10';
                                  default: return 'bg-white dark:bg-card';
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
                    <SelectTrigger><SelectValue placeholder={ROLE_LABELS[editingUser?.role || 'USUARIO'] || editingUser?.role || 'Técnico'} /></SelectTrigger>
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

  const products = allProducts;

  const filteredProducts = products.filter(p => 
    fuzzyMatch(p.name, search) || 
    fuzzyMatch(p.sku, search) ||
    fuzzyMatch(String(p.brand || ''), search) ||
    fuzzyMatch(String(p.model || ''), search)
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
                placeholder="Pesquisar Produto, Marca, Modelo ou SKU (F4)..." 
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
                        {(p.brand || p.model) && (
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{[p.brand, p.model].filter(Boolean).join(' / ')}</p>
                        )}
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
function TechnicalSupportView({
  user,
  company,
  allOrders,
  allProducts,
  supportSessions,
  setSupportSessions,
  isPremiumEnabled,
}: {
  user: User;
  company: Company;
  allOrders: ServiceOrder[];
  allProducts: any[];
  supportSessions: SupportSession[];
  setSupportSessions: React.Dispatch<React.SetStateAction<SupportSession[]>>;
  isPremiumEnabled: boolean;
}) {
  const companyScope = user.companyId || company.id || 'default';
  const [selectedOsId, setSelectedOsId] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [showOrderResults, setShowOrderResults] = useState(false);
  const [selectedSector, setSelectedSector] = useState<TechnicalSector>('Outro');
  const [selectedLevel, setSelectedLevel] = useState<TechnicalLevel>(1);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(supportSessions[0]?.id || null);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [saasAiConfig, setSaasAiConfig] = useState<AIProviderConfig>({ providerCatalogs: [], agentPrompts: [] });
  const [companyAiConfig, setCompanyAiConfig] = useState<AIProviderConfig>({
    providerCatalogs: [],
    companyDefaultProvider: 'openai',
    companyModelSource: 'provider-default',
  });

  const activeSession = supportSessions.find((session) => session.id === activeSessionId) || null;
  const activeOrder = activeSession ? allOrders.find((order) => order.id === activeSession.osId) || null : null;
  const activeOrders = allOrders.filter((order) => order.status !== 'Finalizada' && order.status !== 'Cancelada');

  const tokenize = (text: string) =>
    String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 2);

  const buildShortHistory = (session: SupportSession | null): string => {
    if (!session) return 'Sem historico recente.';
    return session.messages
      .slice(-6)
      .map((item) => `${item.role === 'agent' ? 'Agente' : 'Tecnico'}: ${String(item.text || '').replace(/\s+/g, ' ').trim().slice(0, 180)}`)
      .join(' | ');
  };

  const findCompatibleProducts = (order: ServiceOrder, userMessageText: string) => {
    const equipmentTokens = new Set(tokenize(`${order.equipment} ${order.brand} ${order.model}`));
    const intentTokens = new Set(tokenize(userMessageText));
    return allProducts
      .map((item) => {
        const productText = `${item.name || ''} ${item.sku || ''} ${item.brand || ''} ${item.model || ''}`;
        const productTokens = tokenize(productText);
        const equipmentHits = productTokens.filter((token) => equipmentTokens.has(token)).length;
        const intentHits = productTokens.filter((token) => intentTokens.has(token)).length;
        const score = equipmentHits * 2 + intentHits;
        return {
          item,
          score,
          compatibilityReason:
            equipmentHits > 0
              ? `coincidencia com equipamento/modelo (${equipmentHits})`
              : intentHits > 0
              ? `coincidencia com solicitacao tecnica (${intentHits})`
              : '',
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => ({
        name: entry.item.name,
        sku: entry.item.sku,
        price: Number(entry.item.price || 0),
        stock: Number(entry.item.stock || 0),
        compatibilityReason: entry.compatibilityReason,
      }));
  };

  useEffect(() => {
    axios
      .get('/api/ai/provider-config?scope=global')
      .then((res) => {
        setSaasAiConfig({
          openaiApiKey: res.data?.openaiApiKey || '',
          groqApiKey: res.data?.groqApiKey || '',
          geminiApiKey: res.data?.geminiApiKey || '',
          claudeApiKey: res.data?.claudeApiKey || '',
          providerCatalogs: Array.isArray(res.data?.providerCatalogs) ? res.data.providerCatalogs : [],
          agentPrompts: Array.isArray(res.data?.agentPrompts) ? res.data.agentPrompts : [],
          updatedAt: res.data?.updatedAt || '',
        });
      })
      .catch((err) => console.error('Erro ao carregar config global IA:', err));

    axios
      .get(`/api/ai/provider-config?scope=${encodeURIComponent(companyScope)}`)
      .then((res) => {
        setCompanyAiConfig({
          openaiApiKey: res.data?.openaiApiKey || '',
          groqApiKey: res.data?.groqApiKey || '',
          geminiApiKey: res.data?.geminiApiKey || '',
          claudeApiKey: res.data?.claudeApiKey || '',
          providerCatalogs: Array.isArray(res.data?.providerCatalogs) ? res.data.providerCatalogs : [],
          companyDefaultProvider: (res.data?.companyDefaultProvider || 'openai') as AIProvider,
          companyDefaultModel: res.data?.companyDefaultModel || '',
          companyModelSource: res.data?.companyModelSource === 'preset' ? 'preset' : 'provider-default',
          updatedAt: res.data?.updatedAt || '',
        });
      })
      .catch((err) => console.error('Erro ao carregar config empresa IA:', err));
  }, [companyScope]);

  useEffect(() => {
    if (!activeSessionId && supportSessions.length > 0) {
      setActiveSessionId(supportSessions[0].id);
    }
    if (activeSessionId && !supportSessions.some((s) => s.id === activeSessionId)) {
      setActiveSessionId(supportSessions[0]?.id || null);
    }
  }, [supportSessions, activeSessionId]);

  useEffect(() => {
    if (!selectedOsId) return;
    const order = allOrders.find((item) => item.id === selectedOsId);
    if (!order) return;
    setSelectedSector(detectTechnicalSector(order.equipment));
    setSelectedLevel(
      inferTechnicalLevel({
        defect: order.defect,
        diagnosis: order.diagnosis,
        equipment: `${order.equipment} ${order.brand} ${order.model}`,
      })
    );
  }, [selectedOsId, allOrders]);

  useEffect(() => {
    if (!activeSession) return;
    setSelectedSector(activeSession.sector);
    setSelectedLevel(activeSession.level);
    setOrderSearch(activeSession.customerName);
    setSelectedOsId(activeSession.osId);
  }, [activeSession?.id]);

  const selectedSaasCatalog =
    (saasAiConfig.providerCatalogs || []).find((item) => item.id === company.aiSaasCatalogId) ||
    (saasAiConfig.providerCatalogs || [])[0] ||
    null;

  const findFirstConfiguredProvider = (config?: AIProviderConfig): AIProvider | null => {
    if (!config) return null;
    if (String(config.openaiApiKey || '').trim()) return 'openai';
    if (String(config.groqApiKey || '').trim()) return 'groq';
    if (String(config.geminiApiKey || '').trim()) return 'gemini';
    if (String(config.claudeApiKey || '').trim()) return 'claude';
    return null;
  };

  const configuredProvider: AIProvider =
    company.aiAssistantMode === 'company-own'
      ? company.aiProvider || companyAiConfig.companyDefaultProvider || findFirstConfiguredProvider(companyAiConfig) || 'openai'
      : selectedSaasCatalog?.provider || company.aiProvider || findFirstConfiguredProvider(saasAiConfig) || 'openai';

  const configuredModel: string | undefined =
    company.aiAssistantMode === 'company-own'
      ? company.aiModelSource === 'preset'
        ? company.aiModel || companyAiConfig.companyDefaultModel || undefined
        : undefined
      : selectedSaasCatalog?.models?.find((m) => m.value === company.aiModel)?.value ||
        selectedSaasCatalog?.models?.[0]?.value;
  const activeSupportPrompts = useMemo(() => {
    const plan = (company.subscriptionPlan || 'Basic') as SubscriptionPlan;
    return (saasAiConfig.agentPrompts || []).filter((prompt) => {
      if (!prompt?.isActive) return false;
      if (prompt.area !== 'suporte-tecnico') return false;
      if (!Array.isArray(prompt.plans) || prompt.plans.length === 0) return true;
      return prompt.plans.includes(plan);
    });
  }, [saasAiConfig.agentPrompts, company.subscriptionPlan]);

  const filteredOrderOptions = useMemo(() => {
    if (!orderSearch.trim()) return activeOrders.slice(0, 25);
    return activeOrders.filter((order) =>
      fuzzyMatch(order.customerName, orderSearch) ||
      fuzzyMatch(order.number, orderSearch) ||
      fuzzyMatch(order.equipment, orderSearch) ||
      fuzzyMatch(order.brand, orderSearch) ||
      fuzzyMatch(order.model, orderSearch)
    );
  }, [activeOrders, orderSearch]);

  const ordersById = useMemo(() => {
    const map = new Map<string, ServiceOrder>();
    allOrders.forEach((order) => map.set(order.id, order));
    return map;
  }, [allOrders]);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [activeSessionId, activeSession?.messages.length, isSending]);

  const selectOrderForContext = (order: ServiceOrder) => {
    setSelectedOsId(order.id);
    setOrderSearch(order.customerName);
    setShowOrderResults(false);
    setSelectedSector(detectTechnicalSector(order.equipment));
    setSelectedLevel(
      inferTechnicalLevel({
        defect: order.defect,
        diagnosis: order.diagnosis,
        equipment: `${order.equipment} ${order.brand} ${order.model}`,
      })
    );
  };

  const resolveRuntimeScope = () => (company.aiAssistantMode === 'company-own' ? companyScope : 'global');

  const startOrOpenSession = () => {
    if (!selectedOsId) {
      toast.error('Selecione uma O.S. para iniciar o suporte.');
      return;
    }
    const order = allOrders.find((item) => item.id === selectedOsId);
    if (!order) {
      toast.error('O.S. não encontrada.');
      return;
    }

    const existing = supportSessions.find((session) => session.osId === selectedOsId);
    if (existing) {
      setActiveSessionId(existing.id);
      setSelectedSector(existing.sector);
      setSelectedLevel(existing.level);
      toast.info('Contexto da O.S. reaberto.');
      return;
    }

    const nowIso = new Date().toISOString();
    const inferredSector = selectedSector === 'Outro' ? detectTechnicalSector(order.equipment) : selectedSector;
    const inferredLevel = inferTechnicalLevel({
      defect: order.defect,
      diagnosis: order.diagnosis,
      equipment: `${order.equipment} ${order.brand} ${order.model}`,
    });

    const created: SupportSession = {
      id: safeRandomUUID(),
      osId: order.id,
      osNumber: order.number,
      customerName: order.customerName,
      equipment: `${order.equipment} ${order.brand} ${order.model}`.trim(),
      sector: inferredSector,
      level: inferredLevel,
      createdAt: nowIso,
      updatedAt: nowIso,
      expiresAt: getSupportExpiryDate(nowIso),
      messages: [
        {
          id: safeRandomUUID(),
          role: 'agent',
          text: `Contexto técnico iniciado para ${order.number} (${order.customerName}).`,
          createdAt: nowIso,
          agents: getRecommendedAgents(inferredSector, inferredLevel, order.defect),
        },
      ],
    };

    setSupportSessions((prev) => [created, ...prev]);
    setActiveSessionId(created.id);
    setSelectedSector(created.sector);
    setSelectedLevel(created.level);
    toast.success('Suporte técnico iniciado com contexto da O.S.');
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const mapped: SupportAttachment[] = files.map((file) => ({
      id: safeRandomUUID(),
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      category: file.type.startsWith('image/') ? 'image' : 'document',
    }));
    setAttachments(mapped);
  };

  const sendSupportRequest = async () => {
    if (isSending) return;
    if (!activeSession) {
      toast.error('Inicie um contexto de suporte técnico antes de enviar.');
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      toast.error('Digite a solicitação ou anexe um arquivo.');
      return;
    }

    const order = allOrders.find((item) => item.id === activeSession.osId);
    if (!order) {
      toast.error('Esta O.S. foi removida.');
      return;
    }

    const runtimeProvider = configuredProvider;
    const runtimeModel = configuredModel;
    const runtimeScope = resolveRuntimeScope();
    const nowIso = new Date().toISOString();
    const userMessageText = message.trim() || 'Solicitação com anexos enviados.';
    const agents = getRecommendedAgents(selectedSector, selectedLevel, `${order.defect} ${message}`);
    const compatibleInventory = findCompatibleProducts(order, userMessageText);

    const needsSpecsLookup =
      /(especifica|ficha tecnica|configurac|spec|caracteristica|liquido metal|metal liquido|cpu|gpu|processador|refrigerac|cooler|heatsink|thermal|pasta termica)/i.test(
        userMessageText
      );
    const needsPartsLookup = /(peca|pe[çc]a|compat|upgrade|memoria|ssd|hd|bateria|teclado|tela|fonte|carregador)/i.test(
      userMessageText
    );

    let webReferences: Array<{ title: string; url: string; snippet?: string }> = [];
    if (needsSpecsLookup || (needsPartsLookup && compatibleInventory.length === 0)) {
      const lookupQuery = needsSpecsLookup
        ? `${order.equipment} ${order.brand} ${order.model} especificacoes tecnicas`
        : `pecas compativeis ${order.equipment} ${order.brand} ${order.model} ${userMessageText}`;
      try {
        const webRes = await axios.post('/api/ai/web-search', { query: lookupQuery, limit: 6 });
        webReferences = Array.isArray(webRes.data?.results)
          ? webRes.data.results
              .map((item: any) => ({
                title: String(item?.title || '').trim(),
                url: String(item?.url || '').trim(),
                snippet: String(item?.snippet || '').trim(),
              }))
              .filter((item: { title: string; url: string }) => item.title && item.url)
          : [];
      } catch (lookupError) {
        console.error('Erro na busca web de apoio técnico:', lookupError);
      }
    }

    const sourceLabel =
      compatibleInventory.length > 0 && webReferences.length > 0
        ? 'estoque local + web'
        : compatibleInventory.length > 0
        ? 'estoque local'
        : webReferences.length > 0
        ? 'web'
        : 'contexto técnico interno';

    const basePrompt = buildTechnicalPrompt({
      companyName: company.name,
      technicianName: user.name,
      os: order,
      sector: selectedSector,
      level: selectedLevel,
      userMessage: userMessageText,
      attachments,
      shortHistory: buildShortHistory(activeSession),
      inventory: allProducts.map((item) => ({
        name: item.name,
        sku: item.sku,
        price: Number(item.price || 0),
        stock: Number(item.stock || 0),
      })),
      compatibleInventory,
      webReferences,
    });
    const supportPromptDirectives = activeSupportPrompts
      .map(
        (item) =>
          `Prompt customizado (${item.title}): ${MANDATORY_PROMPT_HELP_DIRECTIVE}\n${String(item.prompt || '').trim()}`
      )
      .join('\n\n');
    const prompt = supportPromptDirectives ? `${basePrompt}\n\n${supportPromptDirectives}` : basePrompt;

    const technicianMessage: SupportMessage = {
      id: safeRandomUUID(),
      role: 'technician',
      text: userMessageText,
      createdAt: nowIso,
      attachments,
    };

    setSupportSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              sector: selectedSector,
              level: selectedLevel,
              updatedAt: nowIso,
              expiresAt: getSupportExpiryDate(nowIso),
              messages: [...session.messages, technicianMessage],
            }
          : session
      )
    );
    setMessage('');
    setAttachments([]);
    setIsSending(true);

    try {
      const response = await axios.post('/api/ai/technical-support/query', {
        scope: runtimeScope,
        provider: runtimeProvider,
        model: runtimeModel,
        prompt,
        userMessage: userMessageText,
        sessionId: activeSession.id,
        osId: order.id,
        webContext: webReferences,
        temperature: 0.25,
      });
      const aiText = String(response.data?.text || '').trim();
      if (!aiText) throw new Error('Resposta vazia do provider.');

      const agentMessage: SupportMessage = {
        id: safeRandomUUID(),
        role: 'agent',
        text: aiText,
        createdAt: new Date().toISOString(),
        agents,
      };

      setSupportSessions((prev) =>
        prev.map((session) =>
          session.id === activeSession.id
            ? { ...session, updatedAt: new Date().toISOString(), expiresAt: getSupportExpiryDate(), messages: [...session.messages, agentMessage] }
            : session
        )
      );
      toast.success(`Resposta dos agentes recebida (${sourceLabel}).`);
    } catch (error: any) {
      const fallbackText = buildMockAgentResponse({
        os: order,
        sector: selectedSector,
        level: selectedLevel,
        message: userMessageText,
        recommendedAgents: agents,
        attachments,
      });
      const apiError = error?.response?.data?.detail || error?.response?.data?.error || error?.message || 'Falha ao consultar provider de IA.';
      const agentMessage: SupportMessage = {
        id: safeRandomUUID(),
        role: 'agent',
        text: fallbackText,
        createdAt: new Date().toISOString(),
        agents,
      };
      setSupportSessions((prev) =>
        prev.map((session) =>
          session.id === activeSession.id
            ? { ...session, updatedAt: new Date().toISOString(), expiresAt: getSupportExpiryDate(), messages: [...session.messages, agentMessage] }
            : session
        )
      );
      toast.error(`Fallback local aplicado (${sourceLabel}): ${String(apiError).slice(0, 120)}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!isPremiumEnabled) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Assistente Técnico</h1>
        <Card className="border-none shadow-sm">
          <CardContent className="py-10 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 mx-auto text-amber-500" />
            <p className="font-semibold">Funcao disponivel apenas para contas da empresa.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedOrder = selectedOsId ? allOrders.find((item) => item.id === selectedOsId) || null : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistente Técnico</h1>
        <p className="text-muted-foreground">Acompanhamento completo do defeito até a entrega com nível técnico automático.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Novo Contexto de Atendimento IA</CardTitle>
          <CardDescription>Digite o nome do cliente para localizar a O.S. com busca inteligente.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-2 lg:col-span-2">
            <Label>Ordem de Serviço</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={orderSearch}
                onChange={(e) => {
                  setOrderSearch(e.target.value);
                  setSelectedOsId('');
                  setShowOrderResults(true);
                }}
                onFocus={() => setShowOrderResults(true)}
                onBlur={() => setTimeout(() => setShowOrderResults(false), 120)}
                className="pl-9"
                placeholder="Cliente, número da O.S. ou equipamento"
              />
              {showOrderResults && filteredOrderOptions.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
                  {filteredOrderOptions.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/40"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectOrderForContext(order)}
                    >
                      <span className="font-semibold">{order.customerName}</span>
                      <span className="text-muted-foreground"> • {order.number} • {order.equipment}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedOrder && <p className="text-xs text-muted-foreground">O.S. selecionada: {selectedOrder.number} • {selectedOrder.customerName}</p>}
          </div>
          <div className="space-y-2">
            <Label>Setor Técnico</Label>
            <Select value={selectedSector} onValueChange={(value) => setSelectedSector(value as TechnicalSector)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Notebook-PC-AllinOne">Notebook, PC e All-in-One</SelectItem>
                <SelectItem value="Celulares-Tablets">Celulares e Tablets</SelectItem>
                <SelectItem value="Impressoras-Scanners">Impressoras e Scanners</SelectItem>
                <SelectItem value="Televisores">Televisores</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nível Técnico (Automático)</Label>
            <div className="h-10 rounded-md border bg-secondary/20 px-3 flex items-center justify-between">
              <span className="text-sm font-medium">N{selectedLevel}</span>
              <Badge variant="outline" className="text-[10px]">AUTO</Badge>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <Button type="button" onClick={startOrOpenSession} className="gap-2"><MessageSquare className="w-4 h-4" /> Iniciar / Abrir Contexto</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Contextos Ativos</CardTitle>
            <CardDescription>Expiram automaticamente em {SUPPORT_RETENTION_DAYS} dias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {supportSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum contexto criado ainda.</p>
            ) : (
              supportSessions
                .slice()
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'rounded-lg border p-3 space-y-2 cursor-pointer transition-colors',
                      activeSessionId === session.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary/20'
                    )}
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{session.osNumber}</p>
                        <p className="text-xs text-muted-foreground">{session.customerName}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">N{session.level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{session.equipment}</p>
                    <p className="text-xs text-muted-foreground">
                      Defeito: {(ordersById.get(session.osId)?.defect || 'Defeito não registrado.').slice(0, 120)}
                    </p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Chat de Suporte IA</CardTitle>
            <CardDescription>
              {activeSession ? `OS ${activeSession.osNumber} - ${activeSession.customerName}` : 'Selecione ou inicie um contexto para conversar com os agentes.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!activeSession ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Nenhum contexto ativo selecionado.</div>
            ) : (
              <>
                <div className="rounded-lg border bg-secondary/10 p-3 text-xs space-y-1">
                  <p><strong>Cliente:</strong> {activeSession.customerName}</p>
                  <p><strong>Equipamento:</strong> {activeSession.equipment}</p>
                  <p><strong>Status da O.S.:</strong> {activeOrder?.status || 'n/a'}</p>
                </div>

                <div ref={chatScrollRef} className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
                  {activeSession.messages.map((item) => (
                    <div key={item.id} className={cn('flex', item.role === 'agent' ? 'justify-start' : 'justify-end')}>
                      <div
                        className={cn(
                          'max-w-[90%] rounded-2xl border px-4 py-3 shadow-sm',
                          item.role === 'agent' ? 'bg-primary/5 border-primary/20' : 'bg-card'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2 gap-3">
                          <p className="text-xs font-semibold uppercase tracking-wide">
                            {item.role === 'agent' ? 'Agentes IA' : 'Usuario'}
                          </p>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(item.createdAt), 'dd/MM HH:mm')}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                    Configuracao de IA aplicada automaticamente conforme definido em <strong>Configuracoes &gt; API &gt; Agentes IA</strong>.
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Descreva o caso, testes já executados e onde travou no reparo..."
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer border rounded-md px-3 py-2 hover:bg-secondary/30">
                      <UploadCloud className="w-4 h-4" />
                      Anexar documento/imagem
                      <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleAttachmentChange} />
                    </label>
                    {attachments.map((file) => (
                      <Badge key={file.id} variant="outline" className="text-[10px]">{file.name}</Badge>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" onClick={sendSupportRequest} className="gap-2" disabled={isSending}>
                      <MessageSquare className="w-4 h-4" /> {isSending ? 'Consultando IA...' : 'Enviar para Agentes'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Migration Assistant ──────────────────────────────────────────────────────

type MigrationEntityType = 'produtos' | 'clientes' | 'os' | 'servicos' | 'fornecedores';

interface MigrationFieldDef {
  key: string;
  label: string;
  required?: boolean;
}

const MIGRATION_ENTITY_FIELDS: Record<MigrationEntityType, MigrationFieldDef[]> = {
  produtos: [
    { key: 'name', label: 'Nome', required: true },
    { key: 'sku', label: 'SKU / Código' },
    { key: 'category', label: 'Categoria' },
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'cost', label: 'Valor de Custo' },
    { key: 'price', label: 'Valor de Venda', required: true },
    { key: 'stock', label: 'Estoque' },
    { key: 'ncm', label: 'NCM' },
    { key: 'cest', label: 'CEST' },
    { key: 'fiscalCfop', label: 'CFOP' },
    { key: 'fiscalCstIcms', label: 'CST ICMS' },
    { key: 'fiscalCstPis', label: 'CST PIS' },
    { key: 'fiscalCstCofins', label: 'CST COFINS' },
    { key: 'origin', label: 'Origem (0-8)' },
    { key: 'supplierId', label: 'Fornecedor (nome ou ID)' },
  ],
  clientes: [
    { key: 'name', label: 'Nome Completo', required: true },
    { key: 'document', label: 'CPF / CNPJ' },
    { key: 'ie', label: 'Inscrição Estadual' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefone Principal' },
    { key: 'phone2', label: 'Telefone Secundário' },
    { key: 'addressStreet', label: 'Logradouro' },
    { key: 'addressNumber', label: 'Número' },
    { key: 'addressNeighborhood', label: 'Bairro' },
    { key: 'addressCity', label: 'Cidade' },
    { key: 'addressState', label: 'Estado (UF)' },
    { key: 'addressZip', label: 'CEP' },
  ],
  os: [
    { key: 'customerName', label: 'Nome do Cliente', required: true },
    { key: 'equipment', label: 'Equipamento', required: true },
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'serialNumber', label: 'Número de Série' },
    { key: 'defect', label: 'Defeito Relatado' },
    { key: 'accessories', label: 'Acessórios' },
    { key: 'status', label: 'Status' },
    { key: 'value', label: 'Valor Total' },
    { key: 'diagnosisDeadline', label: 'Prazo de Diagnóstico' },
    { key: 'completionDeadline', label: 'Prazo de Conclusão / Data' },
  ],
  servicos: [
    { key: 'name', label: 'Nome do Serviço', required: true },
    { key: 'fiscalServiceCode', label: 'Código Fiscal (ISS/LC116)' },
    { key: 'price', label: 'Valor', required: true },
    { key: 'category', label: 'Categoria' },
  ],
  fornecedores: [
    { key: 'name', label: 'Razão Social / Nome', required: true },
    { key: 'document', label: 'CNPJ / CPF' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefone' },
    { key: 'contactName', label: 'Pessoa de Contato' },
    { key: 'category', label: 'Categoria' },
    { key: 'address', label: 'Endereço' },
  ],
};

const MIGRATION_ENTITY_LABELS: Record<MigrationEntityType, string> = {
  produtos: 'Produtos',
  clientes: 'Clientes',
  os: 'Ordens de Serviço',
  servicos: 'Serviços',
  fornecedores: 'Fornecedores',
};

function parseCsvText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if ((ch === ',' || ch === ';' || ch === '\t') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const cols = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cols[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

function BackupBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-300 ml-1 align-middle select-none">
      <Database className="w-2.5 h-2.5" />
      backup
    </span>
  );
}

function MigrationAssistantView({
  activeCompanyId,
  setAllProducts,
  setGlobalCustomers,
  setAllOrders,
  setSuppliers,
}: {
  activeCompanyId: string;
  setAllProducts: React.Dispatch<React.SetStateAction<any[]>>;
  setGlobalCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  setAllOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}) {
  const [activeEntity, setActiveEntity] = useState<MigrationEntityType>('produtos');
  const [step, setStep] = useState<'paste' | 'map' | 'preview' | 'done'>('paste');
  const [csvText, setCsvText] = useState('');
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importedCount, setImportedCount] = useState(0);

  const entityFields = MIGRATION_ENTITY_FIELDS[activeEntity];

  const resetWizard = () => {
    setStep('paste');
    setCsvText('');
    setParsedHeaders([]);
    setParsedRows([]);
    setColumnMapping({});
    setImportedCount(0);
  };

  const handleEntityChange = (entity: MigrationEntityType) => {
    setActiveEntity(entity);
    resetWizard();
  };

  const handleParse = () => {
    const { headers, rows } = parseCsvText(csvText);
    if (headers.length === 0 || rows.length === 0) {
      toast.error('Nenhum dado encontrado. Verifique o formato do arquivo.');
      return;
    }
    setParsedHeaders(headers);
    setParsedRows(rows);
    // Auto-map columns by fuzzy label match
    const autoMap: Record<string, string> = {};
    entityFields.forEach(field => {
      const match = headers.find(h =>
        h.toLowerCase().replace(/[_\s-]/g, '') === field.label.toLowerCase().replace(/[_\s-]/g, '') ||
        h.toLowerCase().replace(/[_\s-]/g, '') === field.key.toLowerCase()
      );
      if (match) autoMap[field.key] = match;
    });
    setColumnMapping(autoMap);
    setStep('map');
  };

  const handleConfirmMapping = () => {
    const requiredMissing = entityFields
      .filter(f => f.required && !columnMapping[f.key])
      .map(f => f.label);
    if (requiredMissing.length > 0) {
      toast.error(`Campos obrigatórios não mapeados: ${requiredMissing.join(', ')}`);
      return;
    }
    setStep('preview');
  };

  const mapRow = (row: Record<string, string>): Record<string, string> => {
    const result: Record<string, string> = {};
    entityFields.forEach(field => {
      const srcCol = columnMapping[field.key];
      result[field.key] = srcCol ? (row[srcCol] ?? '') : '';
    });
    return result;
  };

  const handleImport = () => {
    const now = new Date().toISOString();
    const mapped = parsedRows.map(row => mapRow(row));

    if (activeEntity === 'produtos') {
      const newItems = mapped.map(r => ({
        id: `mig_${Math.random().toString(36).slice(2)}`,
        name: r.name || 'Produto Importado',
        sku: r.sku || '',
        brand: r.brand || '',
        model: r.model || '',
        category: r.category || '',
        cost: parseFloat(r.cost) || 0,
        price: parseFloat(r.price) || 0,
        stock: parseInt(r.stock) || 0,
        minStock: 0,
        ncm: r.ncm || '',
        cest: r.cest || '',
        fiscalCfop: r.fiscalCfop || '',
        fiscalCstIcms: r.fiscalCstIcms || '',
        fiscalCstPis: r.fiscalCstPis || '',
        fiscalCstCofins: r.fiscalCstCofins || '',
        origin: r.origin || '0',
        companyId: activeCompanyId,
        importedFromBackup: true,
      }));
      setAllProducts(prev => [...prev, ...newItems]);
    } else if (activeEntity === 'clientes') {
      const newItems = mapped.map(r => ({
        id: `mig_${Math.random().toString(36).slice(2)}`,
        name: r.name || 'Cliente Importado',
        document: r.document || '',
        ie: r.ie || '',
        email: r.email || '',
        phone: r.phone || '',
        phone2: r.phone2 || '',
        address: [r.addressStreet, r.addressNumber, r.addressNeighborhood, r.addressCity, r.addressState].filter(Boolean).join(', '),
        addressStreet: r.addressStreet || '',
        addressNumber: r.addressNumber || '',
        addressNeighborhood: r.addressNeighborhood || '',
        addressCity: r.addressCity || '',
        addressState: r.addressState || '',
        addressZip: r.addressZip || '',
        companyId: activeCompanyId,
        importedFromBackup: true,
      }));
      setGlobalCustomers(prev => [...prev, ...newItems]);
    } else if (activeEntity === 'os') {
      const newItems: ServiceOrder[] = mapped.map(r => ({
        id: `mig_${Math.random().toString(36).slice(2)}`,
        number: `MIG-${Math.floor(Math.random() * 90000) + 10000}`,
        customerId: '',
        customerName: r.customerName || 'Cliente Importado',
        equipment: r.equipment || '',
        brand: r.brand || '',
        model: r.model || '',
        serialNumber: r.serialNumber || '',
        defect: r.defect || '',
        accessories: r.accessories || '',
        status: (r.status as any) || 'Aberta',
        priority: 'Média',
        value: parseFloat(r.value) || 0,
        diagnosisDeadline: r.diagnosisDeadline || undefined,
        completionDeadline: r.completionDeadline || undefined,
        createdAt: now,
        updatedAt: now,
        companyId: activeCompanyId,
        importedFromBackup: true,
      }));
      setAllOrders(prev => [...prev, ...newItems]);
    } else if (activeEntity === 'servicos') {
      const newItems = mapped.map(r => ({
        id: `mig_${Math.random().toString(36).slice(2)}`,
        name: r.name || 'Serviço Importado',
        sku: r.fiscalServiceCode || '',
        price: parseFloat(r.price) || 0,
        stock: 9999,
        minStock: 0,
        cost: 0,
        category: r.category || 'Serviço',
        brand: '',
        model: '',
        companyId: activeCompanyId,
        isService: true,
        fiscalServiceCode: r.fiscalServiceCode || '',
        importedFromBackup: true,
      }));
      setAllProducts(prev => [...prev, ...newItems]);
    } else if (activeEntity === 'fornecedores') {
      const newItems: Supplier[] = mapped.map(r => ({
        id: `mig_${Math.random().toString(36).slice(2)}`,
        name: r.name || 'Fornecedor Importado',
        document: r.document || '',
        email: r.email || '',
        phone: r.phone || '',
        address: r.address || '',
        contactName: r.contactName || '',
        category: r.category || '',
        companyId: activeCompanyId,
        importedFromBackup: true,
      }));
      setSuppliers(prev => [...prev, ...newItems]);
    }

    setImportedCount(mapped.length);
    setStep('done');
    toast.success(`${mapped.length} registros importados com tag de backup!`);
  };

  const entityIcons: Record<MigrationEntityType, React.ReactNode> = {
    produtos: <Package className="w-4 h-4" />,
    clientes: <Users className="w-4 h-4" />,
    os: <Wrench className="w-4 h-4" />,
    servicos: <Briefcase className="w-4 h-4" />,
    fornecedores: <Truck className="w-4 h-4" />,
  };

  const entityColors: Record<MigrationEntityType, string> = {
    produtos: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    clientes: 'bg-blue-100 text-blue-700 border-blue-300',
    os: 'bg-purple-100 text-purple-700 border-purple-300',
    servicos: 'bg-orange-100 text-orange-700 border-orange-300',
    fornecedores: 'bg-rose-100 text-rose-700 border-rose-300',
  };

  const previewRows = parsedRows.slice(0, 5).map(mapRow);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistente de Migração</h1>
        <p className="text-muted-foreground">Importe dados de qualquer sistema externo e converta automaticamente para o formato do TechManager. Os registros importados recebem a tag <BackupBadge /> para identificação de origem.</p>
      </div>

      {/* Entity selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(MIGRATION_ENTITY_LABELS) as MigrationEntityType[]).map(entity => (
          <button
            key={entity}
            onClick={() => handleEntityChange(entity)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all',
              activeEntity === entity
                ? entityColors[entity] + ' shadow-sm'
                : 'bg-secondary/30 text-muted-foreground border-secondary hover:bg-secondary/60'
            )}
          >
            {entityIcons[entity]}
            {MIGRATION_ENTITY_LABELS[entity]}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg border', entityColors[activeEntity])}>
              {entityIcons[activeEntity]}
            </div>
            <div>
              <CardTitle>Importar {MIGRATION_ENTITY_LABELS[activeEntity]}</CardTitle>
              <CardDescription>
                {step === 'paste' && 'Cole os dados em CSV, TSV ou JSON, ou faça upload de um arquivo.'}
                {step === 'map' && `Mapeie as colunas do seu arquivo para os campos do TechManager. (${parsedRows.length} registros encontrados)`}
                {step === 'preview' && `Pré-visualização dos primeiros 5 registros antes de importar.`}
                {step === 'done' && `Importação concluída!`}
              </CardDescription>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 pt-2">
            {(['paste', 'map', 'preview', 'done'] as const).map((s, i) => (
              <React.Fragment key={s}>
                <div className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full',
                  step === s ? 'bg-primary text-primary-foreground' : 
                  (['paste','map','preview','done'].indexOf(step) > i ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary text-muted-foreground')
                )}>
                  {['paste','map','preview','done'].indexOf(step) > i ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                  {s === 'paste' ? 'Dados' : s === 'map' ? 'Mapeamento' : s === 'preview' ? 'Prévia' : 'Concluído'}
                </div>
                {i < 3 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step 1: Paste data */}
          {step === 'paste' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-bold mb-1">Como usar:</p>
                  <p>Exporte os dados do sistema de origem em formato CSV (separado por vírgula, ponto-e-vírgula ou tabulação). A primeira linha deve conter os nomes das colunas. Cole o conteúdo abaixo ou faça upload do arquivo.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Campos esperados para {MIGRATION_ENTITY_LABELS[activeEntity]}:</Label>
                <div className="flex flex-wrap gap-1.5">
                  {entityFields.map(f => (
                    <span key={f.key} className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full border font-medium',
                      f.required ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-secondary/50 text-muted-foreground border-secondary'
                    )}>
                      {f.label}{f.required ? ' *' : ''}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">* Campos obrigatórios</p>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Cole aqui os dados (CSV / TSV / JSON):</Label>
                <textarea
                  className="w-full h-48 p-3 rounded-xl border bg-secondary/10 font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={`Exemplo CSV:\nnome,cpf,email,telefone\nJoão Silva,123.456.789-00,joao@email.com,(11) 99999-0000`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border rounded-lg text-sm font-medium hover:bg-secondary/30 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload de Arquivo (.csv, .txt, .tsv)
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.txt,.tsv,.xls,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setCsvText(ev.target?.result as string || '');
                      reader.readAsText(file, 'UTF-8');
                    }}
                  />
                </label>
                <Button onClick={handleParse} disabled={csvText.trim().length === 0} className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Avançar para Mapeamento
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Column mapping */}
          {step === 'map' && (
            <div className="space-y-4">
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Campo TechManager</th>
                      <th className="px-4 py-3 text-left font-semibold">Obrigatório</th>
                      <th className="px-4 py-3 text-left font-semibold">Coluna do Arquivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {entityFields.map(field => (
                      <tr key={field.key} className={cn('hover:bg-secondary/5', field.required && !columnMapping[field.key] ? 'bg-rose-50/40' : '')}>
                        <td className="px-4 py-2.5 font-medium">{field.label}</td>
                        <td className="px-4 py-2.5">
                          {field.required ? (
                            <span className="text-xs font-bold text-rose-600">Obrigatório</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Opcional</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <Select
                            value={columnMapping[field.key] || '__none__'}
                            onValueChange={(val) => setColumnMapping(prev => ({
                              ...prev,
                              [field.key]: val === '__none__' ? '' : val,
                            }))}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="— não mapear —" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">— não mapear —</SelectItem>
                              {parsedHeaders.map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('paste')} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button onClick={handleConfirmMapping} className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Ver Pré-visualização
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>Mostrando os primeiros 5 de <strong>{parsedRows.length}</strong> registros a importar. Todos receberão a tag <strong>backup</strong> como identificador de origem externa.</p>
              </div>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/40 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      {entityFields.filter(f => columnMapping[f.key]).map(f => (
                        <th key={f.key} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {previewRows.map((row, i) => (
                      <tr key={i} className="hover:bg-secondary/5">
                        {entityFields.filter(f => columnMapping[f.key]).map(f => (
                          <td key={f.key} className="px-3 py-2 max-w-[160px] truncate">
                            {f.key === 'name' || f.key === 'customerName' ? (
                              <span className="font-medium">{row[f.key]} <BackupBadge /></span>
                            ) : row[f.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('map')} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button onClick={handleImport} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <UploadCloud className="w-4 h-4" /> Importar {parsedRows.length} Registros
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Importação concluída!</h3>
                <p className="text-muted-foreground mt-1"><strong>{importedCount}</strong> registros de <strong>{MIGRATION_ENTITY_LABELS[activeEntity]}</strong> foram importados com sucesso.</p>
                <p className="text-sm text-muted-foreground mt-2">Todos os registros estão marcados com a tag <BackupBadge /> para indicar que vieram de outro sistema.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetWizard} className="gap-2">
                  <Upload className="w-4 h-4" /> Importar Mais Dados
                </Button>
                <Button onClick={() => handleEntityChange(activeEntity)} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Nova Importação
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field reference card */}
      {step === 'paste' && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Referência de campos — todos os módulos</CardTitle>
            <CardDescription>Consulte aqui os campos aceitos por cada tipo de registro.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.entries(MIGRATION_ENTITY_FIELDS) as [MigrationEntityType, MigrationFieldDef[]][]).map(([entity, fields]) => (
                <div key={entity} className="p-3 rounded-xl border space-y-2">
                  <div className={cn('flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-full w-fit border', entityColors[entity])}>
                    {entityIcons[entity]}
                    {MIGRATION_ENTITY_LABELS[entity]}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {fields.map(f => (
                      <span key={f.key} className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded border',
                        f.required ? 'bg-rose-50 text-rose-600 border-rose-200 font-bold' : 'bg-secondary/40 text-muted-foreground border-secondary'
                      )}>{f.label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AccountantAssistantView({
  company,
  allProducts,
}: {
  company: Company;
  allProducts: any[];
}) {
  const [activityQuery, setActivityQuery] = useState(company.fiscalActivitySearchTerm || company.fiscalActivitySector || '');

  const activityMatches = useMemo(() => searchFiscalActivities(activityQuery).slice(0, 8), [activityQuery]);
  const selectedServices = useMemo(
    () => ACCOUNTANT_ASSISTANT_SERVICE_OPTIONS.filter((item) => (company.accountantServices || []).includes(item.id)),
    [company.accountantServices]
  );

  const fiscalSummary = useMemo(() => {
    const total = allProducts.length;
    const missingNcm = allProducts.filter((p) => onlyDigits(String(p?.ncm || '')).length !== 8).length;
    const missingCest = allProducts.filter((p) => !String(p?.cest || '').trim()).length;
    const missingCfop = allProducts.filter((p) => !String(p?.fiscalCfop || '').trim()).length;
    const missingCst = allProducts.filter(
      (p) => !String(p?.fiscalCstIcms || '').trim() || !String(p?.fiscalCstPis || '').trim() || !String(p?.fiscalCstCofins || '').trim()
    ).length;
    return { total, missingNcm, missingCest, missingCfop, missingCst };
  }, [allProducts]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistente Contador</h1>
        <p className="text-muted-foreground">Painel fiscal com foco em cadastro de produtos, NCM e codigos tributarios.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Estado do Assistente
          </CardTitle>
          <CardDescription>Visao geral das configuracoes fiscais e dos servicos ativos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3 bg-secondary/20">
              <p className="text-[11px] text-muted-foreground">Status</p>
              <p className="text-sm font-semibold">{company.accountantAssistantEnabled ? 'Ativo' : 'Inativo'}</p>
            </div>
            <div className="rounded-lg border p-3 bg-secondary/20">
              <p className="text-[11px] text-muted-foreground">UF fiscal</p>
              <p className="text-sm font-semibold">{company.fiscalUf || 'Nao definida'}</p>
            </div>
            <div className="rounded-lg border p-3 bg-secondary/20">
              <p className="text-[11px] text-muted-foreground">Codigo atividade</p>
              <p className="text-sm font-semibold">{company.fiscalActivityCode || 'Nao definido'}</p>
            </div>
            <div className="rounded-lg border p-3 bg-secondary/20">
              <p className="text-[11px] text-muted-foreground">Lembrete</p>
              <p className="text-sm font-semibold">
                {company.accountantReminderEnabled === false
                  ? 'Desativado'
                  : `A cada ${Math.max(1, Number(company.accountantReminderFrequencyDays) || 7)} dia(s)`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold">Servicos acompanhados</p>
            {selectedServices.length === 0 ? (
              <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                  Nenhum servico selecionado. Configure em Configuracoes {'>'} Config. Sistema {'>'} Assistente Contador.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <Badge key={`svc-${service.id}`} variant="outline" className="text-[11px]">
                    {service.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Diagnostico Fiscal dos Produtos</CardTitle>
          <CardDescription>Resumo rapido dos pontos que normalmente exigem revisao contabil.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-[11px] text-muted-foreground">Total de produtos</p>
              <p className="text-2xl font-bold">{fiscalSummary.total}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[11px] text-muted-foreground">NCM pendente</p>
              <p className="text-2xl font-bold text-rose-600">{fiscalSummary.missingNcm}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[11px] text-muted-foreground">CEST pendente</p>
              <p className="text-2xl font-bold text-amber-600">{fiscalSummary.missingCest}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[11px] text-muted-foreground">CFOP pendente</p>
              <p className="text-2xl font-bold text-amber-600">{fiscalSummary.missingCfop}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[11px] text-muted-foreground">CST incompleto</p>
              <p className="text-2xl font-bold text-amber-600">{fiscalSummary.missingCst}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Consulta de Atividade Fiscal</CardTitle>
          <CardDescription>Digite ramo, palavra-chave ou codigo para ver sugestoes de atividade.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={activityQuery}
            onChange={(e) => setActivityQuery(e.target.value)}
            placeholder="Ex: telefonia, assistencia tecnica, 4752100"
          />
          <div className="grid gap-2">
            {activityMatches.map((item) => (
              <div key={`acc-activity-${item.code}`} className="rounded-md border px-3 py-2 text-xs bg-secondary/10">
                <p className="font-semibold">{item.code} - {item.name}</p>
                <p className="text-muted-foreground mt-1">
                  Sugestao: {item.suggestedTaxCategory || '-'} | CFOP {item.suggestedCfop || '-'} | CST ICMS {item.suggestedCstIcms || '-'}
                </p>
              </div>
            ))}
            {activityMatches.length === 0 && (
              <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                Nenhuma atividade encontrada para o termo informado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
  companies,
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
  companies: ManagedCompany[],
  company: Company,
  setCompany: React.Dispatch<React.SetStateAction<Company>>
}) {
  const isSaaS = user.role === 'ADMIN-SAAS';
  const isAdminUser = user.role === 'ADMIN-USER' || isSaaS;

  const [newSubStatus, setNewSubStatus] = useState('');
  const [selectedMainStatus, setSelectedMainStatus] = useState<string>(STATUS_COLUMNS[0]);
  const [newWaitingInstitutionName, setNewWaitingInstitutionName] = useState('');
  const [newWaitingPurchaseType, setNewWaitingPurchaseType] = useState('');
  const [newWaitingDeadlineDays, setNewWaitingDeadlineDays] = useState('7');
  const [isEquipmentEditOpen, setIsEquipmentEditOpen] = useState(false);
  const [equipmentEditData, setEquipmentEditData] = useState<EquipmentType | null>(null);
  const [isEquipmentBrandsOpen, setIsEquipmentBrandsOpen] = useState(false);
  const [equipmentBrandsData, setEquipmentBrandsData] = useState<EquipmentType | null>(null);
  const [isEquipmentServicesOpen, setIsEquipmentServicesOpen] = useState(false);
  const [equipmentServicesData, setEquipmentServicesData] = useState<EquipmentType | null>(null);
  const [isEquipmentDeadlineRulesOpen, setIsEquipmentDeadlineRulesOpen] = useState(false);
  const [equipmentDeadlineRulesData, setEquipmentDeadlineRulesData] = useState<EquipmentType | null>(null);
  const [newDeadlineRuleKeyword, setNewDeadlineRuleKeyword] = useState('');
  const [newDeadlineRuleDiagHours, setNewDeadlineRuleDiagHours] = useState('0');
  const [newDeadlineRuleDiagDays, setNewDeadlineRuleDiagDays] = useState('0');
  const [newDeadlineRuleCompHours, setNewDeadlineRuleCompHours] = useState('0');
  const [newDeadlineRuleCompDays, setNewDeadlineRuleCompDays] = useState('0');
  const [newEquipmentBrand, setNewEquipmentBrand] = useState('');
  const [newEquipmentModel, setNewEquipmentModel] = useState('');
  const [newEquipmentServiceName, setNewEquipmentServiceName] = useState('');
  const [newEquipmentServicePrice, setNewEquipmentServicePrice] = useState('0');
  const [newEquipmentServiceExecValue, setNewEquipmentServiceExecValue] = useState('1');
  const [newEquipmentServiceExecUnit, setNewEquipmentServiceExecUnit] = useState<'Horas' | 'Dias'>('Horas');
  const [newOsStatusName, setNewOsStatusName] = useState('');

  const activeOsStatuses = useMemo(() => {
    if (company.osStatuses && company.osStatuses.length > 0) {
      return [...company.osStatuses].sort((a, b) => a.order - b.order).map(s => s.name);
    }
    return [...STATUS_COLUMNS];
  }, [company.osStatuses]);

  useEffect(() => {
    if (!activeOsStatuses.includes(selectedMainStatus)) {
      setSelectedMainStatus(activeOsStatuses[0] || STATUS_COLUMNS[0]);
    }
  }, [activeOsStatuses, selectedMainStatus]);

  const normalizeEquipmentText = (value?: string) => String(value || '').trim().toUpperCase();

  const [wsConfig, setWsConfig] = useState({
    instanceName: '',
    serverUrl: '',
    apiKey: ''
  });
  const [aiProviderConfig, setAiProviderConfig] = useState<AIProviderConfig>({
    openaiApiKey: '',
    groqApiKey: '',
    geminiApiKey: '',
    claudeApiKey: '',
    providerCatalogs: [],
    agentPrompts: [],
    updatedAt: '',
  });
  const [companyAiProviderConfig, setCompanyAiProviderConfig] = useState<AIProviderConfig>({
    openaiApiKey: '',
    groqApiKey: '',
    geminiApiKey: '',
    claudeApiKey: '',
    providerCatalogs: [],
    companyAgentPlatforms: [],
    companyDefaultProvider: company.aiProvider || 'openai',
    companyDefaultModel: company.aiModel || '',
    companyModelSource: company.aiModelSource || 'provider-default',
    updatedAt: '',
  });
  const [isSavingAiProviderConfig, setIsSavingAiProviderConfig] = useState(false);
  const [isSavingCompanyAiProviderConfig, setIsSavingCompanyAiProviderConfig] = useState(false);
  const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogProvider, setNewCatalogProvider] = useState<AIProvider>('openai');
  const [newCatalogClientId, setNewCatalogClientId] = useState<string>('');
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptArea, setNewPromptArea] = useState<AIAgentPromptArea>('suporte-tecnico');
  const [newPromptPlans, setNewPromptPlans] = useState<SubscriptionPlan[]>(['Basic', 'Premium', 'Enterprise']);
  const [newPromptBody, setNewPromptBody] = useState('');
  const [newPromptStatus, setNewPromptStatus] = useState<'ATIVADO' | 'DESATIVADO'>('ATIVADO');
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  const [newCompanyPlatformName, setNewCompanyPlatformName] = useState('');
  const [newCompanyPlatformProvider, setNewCompanyPlatformProvider] = useState<AIProvider>('openai');
  const [newCompanyPlatformApiKey, setNewCompanyPlatformApiKey] = useState('');
  const [newCompanyPlatformModel, setNewCompanyPlatformModel] = useState('provider-default');

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const saasClientOptions = useMemo(
    () => companies.map((companyItem) => ({ id: companyItem.id, name: companyItem.name })),
    [companies]
  );

  useEffect(() => {
    if (newCatalogClientId && saasClientOptions.some((item) => item.id === newCatalogClientId)) {
      return;
    }
    setNewCatalogClientId(saasClientOptions[0]?.id || '');
  }, [newCatalogClientId, saasClientOptions]);

  const isNumericText = (value?: string) => /^\d+$/.test(String(value || '').trim());

  const resolveClientDisplayName = (client: AICatalogClient): string => {
    const rawName = String(client.name || '').trim();
    const companyIdFromName = isNumericText(rawName) ? rawName : undefined;
    const resolvedCompanyId = client.companyId || companyIdFromName;
    const mappedName = saasClientOptions.find((item) => item.id === resolvedCompanyId)?.name;

    if (rawName && !isNumericText(rawName) && rawName !== (client.companyId || '')) {
      return rawName;
    }
    if (mappedName) return mappedName;
    return rawName && !isNumericText(rawName) ? rawName : 'Cliente sem nome';
  };

  const normalizeCatalogClients = (catalogs: AIProviderCatalog[] = []): AIProviderCatalog[] =>
    catalogs.map((catalog) => ({
      ...catalog,
      assignedClients: (catalog.assignedClients || []).map((client) => {
        const rawName = String(client.name || '').trim();
        const companyIdFromName = isNumericText(rawName) ? rawName : undefined;
        const resolvedCompanyId = client.companyId || companyIdFromName;
        return {
          ...client,
          companyId: resolvedCompanyId,
          name: resolveClientDisplayName({ ...client, companyId: resolvedCompanyId }),
        };
      }),
    }));

  const ensurePromptDirective = (text: string) => {
    const normalized = String(text || '').trim();
    if (!normalized) return MANDATORY_PROMPT_HELP_DIRECTIVE;
    if (normalized.toLowerCase().includes('próximo passo') || normalized.toLowerCase().includes('proximo passo')) {
      return normalized;
    }
    return `${MANDATORY_PROMPT_HELP_DIRECTIVE}\n${normalized}`.trim();
  };

  const normalizeAgentPrompts = (prompts: AIAgentPromptTemplate[] = []): AIAgentPromptTemplate[] =>
    prompts.map((prompt) => ({
      ...prompt,
      title: String(prompt.title || '').trim() || 'Prompt sem título',
      area: (prompt.area || 'suporte-tecnico') as AIAgentPromptArea,
      prompt: ensurePromptDirective(String(prompt.prompt || '').trim()),
      isActive: Boolean(prompt.isActive),
      plans: Array.isArray(prompt.plans) && prompt.plans.length > 0 ? prompt.plans : ['Basic', 'Premium', 'Enterprise'],
      updatedAt: prompt.updatedAt || new Date().toISOString(),
    }));

  const normalizeCompanyAgentPlatforms = (platforms: CompanyAgentPlatform[] = []): CompanyAgentPlatform[] => {
    const normalized = platforms.map((platform) => ({
      ...platform,
      name: String(platform.name || '').trim() || AI_PROVIDER_LABELS[platform.provider],
      provider: platform.provider || 'openai',
      apiKey: String(platform.apiKey || '').trim(),
      modelSource: platform.modelSource === 'preset' ? 'preset' : 'provider-default',
      model: String(platform.model || '').trim(),
      isActive: Boolean(platform.isActive),
      updatedAt: platform.updatedAt || new Date().toISOString(),
    }));
    if (normalized.some((item) => item.isActive)) return normalized;
    if (normalized.length === 0) return normalized;
    return normalized.map((item, idx) => ({ ...item, isActive: idx === 0 }));
  };

  useEffect(() => {
    fetch(`/api/whatsapp/config?companyId=${user.companyId || 'default'}`)
      .then(res => res.json())
      .then(data => setWsConfig(data))
      .catch(err => console.error('Erro ao buscar config WhatsApp:', err));
  }, [user.companyId]);

  useEffect(() => {
    axios
      .get('/api/ai/provider-config?scope=global')
      .then((res) => {
        setAiProviderConfig({
          openaiApiKey: res.data?.openaiApiKey || '',
          groqApiKey: res.data?.groqApiKey || '',
          geminiApiKey: res.data?.geminiApiKey || '',
          claudeApiKey: res.data?.claudeApiKey || '',
          providerCatalogs: normalizeCatalogClients(Array.isArray(res.data?.providerCatalogs) ? res.data.providerCatalogs : []),
          agentPrompts: normalizeAgentPrompts(Array.isArray(res.data?.agentPrompts) ? res.data.agentPrompts : []),
          updatedAt: res.data?.updatedAt || '',
        });
      })
      .catch((err) => console.error('Erro ao carregar config global IA:', err));
  }, []);

  useEffect(() => {
    if (isSaaS) return;
    const scope = user.companyId || company.id || 'default';
    axios
      .get(`/api/ai/provider-config?scope=${encodeURIComponent(scope)}`)
      .then((res) => {
        setCompanyAiProviderConfig({
          openaiApiKey: res.data?.openaiApiKey || '',
          groqApiKey: res.data?.groqApiKey || '',
          geminiApiKey: res.data?.geminiApiKey || '',
          claudeApiKey: res.data?.claudeApiKey || '',
          providerCatalogs: Array.isArray(res.data?.providerCatalogs) ? res.data.providerCatalogs : [],
          companyAgentPlatforms: normalizeCompanyAgentPlatforms(
            Array.isArray(res.data?.companyAgentPlatforms) ? res.data.companyAgentPlatforms : []
          ),
          companyDefaultProvider: (res.data?.companyDefaultProvider || company.aiProvider || 'openai') as AIProvider,
          companyDefaultModel: res.data?.companyDefaultModel || company.aiModel || '',
          companyModelSource: res.data?.companyModelSource === 'preset' ? 'preset' : (company.aiModelSource || 'provider-default'),
          updatedAt: res.data?.updatedAt || '',
        });
      })
      .catch((err) => console.error('Erro ao carregar config IA da empresa:', err));
  }, [isSaaS, user.companyId, company.id, company.aiProvider, company.aiModel, company.aiModelSource]);

  useEffect(() => {
    if (isSaaS) return;
    if (company.aiAssistantMode !== 'saas-managed') return;
    if (company.aiSaasCatalogId) return;
    const firstCatalog = aiProviderConfig.providerCatalogs?.[0];
    if (!firstCatalog) return;
    setCompany((prev) => ({ ...prev, aiSaasCatalogId: firstCatalog.id }));
  }, [isSaaS, company.aiAssistantMode, company.aiSaasCatalogId, aiProviderConfig.providerCatalogs, setCompany]);

  const saveWsConfig = async () => {
    try {
      await axios.post('/api/whatsapp/config', { ...wsConfig, companyId: user.companyId || 'default' });
      toast.success('Configuração do WhatsApp salva!');
    } catch (err) {
      toast.error('Erro ao salvar configuração.');
    }
  };

  const saveAiProviderConfig = async () => {
    setIsSavingAiProviderConfig(true);
    try {
      const normalizedCatalogs = normalizeCatalogClients(aiProviderConfig.providerCatalogs || []);
      const normalizedPrompts = normalizeAgentPrompts(aiProviderConfig.agentPrompts || []);
      const payload = {
        ...aiProviderConfig,
        providerCatalogs: normalizedCatalogs,
        agentPrompts: normalizedPrompts,
        scope: 'global',
        updatedAt: new Date().toISOString(),
      };
      await axios.post('/api/ai/provider-config', payload);
      setAiProviderConfig((prev) => ({
        ...prev,
        providerCatalogs: normalizedCatalogs,
        agentPrompts: normalizedPrompts,
        updatedAt: payload.updatedAt,
      }));
      toast.success('Chaves e listas de IA salvas.');
    } catch (err) {
      console.error('Erro ao salvar config global IA:', err);
      toast.error('Erro ao salvar configuração global de IA.');
    } finally {
      setIsSavingAiProviderConfig(false);
    }
  };

  const saveCompanyAiConfig = async () => {
    setIsSavingCompanyAiProviderConfig(true);
    try {
      const scope = user.companyId || company.id || 'default';
      const normalizedPlatforms = normalizeCompanyAgentPlatforms(companyAiProviderConfig.companyAgentPlatforms || []);
      const activePlatform = normalizedPlatforms.find((item) => item.isActive) || null;
      const resolvedProvider = activePlatform?.provider || company.aiProvider || companyAiProviderConfig.companyDefaultProvider || 'openai';
      const resolvedModelSource =
        activePlatform?.modelSource === 'preset' && activePlatform.model ? 'preset' : 'provider-default';
      const resolvedModel = resolvedModelSource === 'preset' ? String(activePlatform?.model || '').trim() : '';

      let openaiApiKey = String(companyAiProviderConfig.openaiApiKey || '').trim();
      let groqApiKey = String(companyAiProviderConfig.groqApiKey || '').trim();
      let geminiApiKey = String(companyAiProviderConfig.geminiApiKey || '').trim();
      let claudeApiKey = String(companyAiProviderConfig.claudeApiKey || '').trim();

      if (activePlatform?.apiKey) {
        if (activePlatform.provider === 'openai') openaiApiKey = activePlatform.apiKey;
        if (activePlatform.provider === 'groq') groqApiKey = activePlatform.apiKey;
        if (activePlatform.provider === 'gemini') geminiApiKey = activePlatform.apiKey;
        if (activePlatform.provider === 'claude') claudeApiKey = activePlatform.apiKey;
      }

      const payload = {
        ...companyAiProviderConfig,
        openaiApiKey,
        groqApiKey,
        geminiApiKey,
        claudeApiKey,
        companyAgentPlatforms: normalizedPlatforms,
        scope,
        companyDefaultProvider: resolvedProvider,
        companyDefaultModel: resolvedModel || company.aiModel || companyAiProviderConfig.companyDefaultModel || '',
        companyModelSource: resolvedModelSource,
        updatedAt: new Date().toISOString(),
      };
      await axios.post('/api/ai/provider-config', payload);
      setCompanyAiProviderConfig((prev) => ({
        ...prev,
        openaiApiKey,
        groqApiKey,
        geminiApiKey,
        claudeApiKey,
        companyAgentPlatforms: normalizedPlatforms,
        companyDefaultProvider: resolvedProvider,
        companyDefaultModel: resolvedModel,
        companyModelSource: resolvedModelSource,
        updatedAt: payload.updatedAt,
      }));
      setCompany((prev) => ({
        ...prev,
        aiProvider: resolvedProvider,
        aiModelSource: resolvedModelSource,
        aiModel: resolvedModel,
      }));
      toast.success('Configura??o de IA da empresa salva e aplicada aos t?cnicos.');
    } catch (err) {
      console.error('Erro ao salvar IA da empresa:', err);
      toast.error('Erro ao salvar configura??o de IA da empresa.');
    } finally {
      setIsSavingCompanyAiProviderConfig(false);
    }
  };

  const addGlobalProviderCatalog = () => {
    const listName = newCatalogName.trim();
    if (!listName) {
      toast.error('Informe o nome da lista.');
      return;
    }
    const models = AI_PROVIDER_MODEL_OPTIONS[newCatalogProvider] || [];
    const initialClient = saasClientOptions.find((client) => client.id === newCatalogClientId);
    const assignedClients: AICatalogClient[] = initialClient
      ? [{ id: safeRandomUUID(), companyId: initialClient.id, name: initialClient.name }]
      : [];
    const catalog: AIProviderCatalog = {
      id: safeRandomUUID(),
      listName,
      provider: newCatalogProvider,
      models,
      assignedClients,
      includedInPlan: true,
      updatedAt: new Date().toISOString(),
    };
    setAiProviderConfig((prev) => ({ ...prev, providerCatalogs: [...(prev.providerCatalogs || []), catalog] }));
    setNewCatalogName('');
    toast.success(`Lista "${listName}" criada.`);
  };

  const updateGlobalProviderCatalogName = (catalogId: string, nextListName: string) => {
    const trimmed = nextListName.trim();
    if (!trimmed) {
      toast.error('Informe um nome para a lista.');
      return;
    }
    setAiProviderConfig((prev) => ({
      ...prev,
      providerCatalogs: (prev.providerCatalogs || []).map((item) =>
        item.id === catalogId ? { ...item, listName: trimmed, updatedAt: new Date().toISOString() } : item
      ),
    }));
    toast.success('Nome da lista atualizado.');
  };

  const addClientToCatalog = (catalogId: string, companyId: string) => {
    const companyOption = saasClientOptions.find((item) => item.id === companyId);
    if (!companyOption) return;

    let added = false;
    setAiProviderConfig((prev) => ({
      ...prev,
      providerCatalogs: (prev.providerCatalogs || []).map((item) => {
        if (item.id !== catalogId) return item;
        const currentClients = item.assignedClients || [];
        if (currentClients.some((client) => client.companyId === companyId)) return item;
        added = true;
        return {
          ...item,
          assignedClients: [...currentClients, { id: safeRandomUUID(), companyId: companyOption.id, name: companyOption.name }],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    if (added) {
      toast.success(`Cliente "${companyOption.name}" vinculado à lista.`);
      return;
    }
    toast.info('Cliente já vinculado a esta lista.');
  };

  const updateCatalogClientName = (catalogId: string, clientId: string, nextName: string) => {
    const trimmed = nextName.trim();
    if (!trimmed) {
      toast.error('Informe o nome do cliente.');
      return;
    }
    setAiProviderConfig((prev) => ({
      ...prev,
      providerCatalogs: (prev.providerCatalogs || []).map((item) => {
        if (item.id !== catalogId) return item;
        return {
          ...item,
          assignedClients: (item.assignedClients || []).map((client) =>
            client.id === clientId ? { ...client, name: trimmed } : client
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    toast.success('Cliente atualizado.');
  };

  const removeClientFromCatalog = (catalogId: string, clientId: string) => {
    setAiProviderConfig((prev) => ({
      ...prev,
      providerCatalogs: (prev.providerCatalogs || []).map((item) =>
        item.id === catalogId
          ? {
              ...item,
              assignedClients: (item.assignedClients || []).filter((client) => client.id !== clientId),
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    }));
    toast.success('Cliente removido da lista.');
  };

  const removeGlobalProviderCatalog = (catalogId: string) => {
    setAiProviderConfig((prev) => ({
      ...prev,
      providerCatalogs: (prev.providerCatalogs || []).filter((item) => item.id !== catalogId),
    }));
    toast.success('Lista removida.');
  };

  const togglePromptPlan = (plan: SubscriptionPlan) => {
    setNewPromptPlans((prev) => (prev.includes(plan) ? prev.filter((item) => item !== plan) : [...prev, plan]));
  };

  const createAgentPrompt = () => {
    const title = String(newPromptTitle || '').trim();
    const promptText = String(newPromptBody || '').trim();
    if (!title) {
      toast.error('Informe o título do prompt.');
      return;
    }
    if (!promptText) {
      toast.error('Informe o conteúdo do prompt.');
      return;
    }
    const plans = newPromptPlans.length > 0 ? newPromptPlans : ['Basic', 'Premium', 'Enterprise'];
    const created: AIAgentPromptTemplate = {
      id: safeRandomUUID(),
      title,
      area: newPromptArea,
      prompt: ensurePromptDirective(promptText),
      isActive: newPromptStatus === 'ATIVADO',
      plans,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAiProviderConfig((prev) => ({
      ...prev,
      agentPrompts: normalizeAgentPrompts([...(prev.agentPrompts || []), created]),
    }));
    setNewPromptTitle('');
    setNewPromptBody('');
    setNewPromptArea('suporte-tecnico');
    setNewPromptPlans(['Basic', 'Premium', 'Enterprise']);
    setNewPromptStatus('ATIVADO');
    toast.success('Prompt criado para o plano selecionado.');
  };

  const saveExistingPrompt = (promptId: string) => {
    setAiProviderConfig((prev) => ({
      ...prev,
      agentPrompts: normalizeAgentPrompts((prev.agentPrompts || []).map((item) => (item.id === promptId ? { ...item, updatedAt: new Date().toISOString() } : item))),
    }));
    setEditingPromptId(null);
    toast.success('Prompt atualizado.');
  };

  const removeAgentPrompt = (promptId: string) => {
    setAiProviderConfig((prev) => ({
      ...prev,
      agentPrompts: (prev.agentPrompts || []).filter((item) => item.id !== promptId),
    }));
    if (editingPromptId === promptId) setEditingPromptId(null);
    toast.success('Prompt removido.');
  };

  const addCompanyAgentPlatform = () => {
    const name = String(newCompanyPlatformName || '').trim();
    const apiKey = String(newCompanyPlatformApiKey || '').trim();
    if (!name) {
      toast.error('Informe o nome da plataforma.');
      return;
    }
    if (!apiKey) {
      toast.error('Informe a API Key da plataforma.');
      return;
    }
    const platform: CompanyAgentPlatform = {
      id: safeRandomUUID(),
      name,
      provider: newCompanyPlatformProvider,
      apiKey,
      modelSource: newCompanyPlatformModel === 'provider-default' ? 'provider-default' : 'preset',
      model: newCompanyPlatformModel === 'provider-default' ? '' : newCompanyPlatformModel,
      isActive: (companyAiProviderConfig.companyAgentPlatforms || []).length === 0,
      updatedAt: new Date().toISOString(),
    };
    setCompanyAiProviderConfig((prev) => ({
      ...prev,
      companyAgentPlatforms: normalizeCompanyAgentPlatforms([...(prev.companyAgentPlatforms || []), platform]),
    }));
    setNewCompanyPlatformName('');
    setNewCompanyPlatformApiKey('');
    setNewCompanyPlatformProvider('openai');
    setNewCompanyPlatformModel('provider-default');
    toast.success('Plataforma de agentes adicionada.');
  };

  const setActiveCompanyAgentPlatform = (platformId: string) => {
    setCompanyAiProviderConfig((prev) => {
      const currentPlatforms = prev.companyAgentPlatforms || [];
      const nextPlatforms = normalizeCompanyAgentPlatforms(
        currentPlatforms.map((item) => ({ ...item, isActive: item.id === platformId, updatedAt: new Date().toISOString() }))
      );
      const active = nextPlatforms.find((item) => item.isActive);
      if (active) {
        setCompany((companyPrev) => ({
          ...companyPrev,
          aiProvider: active.provider,
          aiModelSource: active.modelSource,
          aiModel: active.modelSource === 'preset' ? String(active.model || '').trim() : '',
        }));
        setTeamUsers((teamPrev) => [...teamPrev]);
      }
      return { ...prev, companyAgentPlatforms: nextPlatforms };
    });
    toast.success('Plataforma ativa aplicada para toda a equipe técnica.');
  };

  const removeCompanyAgentPlatform = (platformId: string) => {
    setCompanyAiProviderConfig((prev) => ({
      ...prev,
      companyAgentPlatforms: normalizeCompanyAgentPlatforms((prev.companyAgentPlatforms || []).filter((item) => item.id !== platformId)),
    }));
    toast.success('Plataforma removida.');
  };

  const handleApiKeyPaste =
    (
      field: 'openaiApiKey' | 'groqApiKey' | 'geminiApiKey' | 'claudeApiKey',
      setter: React.Dispatch<React.SetStateAction<AIProviderConfig>>
    ) =>
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData('text');
      if (!text) return;
      e.preventDefault();
      setter((prev) => ({ ...prev, [field]: text.trim() }));
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
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem valida para o logotipo.');
      e.target.value = '';
      return;
    }

    const maxLogoSize = 2 * 1024 * 1024;
    if (file.size > maxLogoSize) {
      toast.error('O logotipo deve ter no maximo 2MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const logo = reader.result as string;
      setCompanyLogo(logo);
      setCompany((prev) => ({ ...prev, logo }));
      toast.success('Logotipo atualizado com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setCompanyLogo(null);
    setCompany((prev) => ({ ...prev, logo: undefined }));
    toast.success('Logotipo removido.');
  };

  const saasCatalogOptions = aiProviderConfig.providerCatalogs || [];
  const selectedSaasCatalogForCompany =
    saasCatalogOptions.find((catalog) => catalog.id === company.aiSaasCatalogId) || saasCatalogOptions[0] || null;
  const fiscalActivityMatches = useMemo(
    () => searchFiscalActivities(company.fiscalActivitySearchTerm || `${company.fiscalActivitySector || ''} ${company.fiscalActivityCode || ''}`).slice(0, 6),
    [company.fiscalActivitySearchTerm, company.fiscalActivitySector, company.fiscalActivityCode]
  );

  const applyFiscalActivitySuggestion = (item: FiscalActivityTemplate) => {
    setCompany((prev) => ({
      ...prev,
      fiscalActivitySearchTerm: `${item.code} - ${item.name}`,
      fiscalActivityCode: item.code,
      fiscalActivitySector: item.name,
    }));
  };

  const toggleAccountantService = (serviceId: string) => {
    setCompany((prev) => {
      const current = Array.isArray(prev.accountantServices) ? prev.accountantServices : [];
      const next = current.includes(serviceId)
        ? current.filter((item) => item !== serviceId)
        : [...current, serviceId];
      return { ...prev, accountantServices: next };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações gerais do sistema e integrações.</p>
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
              <TabsTrigger value="whatsapp-config">API</TabsTrigger>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>OpenAI / ChatGPT API Key</Label>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={aiProviderConfig.openaiApiKey || ''}
                        onChange={(e) => setAiProviderConfig((prev) => ({ ...prev, openaiApiKey: e.target.value }))}
                        onPaste={handleApiKeyPaste('openaiApiKey', setAiProviderConfig)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Groq API Key</Label>
                      <Input
                        type="password"
                        placeholder="gsk_..."
                        value={aiProviderConfig.groqApiKey || ''}
                        onChange={(e) => setAiProviderConfig((prev) => ({ ...prev, groqApiKey: e.target.value }))}
                        onPaste={handleApiKeyPaste('groqApiKey', setAiProviderConfig)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Google Gemini API Key</Label>
                      <Input
                        type="password"
                        placeholder="AIza..."
                        value={aiProviderConfig.geminiApiKey || ''}
                        onChange={(e) => setAiProviderConfig((prev) => ({ ...prev, geminiApiKey: e.target.value }))}
                        onPaste={handleApiKeyPaste('geminiApiKey', setAiProviderConfig)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Anthropic Claude API Key</Label>
                      <Input
                        type="password"
                        placeholder="sk-ant-..."
                        value={aiProviderConfig.claudeApiKey || ''}
                        onChange={(e) => setAiProviderConfig((prev) => ({ ...prev, claudeApiKey: e.target.value }))}
                        onPaste={handleApiKeyPaste('claudeApiKey', setAiProviderConfig)}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">Listas de IA oferecidas no plano</h3>
                      <p className="text-xs text-muted-foreground">Crie listas por provedor e gerencie clientes vinculados em cada lista.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input
                        placeholder="Nome da lista (ex: OpenAI Plano)"
                        value={newCatalogName}
                        onChange={(e) => setNewCatalogName(e.target.value)}
                      />
                      <Select value={newCatalogProvider} onValueChange={(value) => setNewCatalogProvider(value as AIProvider)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                          <SelectItem value="groq">Groq</SelectItem>
                          <SelectItem value="gemini">Gemini</SelectItem>
                          <SelectItem value="claude">Claude</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={newCatalogClientId} onValueChange={setNewCatalogClientId}>
                        <SelectTrigger><SelectValue placeholder="Cliente inicial" /></SelectTrigger>
                        <SelectContent>
                          {saasClientOptions.map((client) => (
                            <SelectItem key={`initial-${client.id}`} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addGlobalProviderCatalog}>Criar Lista</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(aiProviderConfig.providerCatalogs || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma lista criada ainda.</p>
                      ) : (
                        (aiProviderConfig.providerCatalogs || []).map((catalog) => (
                          <div key={catalog.id} className="rounded-lg border p-3 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                {AI_PROVIDER_LABELS[catalog.provider]} • {catalog.models?.length || 0} modelos
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[10px] text-rose-500"
                                onClick={() => removeGlobalProviderCatalog(catalog.id)}
                              >
                                Apagar Lista
                              </Button>
                            </div>

                            <div className="flex gap-2">
                              <Input
                                value={catalog.listName}
                                onChange={(e) =>
                                  setAiProviderConfig((prev) => ({
                                    ...prev,
                                    providerCatalogs: (prev.providerCatalogs || []).map((item) =>
                                      item.id === catalog.id ? { ...item, listName: e.target.value } : item
                                    ),
                                  }))
                                }
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={() => updateGlobalProviderCatalogName(catalog.id, catalog.listName)}
                              >
                                Salvar Nome
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {(catalog.models || []).slice(0, 8).map((model) => (
                                <Badge key={model.value} variant="outline" className="text-[10px]">
                                  {model.label}
                                </Badge>
                              ))}
                            </div>

                            <div className="space-y-2 border-t pt-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Select value={newCatalogClientId} onValueChange={setNewCatalogClientId}>
                                  <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
                                  <SelectContent>
                                    {saasClientOptions.map((clientOption) => (
                                      <SelectItem key={`${catalog.id}-${clientOption.id}`} value={clientOption.id}>
                                        {clientOption.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  className="md:col-span-2"
                                  onClick={() => addClientToCatalog(catalog.id, newCatalogClientId)}
                                >
                                  Vincular Cliente
                                </Button>
                              </div>

                              {(catalog.assignedClients || []).length === 0 ? (
                                <p className="text-xs text-muted-foreground">Nenhum cliente vinculado.</p>
                              ) : (
                                (catalog.assignedClients || []).map((client) => (
                                  <div key={client.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                    <Input
                                      value={resolveClientDisplayName(client)}
                                      onChange={(e) =>
                                        setAiProviderConfig((prev) => ({
                                          ...prev,
                                          providerCatalogs: (prev.providerCatalogs || []).map((item) => {
                                            if (item.id !== catalog.id) return item;
                                            return {
                                              ...item,
                                              assignedClients: (item.assignedClients || []).map((assigned) =>
                                                assigned.id === client.id ? { ...assigned, name: e.target.value } : assigned
                                              ),
                                            };
                                          }),
                                        }))
                                      }
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateCatalogClientName(catalog.id, client.id, resolveClientDisplayName(client))}
                                    >
                                      Editar Cliente
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-rose-500"
                                      onClick={() => removeClientFromCatalog(catalog.id, client.id)}
                                    >
                                      Apagar Cliente
                                    </Button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">Prompts de Agentes por Area</h3>
                      <p className="text-xs text-muted-foreground">
                        Crie prompts incluidos no plano, defina area, status e planos permitidos.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        placeholder="Titulo do prompt"
                        value={newPromptTitle}
                        onChange={(e) => setNewPromptTitle(e.target.value)}
                      />
                      <Select value={newPromptArea} onValueChange={(value) => setNewPromptArea(value as AIAgentPromptArea)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(AGENT_PROMPT_AREA_LABELS) as AIAgentPromptArea[]).map((area) => (
                            <SelectItem key={area} value={area}>{AGENT_PROMPT_AREA_LABELS[area]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={newPromptStatus} onValueChange={(value) => setNewPromptStatus(value as 'ATIVADO' | 'DESATIVADO')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATIVADO">ATIVADO</SelectItem>
                          <SelectItem value="DESATIVADO">DESATIVADO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <textarea
                      value={newPromptBody}
                      onChange={(e) => setNewPromptBody(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Descreva como os agentes devem agir nesta area..."
                    />

                    <div className="flex flex-wrap gap-2">
                      {PLAN_OPTIONS.map((plan) => {
                        const selected = newPromptPlans.includes(plan);
                        return (
                          <Button
                            key={plan}
                            type="button"
                            size="sm"
                            variant={selected ? 'default' : 'outline'}
                            onClick={() => togglePromptPlan(plan)}
                          >
                            {plan}
                          </Button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={createAgentPrompt}>Criar Novo Prompt</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {(aiProviderConfig.agentPrompts || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum prompt criado ainda.</p>
                      ) : (
                        (aiProviderConfig.agentPrompts || []).map((promptItem) => (
                          <div key={promptItem.id} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-sm">{promptItem.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Area: {AGENT_PROMPT_AREA_LABELS[promptItem.area]} - Status: {promptItem.isActive ? 'ATIVADO' : 'DESATIVADO'} - Planos: {(promptItem.plans || []).join(', ')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setEditingPromptId(editingPromptId === promptItem.id ? null : promptItem.id)}>
                                  Modificar
                                </Button>
                                <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => removeAgentPrompt(promptItem.id)}>
                                  Apagar
                                </Button>
                              </div>
                            </div>

                            {editingPromptId === promptItem.id && (
                              <div className="space-y-2 border-t pt-3">
                                <Input
                                  value={promptItem.title}
                                  onChange={(e) =>
                                    setAiProviderConfig((prev) => ({
                                      ...prev,
                                      agentPrompts: (prev.agentPrompts || []).map((item) =>
                                        item.id === promptItem.id ? { ...item, title: e.target.value } : item
                                      ),
                                    }))
                                  }
                                />
                                <Select
                                  value={promptItem.area}
                                  onValueChange={(value) =>
                                    setAiProviderConfig((prev) => ({
                                      ...prev,
                                      agentPrompts: (prev.agentPrompts || []).map((item) =>
                                        item.id === promptItem.id ? { ...item, area: value as AIAgentPromptArea } : item
                                      ),
                                    }))
                                  }
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {(Object.keys(AGENT_PROMPT_AREA_LABELS) as AIAgentPromptArea[]).map((area) => (
                                      <SelectItem key={promptItem.id + '-' + area} value={area}>{AGENT_PROMPT_AREA_LABELS[area]}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={promptItem.isActive ? 'ATIVADO' : 'DESATIVADO'}
                                  onValueChange={(value) =>
                                    setAiProviderConfig((prev) => ({
                                      ...prev,
                                      agentPrompts: (prev.agentPrompts || []).map((item) =>
                                        item.id === promptItem.id ? { ...item, isActive: value === 'ATIVADO' } : item
                                      ),
                                    }))
                                  }
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ATIVADO">ATIVADO</SelectItem>
                                    <SelectItem value="DESATIVADO">DESATIVADO</SelectItem>
                                  </SelectContent>
                                </Select>
                                <textarea
                                  value={promptItem.prompt}
                                  onChange={(e) =>
                                    setAiProviderConfig((prev) => ({
                                      ...prev,
                                      agentPrompts: (prev.agentPrompts || []).map((item) =>
                                        item.id === promptItem.id ? { ...item, prompt: e.target.value } : item
                                      ),
                                    }))
                                  }
                                  rows={6}
                                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                />
                                <div className="flex flex-wrap gap-2">
                                  {PLAN_OPTIONS.map((plan) => {
                                    const selected = (promptItem.plans || []).includes(plan);
                                    return (
                                      <Button
                                        key={promptItem.id + '-' + plan}
                                        type="button"
                                        size="sm"
                                        variant={selected ? 'default' : 'outline'}
                                        onClick={() =>
                                          setAiProviderConfig((prev) => ({
                                            ...prev,
                                            agentPrompts: (prev.agentPrompts || []).map((item) =>
                                              item.id === promptItem.id
                                                ? {
                                                    ...item,
                                                    plans: selected
                                                      ? (item.plans || []).filter((p) => p !== plan)
                                                      : [...(item.plans || []), plan],
                                                  }
                                                : item
                                            ),
                                          }))
                                        }
                                      >
                                        {plan}
                                      </Button>
                                    );
                                  })}
                                </div>
                                <div className="flex justify-end">
                                  <Button size="sm" onClick={() => saveExistingPrompt(promptItem.id)}>Salvar Modificacao</Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                    {aiProviderConfig.updatedAt
                      ? `Última atualização: ${format(new Date(aiProviderConfig.updatedAt), "dd/MM/yyyy 'às' HH:mm")}`
                      : 'Nenhuma chave de IA salva ainda.'}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={saveAiProviderConfig} disabled={isSavingAiProviderConfig} className="gap-2">
                      {isSavingAiProviderConfig && <RefreshCw className="w-4 h-4 animate-spin" />}
                      Salvar Chaves e Listas de IA
                    </Button>
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
                        <Button variant="ghost" size="sm" className="text-rose-500 block" onClick={handleLogoRemove}>
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
                  <Label>CNPJ/CPF</Label>
                  <Input 
                    value={company.cnpj} 
                    onChange={(e) => setCompany({...company, cnpj: formatCpfCnpj(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inscrição Estadual</Label>
                  <Input 
                    value={company.ie || 'ISENTO'} 
                    onChange={(e) => setCompany({...company, ie: formatStateRegistration(e.target.value)} as any)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Contato</Label>
                  <Input 
                    value={company.email} 
                    onChange={(e) => setCompany({...company, email: normalizeEmail(e.target.value)})}
                    onBlur={(e) => {
                      if (!isValidOptionalEmail(e.target.value)) {
                        toast.error('Informe um e-mail válido, como nome@provedor.com, ou deixe vazio.');
                        setCompany(prev => ({ ...prev, email: '' }));
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={company.phone} 
                    onChange={(e) => setCompany({...company, phone: formatPhone(e.target.value)})}
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
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Horário de Funcionamento Inteligente</h3>
                <div className="flex items-center justify-between rounded-lg border bg-secondary/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Aplicar horário comercial no sistema</p>
                    <p className="text-[10px] text-muted-foreground">Ajuda o time a manter prazos e atendimento alinhados ao expediente.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={company.businessHoursEnabled ? 'default' : 'outline'}
                    onClick={() => setCompany((prev) => ({ ...prev, businessHoursEnabled: !prev.businessHoursEnabled }))}
                  >
                    {company.businessHoursEnabled ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-12 bg-secondary/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-4 px-3 py-2">Início da Jornada</div>
                    <div className="col-span-4 px-3 py-2 border-l">Início de Intervalo</div>
                    <div className="col-span-4 px-3 py-2 border-l">Término da Jornada</div>
                  </div>
                  <div className="divide-y">
                    {BUSINESS_DAY_ROWS.map((row) => {
                      const enabled =
                        row.day === 6
                          ? company.businessHoursSaturdayEnabled !== false
                          : row.day === 0
                            ? company.businessHoursSundayEnabled === true
                            : (company.businessHoursWeekdays || []).includes(row.day);
                      const breakEnabled = (company.businessHoursBreakWeekdays || []).includes(row.day);
                      const startValue = row.day === 6
                        ? (company.businessHoursSaturdayStart || '08:30')
                        : row.day === 0
                          ? (company.businessHoursSundayStart || '00:00')
                          : (company.businessHoursStart || '08:30');
                      const endValue = row.day === 6
                        ? (company.businessHoursSaturdayEnd || '12:30')
                        : row.day === 0
                          ? (company.businessHoursSundayEnd || '00:00')
                          : (company.businessHoursEnd || '18:00');

                      return (
                        <div key={`business-row-${row.day}`} className="grid grid-cols-12 items-center">
                          <div className="col-span-4 px-3 py-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCompany((prev) => {
                                  if (row.day === 6) return { ...prev, businessHoursSaturdayEnabled: checked };
                                  if (row.day === 0) return { ...prev, businessHoursSundayEnabled: checked };
                                  const setDays = new Set(prev.businessHoursWeekdays || []);
                                  if (checked) setDays.add(row.day);
                                  else setDays.delete(row.day);
                                  return { ...prev, businessHoursWeekdays: Array.from(setDays).sort((a, b) => a - b) };
                                });
                              }}
                              className="h-4 w-4 accent-primary"
                            />
                            <Label className="min-w-[66px]">{row.label}</Label>
                            <Input
                              type="time"
                              disabled={!enabled}
                              value={startValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                setCompany((prev) => row.day === 6
                                  ? { ...prev, businessHoursSaturdayStart: value }
                                  : row.day === 0
                                    ? { ...prev, businessHoursSundayStart: value }
                                    : { ...prev, businessHoursStart: value });
                              }}
                            />
                          </div>
                          <div className="col-span-4 px-3 py-2 border-l flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={breakEnabled}
                              disabled={!enabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCompany((prev) => {
                                  const setDays = new Set(prev.businessHoursBreakWeekdays || []);
                                  if (checked) setDays.add(row.day);
                                  else setDays.delete(row.day);
                                  return { ...prev, businessHoursBreakWeekdays: Array.from(setDays).sort((a, b) => a - b) };
                                });
                              }}
                              className="h-4 w-4 accent-primary"
                            />
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <Input
                                type="time"
                                disabled={!enabled || !breakEnabled}
                                value={company.businessHoursBreakStart || '12:00'}
                                onChange={(e) => setCompany({ ...company, businessHoursBreakStart: e.target.value })}
                              />
                              <Input
                                type="time"
                                disabled={!enabled || !breakEnabled}
                                value={company.businessHoursBreakEnd || '13:30'}
                                onChange={(e) => setCompany({ ...company, businessHoursBreakEnd: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-span-4 px-3 py-2 border-l">
                            <Input
                              type="time"
                              disabled={!enabled}
                              value={endValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                setCompany((prev) => row.day === 6
                                  ? { ...prev, businessHoursSaturdayEnd: value }
                                  : row.day === 0
                                    ? { ...prev, businessHoursSundayEnd: value }
                                    : { ...prev, businessHoursEnd: value });
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-secondary/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Fechado nos feriados</p>
                    <p className="text-[10px] text-muted-foreground">Quando ativado, o sistema considera feriado como fechado por padrão.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={company.businessHoursHolidayClosed !== false ? 'default' : 'outline'}
                    onClick={() => setCompany((prev) => ({ ...prev, businessHoursHolidayClosed: !(prev.businessHoursHolidayClosed !== false) }))}
                  >
                    {company.businessHoursHolidayClosed !== false ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>

                <div className="hidden">
                  <Label>Dias Úteis Ativos</Label>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_WEEKDAY_OPTIONS.map((day) => {
                      const selected = (company.businessHoursWeekdays || []).includes(day.value);
                      return (
                        <Button
                          key={`business-day-${day.value}`}
                          type="button"
                          size="sm"
                          variant={selected ? 'default' : 'outline'}
                          onClick={() =>
                            setCompany((prev) => {
                              const current = new Set(prev.businessHoursWeekdays || []);
                              if (current.has(day.value)) current.delete(day.value);
                              else current.add(day.value);
                              return { ...prev, businessHoursWeekdays: Array.from(current).sort((a, b) => a - b) };
                            })
                          }
                        >
                          {day.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden">
                  <div className="space-y-2">
                    <Label>Abertura</Label>
                    <Input
                      type="time"
                      value={company.businessHoursStart || '08:30'}
                      onChange={(e) => setCompany({ ...company, businessHoursStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fechamento</Label>
                    <Input
                      type="time"
                      value={company.businessHoursEnd || '18:00'}
                      onChange={(e) => setCompany({ ...company, businessHoursEnd: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intervalo Início</Label>
                    <Input
                      type="time"
                      value={company.businessHoursBreakStart || '12:00'}
                      onChange={(e) => setCompany({ ...company, businessHoursBreakStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intervalo Fim</Label>
                    <Input
                      type="time"
                      value={company.businessHoursBreakEnd || '13:30'}
                      onChange={(e) => setCompany({ ...company, businessHoursBreakEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="hidden">
                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Label>Sábado</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant={company.businessHoursSaturdayEnabled ? 'default' : 'outline'}
                        onClick={() =>
                          setCompany((prev) => ({ ...prev, businessHoursSaturdayEnabled: !prev.businessHoursSaturdayEnabled }))
                        }
                      >
                        {company.businessHoursSaturdayEnabled ? 'Aberto' : 'Fechado'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="time"
                        value={company.businessHoursSaturdayStart || '08:30'}
                        onChange={(e) => setCompany({ ...company, businessHoursSaturdayStart: e.target.value })}
                      />
                      <Input
                        type="time"
                        value={company.businessHoursSaturdayEnd || '12:30'}
                        onChange={(e) => setCompany({ ...company, businessHoursSaturdayEnd: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Label>Domingo</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant={company.businessHoursSundayEnabled ? 'default' : 'outline'}
                        onClick={() =>
                          setCompany((prev) => ({ ...prev, businessHoursSundayEnabled: !prev.businessHoursSundayEnabled }))
                        }
                      >
                        {company.businessHoursSundayEnabled ? 'Aberto' : 'Fechado'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="time"
                        value={company.businessHoursSundayStart || '00:00'}
                        onChange={(e) => setCompany({ ...company, businessHoursSundayStart: e.target.value })}
                      />
                      <Input
                        type="time"
                        value={company.businessHoursSundayEnd || '00:00'}
                        onChange={(e) => setCompany({ ...company, businessHoursSundayEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pagamento PIX</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo de Chave PIX</Label>
                    <Select
                      value={company.pixKeyType || 'CPF'}
                      onValueChange={(value: Company['pixKeyType']) => setCompany({ ...company, pixKeyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIX_KEY_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chave PIX</Label>
                    <Input
                      placeholder="Digite a chave conforme o tipo selecionado"
                      value={company.pixKey || ''}
                      onChange={(e) => setCompany({ ...company, pixKey: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Essa chave será usada para gerar QRCode PIX nas Ordens de Serviço com o valor total (produtos + serviços).
                </p>
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
                    <Select
                      value={company.notifyWhatsappOnOpen !== false ? 'ATIVADO' : 'DESATIVADO'}
                      onValueChange={(value) =>
                        setCompany((prev) => ({ ...prev, notifyWhatsappOnOpen: value === 'ATIVADO' }))
                      }
                    >
                      <SelectTrigger className="w-36 h-9 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVADO">ATIVADO</SelectItem>
                        <SelectItem value="DESATIVADO">DESATIVADO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                    <div>
                      <p className="text-sm font-medium">Notificar Orçamento Pronto</p>
                      <p className="text-xs text-muted-foreground">Envia link do orçamento quando o status mudar.</p>
                    </div>
                    <Select
                      value={company.notifyBudgetReady !== false ? 'ATIVADO' : 'DESATIVADO'}
                      onValueChange={(value) =>
                        setCompany((prev) => ({ ...prev, notifyBudgetReady: value === 'ATIVADO' }))
                      }
                    >
                      <SelectTrigger className="w-36 h-9 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVADO">ATIVADO</SelectItem>
                        <SelectItem value="DESATIVADO">DESATIVADO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                    <div>
                      <p className="text-sm font-medium">Modo Fiscal Estrito (Produtos)</p>
                      <p className="text-xs text-muted-foreground">Quando ativo, exige NCM válido e selecionado da lista oficial para salvar produtos.</p>
                    </div>
                    <Select
                      value={company.fiscalStrictModeEnabled !== false ? 'ATIVADO' : 'DESATIVADO'}
                      onValueChange={(value) =>
                        setCompany((prev) => ({ ...prev, fiscalStrictModeEnabled: value === 'ATIVADO' }))
                      }
                    >
                      <SelectTrigger className="w-36 h-9 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVADO">ATIVADO</SelectItem>
                        <SelectItem value="DESATIVADO">DESATIVADO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold">Cadastro Fiscal da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>UF de Emissão Fiscal</Label>
                    <Select
                      value={company.fiscalUf || ''}
                      onValueChange={(value) => setCompany((prev) => ({ ...prev, fiscalUf: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione a UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZIL_UF_OPTIONS.map((uf) => (
                          <SelectItem key={`uf-${uf}`} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Código de Atividade (CNAE)</Label>
                    <Input
                      placeholder="Ex: 4751201"
                      value={company.fiscalActivityCode || ''}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, fiscalActivityCode: onlyDigits(e.target.value).slice(0, 7) }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Buscar Ramo / Atividade</Label>
                    <Input
                      placeholder="Digite CNAE, ramo ou atividade para busca inteligente"
                      value={company.fiscalActivitySearchTerm || ''}
                      onChange={(e) =>
                        setCompany((prev) => ({ ...prev, fiscalActivitySearchTerm: e.target.value }))
                      }
                    />
                    <p className="text-[10px] text-muted-foreground">
                      A selecao abaixo conecta o cadastro de produtos com sugestoes de NCM, CFOP e CST.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Ramo de Atividade</Label>
                    <Input
                      placeholder="Selecione uma sugestao de atividade"
                      value={company.fiscalActivitySector || ''}
                      onChange={(e) => setCompany((prev) => ({ ...prev, fiscalActivitySector: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 rounded-lg border bg-secondary/20 p-3 space-y-2">
                    <p className="text-xs font-semibold">Sugestoes de atividade fiscal</p>
                    <div className="grid gap-2">
                      {fiscalActivityMatches.map((item) => (
                        <button
                          key={`activity-${item.code}`}
                          type="button"
                          className="w-full rounded-md border bg-background px-3 py-2 text-left text-xs hover:bg-secondary/30"
                          onClick={() => applyFiscalActivitySuggestion(item)}
                        >
                          <span className="font-semibold">{item.code}</span> - {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold">Assistente Contador (IA)</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                    <div>
                      <p className="text-sm font-medium">Ativar Assistente Contador</p>
                      <p className="text-xs text-muted-foreground">Ajuda no fiscal de produtos e nos setores de Estoque, Vendas e Financeiro.</p>
                    </div>
                    <Select
                      value={company.accountantAssistantEnabled ? 'ATIVADO' : 'DESATIVADO'}
                      onValueChange={(value) =>
                        setCompany((prev) => ({ ...prev, accountantAssistantEnabled: value === 'ATIVADO' }))
                      }
                    >
                      <SelectTrigger className="w-36 h-9 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVADO">ATIVADO</SelectItem>
                        <SelectItem value="DESATIVADO">DESATIVADO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg border p-3 space-y-2">
                    <p className="text-xs font-semibold">Servicos que a IA deve acompanhar</p>
                    <div className="grid gap-2">
                      {ACCOUNTANT_ASSISTANT_SERVICE_OPTIONS.map((service) => {
                        const checked = (company.accountantServices || []).includes(service.id);
                        return (
                          <button
                            key={`service-${service.id}`}
                            type="button"
                            className={cn(
                              'w-full rounded-md border px-3 py-2 text-left text-xs transition-colors',
                              checked ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'bg-background hover:bg-secondary/30'
                            )}
                            onClick={() => toggleAccountantService(service.id)}
                          >
                            {checked ? 'Selecionado - ' : ''}{service.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Enviar Notificacoes do Assistente</Label>
                      <Select
                        value={company.accountantNotificationEnabled !== false ? 'ATIVADO' : 'DESATIVADO'}
                        onValueChange={(value) =>
                          setCompany((prev) => ({ ...prev, accountantNotificationEnabled: value === 'ATIVADO' }))
                        }
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATIVADO">ATIVADO</SelectItem>
                          <SelectItem value="DESATIVADO">DESATIVADO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ativar Lembretes IA</Label>
                      <Select
                        value={company.accountantReminderEnabled !== false ? 'ATIVADO' : 'DESATIVADO'}
                        onValueChange={(value) =>
                          setCompany((prev) => ({ ...prev, accountantReminderEnabled: value === 'ATIVADO' }))
                        }
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATIVADO">ATIVADO</SelectItem>
                          <SelectItem value="DESATIVADO">DESATIVADO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Lembrete (dias)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={90}
                        value={company.accountantReminderFrequencyDays || 7}
                        onChange={(e) =>
                          setCompany((prev) => ({
                            ...prev,
                            accountantReminderFrequencyDays: Math.max(1, Math.min(90, Number(e.target.value) || 7)),
                          }))
                        }
                      />
                    </div>
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
          {/* ── STATUS MANAGEMENT ── */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Gerenciamento de Status</CardTitle>
              <CardDescription>Defina os status disponíveis para as ordens de serviço e sua ordem de exibição.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do novo status..."
                  value={newOsStatusName}
                  onChange={(e) => setNewOsStatusName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const name = newOsStatusName.trim();
                      if (!name) return toast.error('Informe o nome do status.');
                      const current = company.osStatuses && company.osStatuses.length > 0
                        ? company.osStatuses
                        : STATUS_COLUMNS.map((s, i) => ({ id: s, name: s, order: i }));
                      if (current.some(s => s.name.toLowerCase() === name.toLowerCase())) {
                        return toast.error('Status com este nome já existe.');
                      }
                      setCompany(prev => ({
                        ...prev,
                        osStatuses: [...current, { id: Math.random().toString(36).substr(2, 9), name, order: current.length }]
                      }));
                      setNewOsStatusName('');
                      toast.success('Status adicionado.');
                    }
                  }}
                />
                <Button onClick={() => {
                  const name = newOsStatusName.trim();
                  if (!name) return toast.error('Informe o nome do status.');
                  const current = company.osStatuses && company.osStatuses.length > 0
                    ? company.osStatuses
                    : STATUS_COLUMNS.map((s, i) => ({ id: s, name: s, order: i }));
                  if (current.some(s => s.name.toLowerCase() === name.toLowerCase())) {
                    return toast.error('Status com este nome já existe.');
                  }
                  setCompany(prev => ({
                    ...prev,
                    osStatuses: [...current, { id: Math.random().toString(36).substr(2, 9), name, order: current.length }]
                  }));
                  setNewOsStatusName('');
                  toast.success('Status adicionado.');
                }} className="gap-2">
                  <Plus className="w-4 h-4" /> Adicionar
                </Button>
              </div>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-center w-16">Ordem</th>
                      <th className="px-4 py-2 text-left">Nome do Status</th>
                      <th className="px-4 py-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeOsStatuses.map((statusName, index) => (
                      <tr key={statusName} className="hover:bg-secondary/10">
                        <td className="px-4 py-2 text-center text-muted-foreground text-xs">{index + 1}</td>
                        <td className="px-4 py-2 font-medium">{statusName}</td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              disabled={index === 0}
                              onClick={() => {
                                const current = company.osStatuses && company.osStatuses.length > 0
                                  ? [...company.osStatuses].sort((a, b) => a.order - b.order)
                                  : STATUS_COLUMNS.map((s, i) => ({ id: s, name: s, order: i }));
                                const i = current.findIndex(s => s.name === statusName);
                                if (i <= 0) return;
                                const next = current.map((s, idx) => {
                                  if (idx === i) return { ...s, order: current[i - 1].order };
                                  if (idx === i - 1) return { ...s, order: current[i].order };
                                  return s;
                                });
                                setCompany(prev => ({ ...prev, osStatuses: next }));
                              }}
                              title="Mover para cima"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              disabled={index === activeOsStatuses.length - 1}
                              onClick={() => {
                                const current = company.osStatuses && company.osStatuses.length > 0
                                  ? [...company.osStatuses].sort((a, b) => a.order - b.order)
                                  : STATUS_COLUMNS.map((s, i) => ({ id: s, name: s, order: i }));
                                const i = current.findIndex(s => s.name === statusName);
                                if (i >= current.length - 1) return;
                                const next = current.map((s, idx) => {
                                  if (idx === i) return { ...s, order: current[i + 1].order };
                                  if (idx === i + 1) return { ...s, order: current[i].order };
                                  return s;
                                });
                                setCompany(prev => ({ ...prev, osStatuses: next }));
                              }}
                              title="Mover para baixo"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-rose-500"
                              onClick={() => {
                                const current = company.osStatuses && company.osStatuses.length > 0
                                  ? [...company.osStatuses].sort((a, b) => a.order - b.order)
                                  : STATUS_COLUMNS.map((s, i) => ({ id: s, name: s, order: i }));
                                const filtered = current.filter(s => s.name !== statusName).map((s, i) => ({ ...s, order: i }));
                                setCompany(prev => ({ ...prev, osStatuses: filtered }));
                                toast.success('Status removido.');
                              }}
                              title="Remover status"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!company.osStatuses || company.osStatuses.length === 0) && (
                <p className="text-[11px] text-muted-foreground italic">Exibindo status padrão do sistema. Adicione um status para personalizar a lista.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Cadastro de Equipamentos</CardTitle>
              <CardDescription>Defina os tipos de equipamentos e seus respectivos prazos de atendimento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
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
                <div className="md:col-span-6 rounded-lg border border-dashed border-primary/30 bg-background/70 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Regra de Acúmulo (Extensão Automática de Prazo)</p>
                  <p className="text-[10px] text-muted-foreground mt-1 mb-3">
                    Defina a partir de quantas O.S. abertas deste equipamento o sistema deve estender o prazo de diagnóstico e conclusão.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>A partir Qtd.</Label>
                      <Input id="new-eq-overload-from" type="number" defaultValue="0" min="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>+Dias Diag.</Label>
                      <Input id="new-eq-overload-diag" type="number" defaultValue="0" min="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>+Dias Conclusão</Label>
                      <Input id="new-eq-overload-comp" type="number" defaultValue="0" min="0" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-6 rounded-lg border border-dashed border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Cobrança de Diagnóstico em Reprovação</p>
                  <p className="text-[10px] text-muted-foreground mt-1 mb-3">
                    Quando o orçamento for reprovado, cobrar o valor de diagnóstico ao cliente.
                  </p>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        id="new-eq-charge-diag"
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-medium">Cobrar diagnóstico</span>
                    </label>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input id="new-eq-diag-charge-value" type="number" defaultValue="0" min="0" step="0.01" className="h-8 w-32" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-6 flex justify-end">
                  <Button className="gap-2" onClick={() => {
                    const nameInput = document.getElementById('new-eq-name') as HTMLInputElement | null;
                    const diagInput = document.getElementById('new-eq-diag') as HTMLInputElement | null;
                    const compInput = document.getElementById('new-eq-comp') as HTMLInputElement | null;
                    const overloadFromInput = document.getElementById('new-eq-overload-from') as HTMLInputElement | null;
                    const overloadDiagInput = document.getElementById('new-eq-overload-diag') as HTMLInputElement | null;
                    const overloadCompInput = document.getElementById('new-eq-overload-comp') as HTMLInputElement | null;
                    const chargeDiagInput = document.getElementById('new-eq-charge-diag') as HTMLInputElement | null;
                    const diagChargeValueInput = document.getElementById('new-eq-diag-charge-value') as HTMLInputElement | null;
                    if (!nameInput || !diagInput || !compInput || !overloadFromInput || !overloadDiagInput || !overloadCompInput) {
                      toast.error('Campos de equipamento indisponíveis.');
                      return;
                    }

                    const name = nameInput.value.trim();
                    const diag = parseInt(diagInput.value);
                    const comp = parseInt(compInput.value);
                    const overloadFromQty = parseInt(overloadFromInput.value || '0');
                    const overloadDiagnosisDays = parseInt(overloadDiagInput.value || '0');
                    const overloadCompletionDays = parseInt(overloadCompInput.value || '0');
                    const chargeDiag = chargeDiagInput?.checked || false;
                    const diagChargeValue = parseFloat(diagChargeValueInput?.value || '0');
                    const safeDiag = Number.isFinite(diag) ? Math.max(0, diag) : 1;
                    const safeComp = Number.isFinite(comp) ? Math.max(0, comp) : 3;
                    if (!name) return toast.error('Nome do equipamento é obrigatório');
                    const nextEquipment = {
                      name,
                      defaultDiagnosisDays: safeDiag,
                      defaultCompletionDays: safeComp,
                      overloadFromQty: Number.isFinite(overloadFromQty) ? Math.max(0, overloadFromQty) : 0,
                      overloadDiagnosisDays: Number.isFinite(overloadDiagnosisDays) ? Math.max(0, overloadDiagnosisDays) : 0,
                      overloadCompletionDays: Number.isFinite(overloadCompletionDays) ? Math.max(0, overloadCompletionDays) : 0,
                      chargeDiagnosisOnRejection: chargeDiag,
                      diagnosisChargeValue: Number.isFinite(diagChargeValue) ? Math.max(0, diagChargeValue) : 0,
                    };

                    setEquipmentTypes(prev => [...prev, {
                      id: Math.random().toString(36).substr(2, 9),
                      ...nextEquipment,
                      companyId: '1'
                    }]);
                    toast.success('Equipamento cadastrado!');

                    nameInput.value = '';
                    diagInput.value = '1';
                    compInput.value = '3';
                    overloadFromInput.value = '0';
                    overloadDiagInput.value = '0';
                    overloadCompInput.value = '0';
                    if (chargeDiagInput) chargeDiagInput.checked = false;
                    if (diagChargeValueInput) diagChargeValueInput.value = '0';
                  }}>
                    <Plus className="w-4 h-4" /> Cadastrar Equipamento
                  </Button>
                </div>
              </div>

              <Dialog open={isEquipmentEditOpen} onOpenChange={(open) => {
                setIsEquipmentEditOpen(open);
                if (!open) setEquipmentEditData(null);
              }}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Editar Equipamento</DialogTitle>
                    <DialogDescription>Ajuste os prazos e regras de acúmulo deste equipamento.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Nome do Equipamento</Label>
                      <Input
                        value={equipmentEditData?.name || ''}
                        onChange={(e) => setEquipmentEditData((prev) => prev ? ({ ...prev, name: e.target.value }) : prev)}
                        placeholder="Ex: Celular, Notebook..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Diagnóstico (Dias)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={equipmentEditData?.defaultDiagnosisDays ?? 0}
                        onChange={(e) => setEquipmentEditData((prev) => prev ? ({
                          ...prev,
                          defaultDiagnosisDays: Math.max(0, Number(e.target.value || 0))
                        }) : prev)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Conclusão (Dias)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={equipmentEditData?.defaultCompletionDays ?? 0}
                        onChange={(e) => setEquipmentEditData((prev) => prev ? ({
                          ...prev,
                          defaultCompletionDays: Math.max(0, Number(e.target.value || 0))
                        }) : prev)}
                      />
                    </div>
                    <div className="md:col-span-6 rounded-lg border border-dashed border-primary/30 bg-background/70 p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">Regra de Acúmulo (Extensão Automática de Prazo)</p>
                      <p className="text-[10px] text-muted-foreground mt-1 mb-3">
                        Defina a partir de quantas O.S. abertas deste equipamento o sistema deve estender o prazo de diagnóstico e conclusão.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>A partir Qtd.</Label>
                          <Input
                            type="number"
                            min="0"
                            value={equipmentEditData?.overloadFromQty ?? 0}
                            onChange={(e) => setEquipmentEditData((prev) => prev ? ({
                              ...prev,
                              overloadFromQty: Math.max(0, Number(e.target.value || 0))
                            }) : prev)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>+Dias Diag.</Label>
                          <Input
                            type="number"
                            min="0"
                            value={equipmentEditData?.overloadDiagnosisDays ?? 0}
                            onChange={(e) => setEquipmentEditData((prev) => prev ? ({
                              ...prev,
                              overloadDiagnosisDays: Math.max(0, Number(e.target.value || 0))
                            }) : prev)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>+Dias Conclusão</Label>
                          <Input
                            type="number"
                            min="0"
                            value={equipmentEditData?.overloadCompletionDays ?? 0}
                            onChange={(e) => setEquipmentEditData((prev) => prev ? ({
                              ...prev,
                              overloadCompletionDays: Math.max(0, Number(e.target.value || 0))
                            }) : prev)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-6 mt-4 rounded-lg border border-dashed border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Cobrança de Diagnóstico em Reprovação</p>
                      <p className="text-[10px] text-muted-foreground mt-1 mb-3">
                        Quando o orçamento for reprovado, cobrar o valor de diagnóstico ao cliente.
                      </p>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded"
                            checked={equipmentEditData?.chargeDiagnosisOnRejection || false}
                            onChange={(e) => setEquipmentEditData(prev => prev ? ({ ...prev, chargeDiagnosisOnRejection: e.target.checked }) : prev)}
                          />
                          <span className="text-sm font-medium">Cobrar diagnóstico</span>
                        </label>
                        <div className="space-y-1">
                          <Label className="text-xs">Valor (R$)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="h-8 w-32"
                            value={equipmentEditData?.diagnosisChargeValue ?? 0}
                            onChange={(e) => setEquipmentEditData(prev => prev ? ({
                              ...prev,
                              diagnosisChargeValue: Math.max(0, parseFloat(e.target.value || '0'))
                            }) : prev)}
                            disabled={!equipmentEditData?.chargeDiagnosisOnRejection}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsEquipmentEditOpen(false);
                      setEquipmentEditData(null);
                    }}>Cancelar</Button>
                    <Button onClick={() => {
                      if (!equipmentEditData) return;
                      const name = equipmentEditData.name.trim();
                      if (!name) {
                        toast.error('Nome do equipamento é obrigatório');
                        return;
                      }
                      setEquipmentTypes(prev => prev.map(eq => (
                        eq.id === equipmentEditData.id
                          ? { ...equipmentEditData, name }
                          : eq
                      )));
                      toast.success('Equipamento atualizado!');
                      setIsEquipmentEditOpen(false);
                      setEquipmentEditData(null);
                    }}>Salvar Alterações</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isEquipmentBrandsOpen} onOpenChange={(open) => {
                setIsEquipmentBrandsOpen(open);
                if (!open) {
                  setEquipmentBrandsData(null);
                  setNewEquipmentBrand('');
                  setNewEquipmentModel('');
                }
              }}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Marcas e Modelos</DialogTitle>
                    <DialogDescription>
                      Gerencie as marcas cadastradas para {equipmentBrandsData?.name || 'este equipamento'}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg border bg-secondary/10 p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2 md:col-span-1">
                        <Label>Marca</Label>
                        <Input
                          value={newEquipmentBrand}
                          onChange={(e) => setNewEquipmentBrand(e.target.value.toUpperCase())}
                          placeholder="Ex: APPLE"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Modelo</Label>
                        <Input
                          value={newEquipmentModel}
                          onChange={(e) => setNewEquipmentModel(e.target.value.toUpperCase())}
                          placeholder="Ex: IPHONE 15"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          if (!equipmentBrandsData) return;
                          const brand = normalizeEquipmentText(newEquipmentBrand);
                          const model = normalizeEquipmentText(newEquipmentModel);
                          if (!brand) {
                            toast.error('Informe a marca.');
                            return;
                          }
                          setEquipmentTypes((prev) => prev.map((eq) => {
                            if (eq.id !== equipmentBrandsData.id) return eq;
                            const nextBrandModels = [...(eq.brandModels || [])];
                            const existingIndex = nextBrandModels.findIndex((item) =>
                              normalizeEquipmentText(item.brand) === brand
                            );
                            if (existingIndex === -1) {
                              nextBrandModels.push({
                                brand,
                                models: model ? [model] : [],
                              });
                            } else if (model) {
                              const existing = nextBrandModels[existingIndex];
                              const models = Array.from(new Set([...(existing.models || []), model]));
                              nextBrandModels[existingIndex] = { ...existing, models };
                            }
                            return { ...eq, brandModels: nextBrandModels };
                          }));
                          setEquipmentBrandsData((prev) => {
                            if (!prev) return prev;
                            const nextBrandModels = [...(prev.brandModels || [])];
                            const existingIndex = nextBrandModels.findIndex((item) =>
                              normalizeEquipmentText(item.brand) === brand
                            );
                            if (existingIndex === -1) {
                              nextBrandModels.push({
                                brand,
                                models: model ? [model] : [],
                              });
                            } else if (model) {
                              const existing = nextBrandModels[existingIndex];
                              const models = Array.from(new Set([...(existing.models || []), model]));
                              nextBrandModels[existingIndex] = { ...existing, models };
                            }
                            return { ...prev, brandModels: nextBrandModels };
                          });
                          setNewEquipmentBrand('');
                          setNewEquipmentModel('');
                        }}
                      >
                        <Plus className="w-4 h-4" /> Adicionar Marca
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(equipmentBrandsData?.brandModels || []).length === 0 ? (
                      <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                        Nenhuma marca cadastrada ainda.
                      </div>
                    ) : (
                      (equipmentBrandsData?.brandModels || []).map((entry) => (
                        <div key={entry.brand} className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-bold">{entry.brand}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500"
                              onClick={() => {
                                if (!equipmentBrandsData) return;
                                setEquipmentTypes((prev) => prev.map((eq) => {
                                  if (eq.id !== equipmentBrandsData.id) return eq;
                                  const nextBrandModels = (eq.brandModels || []).filter((item) =>
                                    normalizeEquipmentText(item.brand) !== normalizeEquipmentText(entry.brand)
                                  );
                                  return { ...eq, brandModels: nextBrandModels };
                                }));
                                setEquipmentBrandsData((prev) => prev ? ({
                                  ...prev,
                                  brandModels: (prev.brandModels || []).filter((item) =>
                                    normalizeEquipmentText(item.brand) !== normalizeEquipmentText(entry.brand)
                                  )
                                }) : prev);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(entry.models || []).length === 0 ? (
                              <span className="text-[10px] text-muted-foreground">Sem modelos cadastrados.</span>
                            ) : (
                              entry.models.map((model) => (
                                <div key={model} className="flex items-center gap-2 rounded-full border px-3 py-1 text-[10px]">
                                  <span>{model}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => {
                                      if (!equipmentBrandsData) return;
                                      setEquipmentTypes((prev) => prev.map((eq) => {
                                        if (eq.id !== equipmentBrandsData.id) return eq;
                                        const nextBrandModels = (eq.brandModels || []).map((item) => {
                                          if (normalizeEquipmentText(item.brand) !== normalizeEquipmentText(entry.brand)) return item;
                                          const nextModels = (item.models || []).filter((m) => normalizeEquipmentText(m) !== normalizeEquipmentText(model));
                                          return { ...item, models: nextModels };
                                        }).filter((item) => (item.models || []).length > 0 || normalizeEquipmentText(item.brand) !== normalizeEquipmentText(entry.brand));
                                        return { ...eq, brandModels: nextBrandModels };
                                      }));
                                      setEquipmentBrandsData((prev) => {
                                        if (!prev) return prev;
                                        const nextBrandModels = (prev.brandModels || []).map((item) => {
                                          if (normalizeEquipmentText(item.brand) !== normalizeEquipmentText(entry.brand)) return item;
                                          const nextModels = (item.models || []).filter((m) => normalizeEquipmentText(m) !== normalizeEquipmentText(model));
                                          return { ...item, models: nextModels };
                                        }).filter((item) => (item.models || []).length > 0 || normalizeEquipmentText(item.brand) !== normalizeEquipmentText(entry.brand));
                                        return { ...prev, brandModels: nextBrandModels };
                                      });
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEquipmentBrandsOpen(false)}>Fechar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isEquipmentServicesOpen} onOpenChange={(open) => {
                setIsEquipmentServicesOpen(open);
                if (!open) {
                  setEquipmentServicesData(null);
                  setNewEquipmentServiceName('');
                  setNewEquipmentServicePrice('0');
                  setNewEquipmentServiceExecValue('1');
                  setNewEquipmentServiceExecUnit('Horas');
                }
              }}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Serviços Cadastrados</DialogTitle>
                    <DialogDescription>
                      Gerencie os serviços vinculados a {equipmentServicesData?.name || 'este equipamento'}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg border bg-secondary/10 p-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Descrição do Serviço</Label>
                        <Input
                          value={newEquipmentServiceName}
                          onChange={(e) => setNewEquipmentServiceName(e.target.value.toUpperCase())}
                          placeholder="Ex: TROCA DE TELA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={newEquipmentServicePrice}
                          onChange={(e) => setNewEquipmentServicePrice(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prazo</Label>
                        <Input
                          type="number"
                          min="0"
                          value={newEquipmentServiceExecValue}
                          onChange={(e) => setNewEquipmentServiceExecValue(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unidade</Label>
                        <Select value={newEquipmentServiceExecUnit} onValueChange={(v: any) => setNewEquipmentServiceExecUnit(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Horas">Horas</SelectItem>
                            <SelectItem value="Dias">Dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          if (!equipmentServicesData) return;
                          const description = normalizeEquipmentText(newEquipmentServiceName);
                          if (!description) {
                            toast.error('Informe a descricao do servico.');
                            return;
                          }
                          const unitPrice = Number(newEquipmentServicePrice) || 0;
                          const execValue = Math.max(0, Number(newEquipmentServiceExecValue) || 0);
                          const servicePayload = {
                            id: Math.random().toString(36).substr(2, 9),
                            description,
                            unitPrice,
                            executionTimeValue: execValue > 0 ? execValue : undefined,
                            executionTimeUnit: execValue > 0 ? newEquipmentServiceExecUnit : undefined,
                          };

                          setEquipmentTypes((prev) => prev.map((eq) => {
                            if (eq.id !== equipmentServicesData.id) return eq;
                            const nextServices = [...(eq.services || [])];
                            const existingIndex = nextServices.findIndex((item) =>
                              normalizeEquipmentText(item.description) === description
                            );
                            if (existingIndex >= 0) {
                              nextServices[existingIndex] = { ...nextServices[existingIndex], ...servicePayload };
                            } else {
                              nextServices.push(servicePayload);
                            }
                            return { ...eq, services: nextServices };
                          }));

                          setEquipmentServicesData((prev) => {
                            if (!prev) return prev;
                            const nextServices = [...(prev.services || [])];
                            const existingIndex = nextServices.findIndex((item) =>
                              normalizeEquipmentText(item.description) === description
                            );
                            if (existingIndex >= 0) {
                              nextServices[existingIndex] = { ...nextServices[existingIndex], ...servicePayload };
                            } else {
                              nextServices.push(servicePayload);
                            }
                            return { ...prev, services: nextServices };
                          });

                          setNewEquipmentServiceName('');
                          setNewEquipmentServicePrice('0');
                          setNewEquipmentServiceExecValue('1');
                          setNewEquipmentServiceExecUnit('Horas');
                        }}
                      >
                        <Plus className="w-4 h-4" /> Adicionar Servico
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(equipmentServicesData?.services || []).length === 0 ? (
                      <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                        Nenhum serviço cadastrado ainda.
                      </div>
                    ) : (
                      (equipmentServicesData?.services || []).map((service) => (
                        <div key={service.id} className="rounded-md border p-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold">{service.description}</div>
                            <div className="text-[10px] text-muted-foreground">
                              Valor: R$ {(Number(service.unitPrice) || 0).toFixed(2)}
                              {service.executionTimeValue && service.executionTimeUnit && (
                                <span> • Prazo: {service.executionTimeValue} {service.executionTimeUnit}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500"
                            onClick={() => {
                              if (!equipmentServicesData) return;
                              setEquipmentTypes((prev) => prev.map((eq) => {
                                if (eq.id !== equipmentServicesData.id) return eq;
                                const nextServices = (eq.services || []).filter((item) => item.id !== service.id);
                                return { ...eq, services: nextServices };
                              }));
                              setEquipmentServicesData((prev) => prev ? ({
                                ...prev,
                                services: (prev.services || []).filter((item) => item.id !== service.id)
                              }) : prev);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEquipmentServicesOpen(false)}>Fechar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* ── DEADLINE RULES DIALOG ── */}
              <Dialog open={isEquipmentDeadlineRulesOpen} onOpenChange={(open) => {
                setIsEquipmentDeadlineRulesOpen(open);
                if (!open) {
                  setEquipmentDeadlineRulesData(null);
                  setNewDeadlineRuleKeyword('');
                  setNewDeadlineRuleDiagHours('0');
                  setNewDeadlineRuleDiagDays('0');
                  setNewDeadlineRuleCompHours('0');
                  setNewDeadlineRuleCompDays('0');
                }
              }}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Regras de Prazo — {equipmentDeadlineRulesData?.name}</DialogTitle>
                    <DialogDescription>
                      Defina exceções de prazo por serviço. Se um item da OS contém a palavra-chave, este prazo tem prioridade máxima sobre os padrões do equipamento.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">Nova Regra de Exceção</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Palavra-chave do Serviço</Label>
                          <Input
                            placeholder="Ex: Formatação, Troca de tela..."
                            value={newDeadlineRuleKeyword}
                            onChange={(e) => setNewDeadlineRuleKeyword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Diag. Horas</Label>
                          <Input type="number" min="0" value={newDeadlineRuleDiagHours} onChange={(e) => setNewDeadlineRuleDiagHours(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Conc. Horas</Label>
                          <Input type="number" min="0" value={newDeadlineRuleCompHours} onChange={(e) => setNewDeadlineRuleCompHours(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Conc. Dias</Label>
                          <Input type="number" min="0" value={newDeadlineRuleCompDays} onChange={(e) => setNewDeadlineRuleCompDays(e.target.value)} />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Deixe Diag. Horas = 0 para usar o padrão de diagnóstico do equipamento. Use Conc. Horas para serviços rápidos (ex: Formatação = 3 horas). Conc. Dias é adicionado ao prazo base.</p>
                      <div className="flex justify-end">
                        <Button size="sm" className="gap-2" onClick={() => {
                          if (!equipmentDeadlineRulesData) return;
                          const keyword = newDeadlineRuleKeyword.trim();
                          if (!keyword) return toast.error('Informe a palavra-chave do serviço.');
                          const diagH = Math.max(0, Number(newDeadlineRuleDiagHours) || 0);
                          const compH = Math.max(0, Number(newDeadlineRuleCompHours) || 0);
                          const compD = Math.max(0, Number(newDeadlineRuleCompDays) || 0);
                          const newRule: EquipmentDeadlineRule = {
                            id: Math.random().toString(36).substr(2, 9),
                            serviceKeyword: keyword,
                            diagnosisHours: diagH > 0 ? diagH : undefined,
                            completionHours: compH > 0 ? compH : undefined,
                            completionDays: compD > 0 ? compD : undefined,
                            priority: (equipmentDeadlineRulesData.deadlineRules?.length || 0) + 1,
                          };
                          const updatedRules = [...(equipmentDeadlineRulesData.deadlineRules || []), newRule];
                          setEquipmentTypes(prev => prev.map(eq => eq.id === equipmentDeadlineRulesData.id ? { ...eq, deadlineRules: updatedRules } : eq));
                          setEquipmentDeadlineRulesData(prev => prev ? { ...prev, deadlineRules: updatedRules } : prev);
                          setNewDeadlineRuleKeyword('');
                          setNewDeadlineRuleDiagHours('0');
                          setNewDeadlineRuleDiagDays('0');
                          setNewDeadlineRuleCompHours('0');
                          setNewDeadlineRuleCompDays('0');
                          toast.success('Regra adicionada.');
                        }}>
                          <Plus className="w-4 h-4" /> Adicionar Regra
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/50 text-[10px] uppercase font-bold text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2 text-left">Palavra-chave</th>
                            <th className="px-4 py-2 text-center">Diag. Horas</th>
                            <th className="px-4 py-2 text-center">Conc. Horas</th>
                            <th className="px-4 py-2 text-center">Conc. Dias</th>
                            <th className="px-4 py-2 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(equipmentDeadlineRulesData?.deadlineRules || []).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 text-center text-xs text-muted-foreground italic">
                                Nenhuma regra cadastrada. O sistema usará os prazos padrão do equipamento.
                              </td>
                            </tr>
                          ) : (
                            (equipmentDeadlineRulesData?.deadlineRules || []).map((rule) => (
                              <tr key={rule.id} className="hover:bg-secondary/10">
                                <td className="px-4 py-2 font-medium">{rule.serviceKeyword}</td>
                                <td className="px-4 py-2 text-center text-xs">{rule.diagnosisHours ?? '—'}</td>
                                <td className="px-4 py-2 text-center text-xs">{rule.completionHours ?? '—'}</td>
                                <td className="px-4 py-2 text-center text-xs">{rule.completionDays ?? '—'}</td>
                                <td className="px-4 py-2 text-right">
                                  <Button
                                    variant="ghost" size="icon" className="h-7 w-7 text-rose-500"
                                    onClick={() => {
                                      if (!equipmentDeadlineRulesData) return;
                                      const updatedRules = (equipmentDeadlineRulesData.deadlineRules || []).filter(r => r.id !== rule.id);
                                      setEquipmentTypes(prev => prev.map(eq => eq.id === equipmentDeadlineRulesData.id ? { ...eq, deadlineRules: updatedRules } : eq));
                                      setEquipmentDeadlineRulesData(prev => prev ? { ...prev, deadlineRules: updatedRules } : prev);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                      <p className="font-bold">Hierarquia de verificação ao abrir OS:</p>
                      <p>1. <span className="font-semibold">Regra de Serviço</span> — Se um item da OS contiver a palavra-chave, aplica este prazo (prioridade máxima).</p>
                      <p>2. <span className="font-semibold">Padrão do Equipamento</span> — Diagnóstico e conclusão em dias configurados acima.</p>
                      <p>3. <span className="font-semibold">Fallback</span> — Se nenhuma regra se aplicar, o sistema usa 1 dia diagnóstico / 3 dias conclusão.</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEquipmentDeadlineRulesOpen(false)}>Fechar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 text-left">Equipamento</th>
                      <th className="px-6 py-3 text-center">Diagnóstico</th>
                      <th className="px-6 py-3 text-center">Conclusão</th>
                      <th className="px-6 py-3 text-center">A partir Qtd.</th>
                      <th className="px-6 py-3 text-center">+Dias Diag.</th>
                      <th className="px-6 py-3 text-center">+Dias Conc.</th>
                      <th className="px-6 py-3 text-center">Cobrança Diag.</th>
                      <th className="px-6 py-3 text-center">Regras de Prazo</th>
                      <th className="px-6 py-3 text-center">Marcas e Modelos</th>
                      <th className="px-6 py-3 text-center">Serviços</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {equipmentTypes.map(eq => (
                      <tr key={eq.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 font-bold">{eq.name}</td>
                        <td className="px-6 py-4 text-center">{eq.defaultDiagnosisDays} dias</td>
                        <td className="px-6 py-4 text-center">{eq.defaultCompletionDays} dias</td>
                        <td className="px-6 py-4 text-center">{eq.overloadFromQty || 0}</td>
                        <td className="px-6 py-4 text-center">{eq.overloadDiagnosisDays || 0}</td>
                        <td className="px-6 py-4 text-center">{eq.overloadCompletionDays || 0}</td>
                        <td className="px-6 py-4 text-center">
                          {eq.chargeDiagnosisOnRejection ? (
                            <span className="text-xs font-medium text-amber-700">Sim · R${(eq.diagnosisChargeValue || 0).toFixed(2)}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Não</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setEquipmentDeadlineRulesData({ ...eq });
                              setIsEquipmentDeadlineRulesOpen(true);
                            }}
                          >
                            {(eq.deadlineRules?.length || 0) > 0 ? `${eq.deadlineRules!.length} regras` : 'Ver Regras'}
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setEquipmentBrandsData({ ...eq });
                              setIsEquipmentBrandsOpen(true);
                            }}
                          >
                            Ver Marcas
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setEquipmentServicesData({ ...eq });
                              setIsEquipmentServicesOpen(true);
                            }}
                          >
                            Ver Serviços
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEquipmentEditData({ ...eq });
                                setIsEquipmentEditOpen(true);
                              }}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => setEquipmentTypes(prev => prev.filter(e => e.id !== eq.id))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Padrões para Status "Aguardando Peça"</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Cadastre instituição/tipo de compra com prazo padrão. Ao selecionar na O.S, o prazo de conclusão será ajustado automaticamente.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Nome Instituição</Label>
                    <Input
                      value={newWaitingInstitutionName}
                      onChange={(e) => setNewWaitingInstitutionName(e.target.value)}
                      placeholder="Ex: Distribuidora XPTO"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Compra</Label>
                    <Input
                      value={newWaitingPurchaseType}
                      onChange={(e) => setNewWaitingPurchaseType(e.target.value)}
                      placeholder="Ex: Importação, Mercado Livre..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo (dias)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newWaitingDeadlineDays}
                      onChange={(e) => setNewWaitingDeadlineDays(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      const institutionName = newWaitingInstitutionName.trim();
                      const purchaseType = newWaitingPurchaseType.trim();
                      const deadlineDays = Math.max(0, Number(newWaitingDeadlineDays || 0));
                      if (!institutionName) {
                        toast.error('Informe o nome da instituição.');
                        return;
                      }
                      setCompany((prev) => ({
                        ...prev,
                        waitingPartOptions: [
                          ...(prev.waitingPartOptions || []),
                          {
                            id: safeRandomUUID(),
                            institutionName,
                            purchaseType,
                            deadlineDays,
                          },
                        ],
                      }));
                      setNewWaitingInstitutionName('');
                      setNewWaitingPurchaseType('');
                      setNewWaitingDeadlineDays('7');
                      toast.success('Padrão de aguardando peça cadastrado.');
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Padrão
                  </Button>
                </div>
                <div className="rounded-md border bg-background overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-[10px] uppercase font-bold text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left">Instituição</th>
                        <th className="px-4 py-2 text-left">Tipo de Compra</th>
                        <th className="px-4 py-2 text-center">Prazo</th>
                        <th className="px-4 py-2 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(company.waitingPartOptions || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-xs text-muted-foreground italic">
                            Nenhum padrão cadastrado.
                          </td>
                        </tr>
                      ) : (
                        (company.waitingPartOptions || []).map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 font-medium">{item.institutionName}</td>
                            <td className="px-4 py-2">{item.purchaseType || '-'}</td>
                            <td className="px-4 py-2 text-center">{item.deadlineDays} dias</td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-500"
                                onClick={() =>
                                  setCompany((prev) => ({
                                    ...prev,
                                    waitingPartOptions: (prev.waitingPartOptions || []).filter((entry) => entry.id !== item.id),
                                  }))
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
                        {activeOsStatuses.map(s => (
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
          <Tabs defaultValue="api-whatsapp" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="api-whatsapp">WHATSAPP</TabsTrigger>
              <TabsTrigger value="api-agentes">AGENTES IA</TabsTrigger>
            </TabsList>

            <TabsContent value="api-whatsapp" className="mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Conexao WhatsApp (Gateway)</CardTitle>
                    <CardDescription>Conecte o numero via QR Code usando seu proprio Gateway.</CardDescription>
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
                          onChange={(e) => setWsConfig({ ...wsConfig, serverUrl: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Chave de API do Gateway (Global API Key)</Label>
                        <Input
                          type="password"
                          placeholder="Sua chave secreta..."
                          value={wsConfig.apiKey}
                          onChange={(e) => setWsConfig({ ...wsConfig, apiKey: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Nome da Instancia (Opcional)</Label>
                        <Input
                          placeholder="Ex: tecnico-01"
                          value={wsConfig.instanceName}
                          onChange={(e) => setWsConfig({ ...wsConfig, instanceName: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground italic">Use um nome unico para esta empresa.</p>
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
                    <p className="font-bold text-primary flex items-center gap-2">INFORMACOES TECNICAS:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">URL Webhook (no Gateway):</span>
                        <code className="bg-white px-2 py-0.5 rounded block truncate border mt-1">
                          {window.location.origin}/api/whatsapp/webhook
                        </code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status do Servico:</span>
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

            <TabsContent value="api-agentes" className="mt-6 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Agentes IA</CardTitle>
                  <CardDescription>
                    Defina a origem da IA e, no modo proprio, configure multiplas plataformas e ative apenas uma para toda a equipe tecnica.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Origem do Assistente IA</Label>
                    <Select
                      value={company.aiAssistantMode || 'saas-managed'}
                      onValueChange={(value) =>
                        setCompany((prev) => ({
                          ...prev,
                          aiAssistantMode: value as Company['aiAssistantMode'],
                          aiSaasCatalogId: value === 'saas-managed' ? (prev.aiSaasCatalogId || saasCatalogOptions[0]?.id || '') : '',
                        }))
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas-managed">Usar assistente IA fornecido pelo SaaS Admin</SelectItem>
                        <SelectItem value="company-own">Usar chave API propria da empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {company.aiAssistantMode !== 'company-own' ? (
                    <div className="space-y-4 rounded-lg border p-3">
                      <div className="space-y-2">
                        <Label>Lista IA selecionada no plano</Label>
                        <Select
                          value={company.aiSaasCatalogId || selectedSaasCatalogForCompany?.id || ''}
                          onValueChange={(value) => setCompany((prev) => ({ ...prev, aiSaasCatalogId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a lista publicada pelo SaaS Admin" />
                          </SelectTrigger>
                          <SelectContent>
                            {saasCatalogOptions.map((catalog) => (
                              <SelectItem key={catalog.id} value={catalog.id}>
                                {catalog.listName} - {AI_PROVIDER_LABELS[catalog.provider]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedSaasCatalogForCompany ? (
                        <div className="rounded-md border border-dashed p-2 text-xs text-muted-foreground">
                          {selectedSaasCatalogForCompany.models?.length || 0} modelos disponiveis para a equipe.
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhuma lista disponivel no momento.</p>
                      )}

                      <div className="flex justify-end">
                        <Button onClick={saveCompanyAiConfig} disabled={isSavingCompanyAiProviderConfig} className="gap-2">
                          {isSavingCompanyAiProviderConfig && <RefreshCw className="w-4 h-4 animate-spin" />}
                          Salvar IA da Empresa
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-lg border p-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          placeholder="Nome da plataforma"
                          value={newCompanyPlatformName}
                          onChange={(e) => setNewCompanyPlatformName(e.target.value)}
                        />
                        <Select
                          value={newCompanyPlatformProvider}
                          onValueChange={(value) => {
                            setNewCompanyPlatformProvider(value as AIProvider);
                            setNewCompanyPlatformModel('provider-default');
                          }}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                            <SelectItem value="groq">Groq</SelectItem>
                            <SelectItem value="gemini">Gemini</SelectItem>
                            <SelectItem value="claude">Claude</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="password"
                          placeholder="API Key da plataforma"
                          value={newCompanyPlatformApiKey}
                          onChange={(e) => setNewCompanyPlatformApiKey(e.target.value)}
                          autoComplete="off"
                        />
                        <Select value={newCompanyPlatformModel} onValueChange={setNewCompanyPlatformModel}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="provider-default">Modelo padr?o do provedor</SelectItem>
                            {(AI_PROVIDER_MODEL_OPTIONS[newCompanyPlatformProvider] || []).map((item) => (
                              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={addCompanyAgentPlatform}>Adicionar Plataforma</Button>
                      </div>

                      <div className="space-y-3">
                        {(companyAiProviderConfig.companyAgentPlatforms || []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nenhuma plataforma cadastrada.</p>
                        ) : (
                          (companyAiProviderConfig.companyAgentPlatforms || []).map((platform) => (
                            <div key={platform.id} className="rounded-lg border p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold">{platform.name}</p>
                                <Badge variant={platform.isActive ? 'default' : 'outline'} className="text-[10px]">
                                  {platform.isActive ? 'ATIVA' : 'INATIVA'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input
                                  value={platform.name}
                                  onChange={(e) =>
                                    setCompanyAiProviderConfig((prev) => ({
                                      ...prev,
                                      companyAgentPlatforms: (prev.companyAgentPlatforms || []).map((item) =>
                                        item.id === platform.id ? { ...item, name: e.target.value } : item
                                      ),
                                    }))
                                  }
                                />
                                <Select
                                  value={platform.provider}
                                  onValueChange={(value) =>
                                    setCompanyAiProviderConfig((prev) => ({
                                      ...prev,
                                      companyAgentPlatforms: (prev.companyAgentPlatforms || []).map((item) =>
                                        item.id === platform.id ? { ...item, provider: value as AIProvider, model: '', modelSource: 'provider-default' } : item
                                      ),
                                    }))
                                  }
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                                    <SelectItem value="groq">Groq</SelectItem>
                                    <SelectItem value="gemini">Gemini</SelectItem>
                                    <SelectItem value="claude">Claude</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="password"
                                  value={platform.apiKey}
                                  placeholder="API Key"
                                  onChange={(e) =>
                                    setCompanyAiProviderConfig((prev) => ({
                                      ...prev,
                                      companyAgentPlatforms: (prev.companyAgentPlatforms || []).map((item) =>
                                        item.id === platform.id ? { ...item, apiKey: e.target.value } : item
                                      ),
                                    }))
                                  }
                                  autoComplete="off"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Select
                                  value={platform.modelSource === 'preset' ? (platform.model || 'provider-default') : 'provider-default'}
                                  onValueChange={(value) =>
                                    setCompanyAiProviderConfig((prev) => ({
                                      ...prev,
                                      companyAgentPlatforms: (prev.companyAgentPlatforms || []).map((item) =>
                                        item.id === platform.id
                                          ? {
                                              ...item,
                                              modelSource: value === 'provider-default' ? 'provider-default' : 'preset',
                                              model: value === 'provider-default' ? '' : value,
                                            }
                                          : item
                                      ),
                                    }))
                                  }
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="provider-default">Modelo padr?o do provedor</SelectItem>
                                    {(AI_PROVIDER_MODEL_OPTIONS[platform.provider] || []).map((item) => (
                                      <SelectItem key={platform.id + '-' + item.value} value={item.value}>{item.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                  <Button variant={platform.isActive ? 'default' : 'outline'} className="flex-1" onClick={() => setActiveCompanyAgentPlatform(platform.id)}>
                                    {platform.isActive ? 'Plataforma Ativa' : 'Ativar'}
                                  </Button>
                                  <Button variant="ghost" className="text-rose-500" onClick={() => removeCompanyAgentPlatform(platform.id)}>
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="rounded-md border border-dashed p-2 text-xs text-muted-foreground">
                        Ao ativar uma plataforma, ela passa a valer para todos os t?cnicos da empresa.
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={saveCompanyAiConfig} disabled={isSavingCompanyAiProviderConfig} className="gap-2">
                          {isSavingCompanyAiProviderConfig && <RefreshCw className="w-4 h-4 animate-spin" />}
                          Salvar IA da Empresa
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                                        { id: 'assistente-contador', label: 'Assistente Contador' },
                                        { id: 'migracao', label: 'Assistente de Migração' },
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
  onNavigate,
  holidayCalendar,
}: { 
  allOrders: ServiceOrder[], 
  tasks: any[], 
  onViewOS: (id: string) => void,
  onNavigate: (tab: string) => void,
  holidayCalendar: HolidayCalendarCache,
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
  const holidayLookup = useMemo(() => {
    const map = new Map<string, HolidayApiItem>();
    Object.values(holidayCalendar || {}).forEach((yearCache) => {
      (yearCache?.holidays || []).forEach((item) => {
        if (item?.date) map.set(item.date, item);
      });
    });
    return map;
  }, [holidayCalendar]);

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

    const holidayKey = format(day, 'yyyy-MM-dd');
    const holiday = holidayLookup.get(holidayKey);
    if (holiday) {
      dayEvents.push({
        id: `holiday-${holiday.date}`,
        title: holiday.name,
        type: 'holiday',
        color: 'bg-rose-600',
        time: 'Feriado',
      });
    }

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
              const holidayEvent = dayEvents.find((e) => e.type === 'holiday');

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
                    {holidayEvent && (
                      <div className="px-1.5 py-0.5 text-[9px] font-black bg-rose-100 text-rose-700 rounded-sm truncate">
                        Feriado: {holidayEvent.title}
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
                        event.type === 'diagnosis' ? "bg-amber-50 border-amber-100" :
                        event.type === 'holiday' ? "bg-rose-50 border-rose-100 cursor-default" :
                        "bg-emerald-50 border-emerald-100"
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

function SupplierView({
  suppliers,
  setSuppliers,
  activeCompanyId,
}: {
  suppliers: Supplier[],
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>,
  activeCompanyId: string,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const companySuppliers = suppliers.filter((supplier) => supplier.companyId === activeCompanyId);

  const filtered = companySuppliers.filter(s => 
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
          <DialogContent className="max-w-3xl">
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
                setSuppliers(prev => [...prev, { id: Math.random().toString(), ...data, companyId: activeCompanyId } as any]);
                toast.success('Fornecedor cadastrado!');
              }
              setIsDialogOpen(false);
            }} className="grid gap-4 py-4">
              <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
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
                    <div className="font-bold flex items-center flex-wrap gap-0.5">{s.name}{s.importedFromBackup && <BackupBadge />}</div>
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

function OSConferenceView({
  allOrders,
  setAllOrders,
}: {
  allOrders: ServiceOrder[];
  setAllOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
}) {
  const [activeTab, setActiveTab] = useState('os');
  const deliveredOrders = allOrders.filter((os) => os.status === 'Entregue');

  const handleFinalize = (id: string) => {
    setAllOrders((prev) =>
      prev.map((os) =>
        os.id === id
          ? { ...os, status: 'Finalizada' as OSStatus, updatedAt: new Date().toISOString() }
          : os
      )
    );
    toast.success('OS finalizada na conferencia.');
  };

  const handleFinanceInfo = (os: ServiceOrder) => {
    const paymentDate = os.paymentDate ? format(new Date(os.paymentDate), 'dd/MM/yyyy') : 'Nao informado';
    const paymentStatus = os.paymentStatus || 'Pendente';
    toast.info(`Pagamento: ${paymentDate}`, {
      description: `Status: ${paymentStatus}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conferencia O.S</h1>
        <p className="text-muted-foreground">Conferencia de ordem de servico, pedido de compra e pedido de orcamento.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="os">Ordens de Servico</TabsTrigger>
          <TabsTrigger value="compras">Pedido de Compra</TabsTrigger>
          <TabsTrigger value="orcamentos">Pedido de Orcamento</TabsTrigger>
        </TabsList>

        <TabsContent value="os" className="space-y-4">
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold">OS</th>
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Equipamento</th>
                    <th className="px-6 py-4 font-semibold">Entregue em</th>
                    <th className="px-6 py-4 font-semibold">Pagamento</th>
                    <th className="px-6 py-4 font-semibold text-center">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deliveredOrders.length > 0 ? (
                    deliveredOrders.map((os) => (
                      <tr key={os.id} className="hover:bg-secondary/20 transition-all">
                        <td className="px-6 py-4 font-bold text-primary">{os.number}</td>
                        <td className="px-6 py-4">{os.customerName}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span>{os.equipment}</span>
                            <span className="text-xs text-muted-foreground">{os.brand} {os.model}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {os.updatedAt ? format(new Date(os.updatedAt), 'dd/MM/yyyy') : '-'}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {os.paymentDate ? format(new Date(os.paymentDate), 'dd/MM/yyyy') : 'Nao informado'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleFinanceInfo(os)}>
                              <Banknote className="w-4 h-4" /> Financeiro
                            </Button>
                            <Button size="sm" className="gap-2" onClick={() => handleFinalize(os.id)}>
                              <CheckCircle2 className="w-4 h-4" /> Finalizar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                        Nenhuma OS com status Entregue aguardando conferencia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="compras">
          <Card className="border-none shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum pedido de compra em conferencia no momento.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orcamentos">
          <Card className="border-none shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum pedido de orcamento em conferencia no momento.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DynamicPrintView({
  template,
  data,
  company,
  customer,
  onClose,
}: {
  template: PrintTemplate;
  data: ServiceOrder;
  company: Company;
  customer?: Customer | null;
  onClose: () => void;
}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const stageRef = useRef<any>(null);
  const [printImage, setPrintImage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const MM_TO_PT = 2.83465;
  const BASE_SCALE = 3.78;
  const mmStrokeToCanvasPx = (strokeMm: number) => Math.max(0.25, strokeMm * BASE_SCALE);
  const lineDashByStyle = (style?: TemplateElement['lineStyle']) => {
    if (style === 'dashed') return [12, 8];
    if (style === 'dotted') return [2, 8];
    return undefined;
  };

  const resolvedTemplate = useMemo(() => {
    const density = Math.min(2.5, Math.max(0.5, template.density || 1));
    return {
      ...template,
      orientation: template.orientation || 'vertical',
      labelRows: Math.max(1, template.labelRows || 1),
      labelColumns: Math.max(1, template.labelColumns || 1),
      gapX: Math.max(0, template.gapX || 0),
      gapY: Math.max(0, template.gapY || 0),
      density,
      shape: template.shape || 'rectangle',
      cornerRadius: Math.max(1, template.cornerRadius || 4),
      showBorder: template.showBorder ?? false,
      borderStyle: template.borderStyle || 'solid',
      borderThickness: Math.max(0.1, template.borderThickness || 0.5),
    };
  }, [template]);

  const orientation = resolvedTemplate.orientation || 'vertical';
  const density = Math.min(2.5, Math.max(0.5, resolvedTemplate.density || 1));
  const totalWidthMm = orientation === 'horizontal' ? resolvedTemplate.height : resolvedTemplate.width;
  const labelHeightMm = orientation === 'horizontal' ? resolvedTemplate.width : resolvedTemplate.height;
  const maxGapX = resolvedTemplate.labelColumns > 1
    ? Math.max(0, (totalWidthMm - (resolvedTemplate.labelColumns * 5)) / (resolvedTemplate.labelColumns - 1))
    : 0;
  const effectiveGapX = resolvedTemplate.labelColumns > 1
    ? Math.min((resolvedTemplate.gapX || 0) / density, maxGapX)
    : 0;
  const effectiveGapY = (resolvedTemplate.gapY || 0) / density;
  const labelWidthMm = Math.max(
    5,
    (totalWidthMm - (effectiveGapX * (resolvedTemplate.labelColumns - 1))) / resolvedTemplate.labelColumns
  );
  const sheetWidthMm = totalWidthMm;
  const sheetHeightMm = (labelHeightMm * resolvedTemplate.labelRows) + (effectiveGapY * (resolvedTemplate.labelRows - 1));
  const stageWidthPx = sheetWidthMm * BASE_SCALE;
  const stageHeightPx = sheetHeightMm * BASE_SCALE;
  const printCells = Array.from({ length: resolvedTemplate.labelRows * resolvedTemplate.labelColumns }, (_, index) => {
    const row = Math.floor(index / resolvedTemplate.labelColumns);
    const col = index % resolvedTemplate.labelColumns;
    return {
      id: `${row}-${col}`,
      top: (row * labelHeightMm) + (row * effectiveGapY),
      left: (col * labelWidthMm) + (col * effectiveGapX),
    };
  });

  const getPrintableImage = () => {
    const stage = stageRef.current;
    if (!stage) return '';
    return stage.toDataURL({ pixelRatio: 4, mimeType: 'image/png' });
  };

  const labelBorder = resolvedTemplate.showBorder
    ? `${resolvedTemplate.borderThickness}mm ${resolvedTemplate.borderStyle === 'double' ? 'double' : resolvedTemplate.borderStyle} #111`
    : 'none';

  const labelShapeStyle: React.CSSProperties = {
    border: labelBorder,
    borderRadius: resolvedTemplate.shape === 'rounded' ? `${resolvedTemplate.cornerRadius}mm` : resolvedTemplate.shape === 'ellipse' ? '50%' : undefined,
    clipPath: resolvedTemplate.shape === 'ellipse' ? 'ellipse(50% 50% at 50% 50%)' : undefined,
    overflow: 'hidden',
  };

  const pageOrientation = sheetWidthMm > sheetHeightMm ? 'landscape' : 'portrait';
  const printGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${resolvedTemplate.labelColumns}, ${labelWidthMm}mm)`,
    columnGap: `${effectiveGapX}mm`,
    rowGap: `${effectiveGapY}mm`,
    width: 'fit-content',
    margin: '0 auto',
    justifyContent: 'center',
    alignContent: 'start',
  };

  const getFittedFontSizePt = (content: string, baseFontSize: number, widthMm: number, heightMm: number) => {
    const safeContent = (content || ' ').trim() || ' ';
    const lines = safeContent.split('\n');
    const longestLine = lines.reduce((longest, line) => Math.max(longest, line.length), 1);
    const widthBasedPt = (Math.max(5, widthMm) * MM_TO_PT) / (Math.max(1, longestLine) * 0.52);
    const heightBasedPt = (Math.max(4, heightMm) * MM_TO_PT * 0.84) / Math.max(1, lines.length);
    return Math.max(4, Math.min(baseFontSize, widthBasedPt, heightBasedPt));
  };

  useEffect(() => {
    const updateScale = () => {
      const hostWidth = previewHostRef.current?.clientWidth || 0;
      const hostHeight = previewHostRef.current?.clientHeight || 0;
      if (!hostWidth || !hostHeight) return;

      const sheetWidthPx = sheetWidthMm * (96 / 25.4);
      const sheetHeightPx = sheetHeightMm * (96 / 25.4);
      const scaleX = (hostWidth - 24) / sheetWidthPx;
      const scaleY = (hostHeight - 24) / sheetHeightPx;
      setPreviewScale(Math.min(1, Math.max(0.3, Math.min(scaleX, scaleY))));
    };

    updateScale();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScale) : null;
    if (previewHostRef.current && observer) {
      observer.observe(previewHostRef.current);
    }
    window.addEventListener('resize', updateScale);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [sheetHeightMm, sheetWidthMm]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const timer = window.setTimeout(() => {
      const image = getPrintableImage();
      if (image) {
        setPrintImage(image);
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [isClient, sheetHeightMm, sheetWidthMm, data, customer, resolvedTemplate]);

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
      '{{customer_phone}}': customer?.phone || (customer as any)?.phone2 || '',
      '{{company_name}}': company.name || company.razaoSocial || 'TechManager Assistência',
      '{{company_phone}}': company.phone || '',
    };

    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value);
    });
    return result;
  };

  const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const renderPrintElementHtml = (cellId: string, el: TemplateElement) => {
    const displayContent = el.type === 'variable' ? replaceVariables(el.content) : el.content;
    const fittedFontSize = getFittedFontSizePt(
      displayContent,
      el.fontSize || 12,
      el.width || 45,
      el.height || 8
    );
    const fontSizeMm = fittedFontSize / MM_TO_PT;

    if (el.type === 'line') {
      return `
        <div
          style="
            position:absolute;
            left:${el.x}mm;
            top:${el.y}mm;
            width:${el.width || 45}mm;
            height:0;
            border-top:${Math.max(0.2, el.strokeWidth || 0.6)}mm ${el.lineStyle || 'solid'} #111;
          "
          data-element-id="${escapeHtml(`${cellId}-${el.id}`)}"
        ></div>
      `;
    }

    if (el.type === 'qr' || el.type === 'barcode') {
      return `
        <div
          style="
            position:absolute;
            left:${el.x}mm;
            top:${el.y}mm;
            width:${el.width || 45}mm;
            height:${el.height || 8}mm;
            border:1px solid #111;
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
            background:#eee;
            font-size:8pt;
            text-transform:uppercase;
            overflow:hidden;
          "
          data-element-id="${escapeHtml(`${cellId}-${el.id}`)}"
        >
          <div style="font-weight:700; letter-spacing:0.04em;">${escapeHtml(el.type)}</div>
        </div>
      `;
    }

    return `
      <div
        style="
          position:absolute;
          left:${el.x}mm;
          top:${el.y}mm;
          width:${el.width ? `${el.width}mm` : 'auto'};
          height:${el.height ? `${el.height}mm` : 'auto'};
          display:flex;
          align-items:${(el.wrapMode || 'wrap') === 'single-line' ? 'center' : 'flex-start'};
          line-height:1;
          font-size:${fontSizeMm}mm;
          line-height:${fontSizeMm}mm;
          font-weight:${el.fontWeight === 'bold' ? 700 : 400};
          text-align:${el.textAlign || 'left'};
          font-family: Arial, sans-serif;
          white-space:${(el.wrapMode || 'wrap') === 'single-line' ? 'nowrap' : 'pre-wrap'};
          overflow-wrap:${(el.wrapMode || 'wrap') === 'single-line' ? 'normal' : 'anywhere'};
          word-break:${(el.wrapMode || 'wrap') === 'single-line' ? 'normal' : 'break-word'};
          overflow:hidden;
          text-overflow:${(el.wrapMode || 'wrap') === 'single-line' ? 'ellipsis' : 'clip'};
        "
        data-element-id="${escapeHtml(`${cellId}-${el.id}`)}"
      >${escapeHtml(displayContent).replace(/\n/g, '<br />')}</div>
    `;
  };

  const buildPrintDocumentHtml = () => {
    const image = printImage || getPrintableImage();
    if (!image) return '';

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Impressao de Etiqueta</title>
          <style>
            @page {
              size: ${sheetWidthMm}mm ${sheetHeightMm}mm;
              margin: 0mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html {
              width: ${sheetWidthMm}mm;
              height: ${sheetHeightMm}mm;
              max-height: ${sheetHeightMm}mm;
              overflow: hidden;
            }
            body {
              width: ${sheetWidthMm}mm;
              height: ${sheetHeightMm}mm;
              max-height: ${sheetHeightMm}mm;
              overflow: hidden;
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: Arial, sans-serif;
              color: #111;
              page-break-after: avoid;
              break-after: avoid;
            }
            .print-image {
              display: block;
              width: ${sheetWidthMm}mm;
              height: ${sheetHeightMm}mm;
              object-fit: fill;
            }
          </style>
        </head>
        <body>
          <img class="print-image" src="${image}" alt="Etiqueta" />
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    setIsPrinting(true);
    const printHtml = buildPrintDocumentHtml();
    const started = printHtml ? printHtmlUsingHiddenFrame(printHtml) : false;
    if (!started) {
      toast.error('Nao foi possivel iniciar a impressao nativa do navegador.');
    }

    // UI feedback timeout to avoid indefinite loading state.
    setTimeout(() => setIsPrinting(false), 1200);
  };

  return (
    <Dialog open={!!template} onOpenChange={() => onClose()}>
      <DialogContent className="w-[98vw] max-w-[1200px] max-h-[98vh] p-0 border-none bg-transparent shadow-none overflow-hidden">
        <div className="flex flex-col gap-4 p-4">
          <div ref={previewHostRef} className="max-h-[calc(98vh-100px)] overflow-auto rounded-lg bg-slate-100/60 p-3">
            <div
              className="mx-auto"
              style={{
                width: `${sheetWidthMm * previewScale}mm`,
                height: `${sheetHeightMm * previewScale}mm`,
                minWidth: `${sheetWidthMm * previewScale}mm`,
              }}
            >
              {printImage ? (
                <img
                  src={printImage}
                  alt="Preview da etiqueta"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',
                    display: 'block',
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  Gerando preview...
                </div>
              )}
            </div>
          </div>
          {isClient && (
            <div className="sr-only">
              <Stage ref={stageRef} width={stageWidthPx} height={stageHeightPx}>
                <Layer>
                  {printCells.map((cell) => {
                    const offsetX = cell.left * BASE_SCALE;
                    const offsetY = cell.top * BASE_SCALE;
                    return (
                      <KonvaGroup key={cell.id} x={offsetX} y={offsetY}>
                        {resolvedTemplate.showBorder && (
                          <KonvaRect
                            x={0}
                            y={0}
                            width={labelWidthMm * BASE_SCALE}
                            height={labelHeightMm * BASE_SCALE}
                            cornerRadius={resolvedTemplate.shape === 'rounded' ? resolvedTemplate.cornerRadius * BASE_SCALE : 0}
                            stroke="#111"
                            strokeWidth={mmStrokeToCanvasPx(resolvedTemplate.borderThickness || 0.5)}
                            dash={lineDashByStyle(resolvedTemplate.borderStyle)}
                          />
                        )}
                        {resolvedTemplate.shape === 'ellipse' && (
                          <KonvaEllipse
                            x={(labelWidthMm * BASE_SCALE) / 2}
                            y={(labelHeightMm * BASE_SCALE) / 2}
                            radiusX={(labelWidthMm * BASE_SCALE) / 2}
                            radiusY={(labelHeightMm * BASE_SCALE) / 2}
                            stroke="#111"
                            strokeWidth={mmStrokeToCanvasPx(resolvedTemplate.borderThickness || 0.5)}
                          />
                        )}
                        {resolvedTemplate.elements.map((el) => {
                          const displayContent = el.type === 'variable' ? replaceVariables(el.content) : el.content;
                          const fittedFontSize = getFittedFontSizePt(
                            displayContent,
                            el.fontSize || 12,
                            el.width || 45,
                            el.height || 8
                          );
                          const fontSizePx = fittedFontSize * (96 / 72);

                          if (el.type === 'line') {
                            const lineStroke = mmStrokeToCanvasPx(el.strokeWidth || 0.6);
                            const widthPx = (el.width || 45) * BASE_SCALE;
                            if (el.lineStyle === 'double') {
                              return (
                                <KonvaGroup key={`${cell.id}-${el.id}`} x={el.x * BASE_SCALE} y={el.y * BASE_SCALE}>
                                  <KonvaLine
                                    points={[0, -lineStroke, widthPx, -lineStroke]}
                                    stroke="#111"
                                    strokeWidth={lineStroke}
                                  />
                                  <KonvaLine
                                    points={[0, lineStroke, widthPx, lineStroke]}
                                    stroke="#111"
                                    strokeWidth={lineStroke}
                                  />
                                </KonvaGroup>
                              );
                            }

                            return (
                              <KonvaLine
                                key={`${cell.id}-${el.id}`}
                                points={[
                                  el.x * BASE_SCALE,
                                  el.y * BASE_SCALE,
                                  (el.x + (el.width || 45)) * BASE_SCALE,
                                  el.y * BASE_SCALE,
                                ]}
                                stroke="#111"
                                strokeWidth={lineStroke}
                                dash={lineDashByStyle(el.lineStyle)}
                              />
                            );
                          }

                          if (el.type === 'qr' || el.type === 'barcode') {
                            const widthPx = (el.width || 12) * BASE_SCALE;
                            const heightPx = (el.height || 12) * BASE_SCALE;
                            return (
                              <KonvaGroup key={`${cell.id}-${el.id}`} x={el.x * BASE_SCALE} y={el.y * BASE_SCALE}>
                                <KonvaRect
                                  width={widthPx}
                                  height={heightPx}
                                  fill="#f3f4f6"
                                  stroke="#111"
                                  strokeWidth={1}
                                />
                                <KonvaText
                                  text={el.type.toUpperCase()}
                                  width={widthPx}
                                  height={heightPx}
                                  align="center"
                                  verticalAlign="middle"
                                  fontSize={10}
                                  fontFamily="Arial"
                                />
                              </KonvaGroup>
                            );
                          }

                          return (
                            <KonvaText
                              key={`${cell.id}-${el.id}`}
                              text={displayContent}
                              x={el.x * BASE_SCALE}
                              y={el.y * BASE_SCALE}
                              width={(el.width || 45) * BASE_SCALE}
                              height={(el.height || 8) * BASE_SCALE}
                              align={el.textAlign || 'left'}
                              verticalAlign={(el.wrapMode || 'wrap') === 'single-line' ? 'middle' : 'top'}
                              wrap={(el.wrapMode || 'wrap') === 'single-line' ? 'none' : 'char'}
                              ellipsis={(el.wrapMode || 'wrap') === 'single-line'}
                              fontSize={fontSizePx}
                              fontStyle={el.fontWeight === 'bold' ? 'bold' : 'normal'}
                              fontFamily="Arial"
                            />
                          );
                        })}
                      </KonvaGroup>
                    );
                  })}
                </Layer>
              </Stage>
            </div>
          )}
          <div className="flex gap-2 print:hidden bg-white/10 p-2 rounded-lg backdrop-blur-md">
            <Button variant="outline" className="bg-white" onClick={onClose}>Fechar</Button>
            <Button className="gap-2" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Imprimir Agora
            </Button>
          </div>
        </div>

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
      width: type === 'Etiqueta' ? 80 : 80,
      height: type === 'Etiqueta' ? 25 : 200,
      elements: [],
      orientation: 'vertical',
      labelRows: 1,
      labelColumns: type === 'Etiqueta' ? 2 : 1,
      gapX: 0,
      gapY: 0,
      density: 1,
      shape: 'rectangle',
      cornerRadius: 4,
      showBorder: false,
      borderStyle: 'solid',
      borderThickness: 0.5,
      companyId: '1',
      isDefault: false,
    };
    setEditingTemplate(newTemplate);
  };

  const handleSave = (template: PrintTemplate) => {
    const exists = templates.find(t => t.id === template.id);
    if (exists) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      // If it's the first of its type, auto-set as default
      const sameType = templates.filter(t => t.type === template.type);
      setTemplates([...templates, { ...template, isDefault: sameType.length === 0 }]);
    }
    setEditingTemplate(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este layout?')) {
      const removed = templates.find(t => t.id === id);
      let updated = templates.filter(t => t.id !== id);
      // If deleted was default, promote the first remaining of that type to default
      if (removed?.isDefault) {
        const firstOfType = updated.find(t => t.type === removed.type);
        if (firstOfType) {
          updated = updated.map(t => t.id === firstOfType.id ? { ...t, isDefault: true } : t);
        }
      }
      setTemplates(updated);
      toast.success('Layout excluído com sucesso!');
    }
  };

  const handleSetDefault = (id: string, type: PrintTemplate['type']) => {
    // Only one default per type
    setTemplates(templates.map(t => t.type === type ? { ...t, isDefault: t.id === id } : t));
    toast.success('Layout definido como padrão para impressão!');
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

  const labelTemplates = templates.filter(t => t.type === 'Etiqueta');
  const cupomTemplates = templates.filter(t => t.type === 'Cupom');

  const renderSection = (
    title: string,
    description: string,
    icon: React.ReactNode,
    sectionTemplates: PrintTemplate[],
    type: PrintTemplate['type'],
    accentColor: string,
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', accentColor)}>
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleCreate(type)}>
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

      {sectionTemplates.length === 0 ? (
        <div className="py-10 bg-white rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <PrinterIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Nenhum layout de {title.toLowerCase()}</p>
            <p className="text-xs text-muted-foreground">Clique em "Novo" para criar o primeiro layout.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sectionTemplates.map(t => (
            <Card
              key={t.id}
              className={cn(
                'group transition-all overflow-hidden border shadow-sm relative',
                t.isDefault ? 'border-primary ring-2 ring-primary/20' : 'border-secondary/60 hover:border-primary/30'
              )}
            >
              {t.isDefault && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-lg" />
              )}
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={t.isDefault ? 'default' : 'secondary'} className="text-[10px]">
                      {t.type}
                    </Badge>
                    {t.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Padrão
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingTemplate(t)} title="Editar">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" onClick={() => handleDelete(t.id)} title="Excluir">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base mt-1">{t.name}</CardTitle>
                <CardDescription className="text-xs">{t.width}mm × {t.height}mm · {t.elements.length} elementos</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="h-24 bg-secondary/20 rounded-lg flex items-center justify-center border-2 border-dashed border-secondary">
                  <Layout className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-primary text-xs h-8"
                    onClick={() => setEditingTemplate(t)}
                  >
                    <Edit className="w-3 h-3 mr-1" /> Editar
                  </Button>
                  {!t.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => handleSetDefault(t.id, t.type)}
                    >
                      <Star className="w-3 h-3 mr-1" /> Definir Padrão
                    </Button>
                  )}
                  {t.isDefault && (
                    <div className="flex-1 flex items-center justify-center text-[11px] text-primary font-semibold gap-1">
                      <Star className="w-3 h-3 fill-primary" /> Padrão ativo
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalização de Impressão</h1>
          <p className="text-muted-foreground">Crie layouts personalizados. Defina um padrão por tipo — ele será usado automaticamente ao imprimir.</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 text-sm text-amber-800">
        <Star className="w-4 h-4 shrink-0 mt-0.5 fill-amber-500 text-amber-500" />
        <p>O layout marcado como <strong>Padrão</strong> é selecionado automaticamente ao imprimir etiquetas de entrada e cupons nas Ordens de Serviço. Somente um padrão por tipo é permitido.</p>
      </div>

      {renderSection(
        'Etiquetas',
        'Etiquetas de entrada de equipamento (60×40, 80×25 etc.)',
        <Tags className="w-4 h-4 text-blue-600" />,
        labelTemplates,
        'Etiqueta',
        'bg-blue-100',
      )}

      <div className="border-t" />

      {renderSection(
        'Cupom Térmico',
        'Comprovantes e recibos em papel térmico (80mm)',
        <Receipt className="w-4 h-4 text-purple-600" />,
        cupomTemplates,
        'Cupom',
        'bg-purple-100',
      )}
    </div>
  );
}



