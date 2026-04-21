export type UserRole = 'ADMIN-SAAS' | 'ADMIN-USER' | 'USUARIO';
export type Privilege = 'Completo' | 'Profissional';
export type SubscriptionPlan = 'Basic' | 'Premium' | 'Enterprise';
export type AIProvider = 'openai' | 'groq' | 'gemini' | 'claude';
export type CompanyAIAssistantMode = 'saas-managed' | 'company-own';
export type AIAgentPromptArea =
  | 'suporte-tecnico'
  | 'ordem-servico'
  | 'atendimento'
  | 'financeiro'
  | 'vendas'
  | 'estoque';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  avatar?: string;
  privilege?: Privilege;
  allowedEquipmentIds?: string[]; // IDs dos tipos de equipamentos que este técnico pode assumir
  allowedTabs?: string[]; // IDs das telas/abas que este usuário pode acessar
}

export interface Company {
  id: string;
  name: string;
  subscriptionPlan?: SubscriptionPlan;
  razaoSocial?: string;
  cnpj: string;
  ie?: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  fiscalEnabled?: boolean;
  labelPrinterName?: string;
  a4PrinterName?: string;
  osCopiesPerPage?: 1 | 2;
  aiAssistantMode?: CompanyAIAssistantMode;
  aiSaasCatalogId?: string;
  aiProvider?: AIProvider;
  aiModel?: string;
  aiModelSource?: 'provider-default' | 'preset';
}

export type TechnicalSector =
  | 'Notebook-PC-AllinOne'
  | 'Celulares-Tablets'
  | 'Impressoras-Scanners'
  | 'Televisores'
  | 'Outro';

export type TechnicalLevel = 1 | 2 | 3;

export interface AIModelOption {
  value: string;
  label: string;
}

export interface AICatalogClient {
  id: string;
  companyId?: string;
  name: string;
}

export interface AIProviderCatalog {
  id: string;
  listName: string;
  provider: AIProvider;
  models: AIModelOption[];
  assignedClients?: AICatalogClient[];
  includedInPlan?: boolean;
  updatedAt?: string;
}

export interface AIAgentPromptTemplate {
  id: string;
  title: string;
  area: AIAgentPromptArea;
  prompt: string;
  isActive: boolean;
  plans: SubscriptionPlan[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyAgentPlatform {
  id: string;
  name: string;
  provider: AIProvider;
  apiKey: string;
  modelSource: 'provider-default' | 'preset';
  model?: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface AIProviderConfig {
  openaiApiKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  claudeApiKey?: string;
  providerCatalogs?: AIProviderCatalog[];
  agentPrompts?: AIAgentPromptTemplate[];
  companyAgentPlatforms?: CompanyAgentPlatform[];
  companyDefaultProvider?: AIProvider;
  companyDefaultModel?: string;
  companyModelSource?: 'provider-default' | 'preset';
  updatedAt?: string;
}

export interface SupportAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  category: 'image' | 'document';
}

export interface SupportMessage {
  id: string;
  role: 'technician' | 'agent';
  text: string;
  createdAt: string;
  agents?: string[];
  attachments?: SupportAttachment[];
}

export interface SupportSession {
  id: string;
  osId: string;
  osNumber: string;
  customerName: string;
  equipment: string;
  sector: TechnicalSector;
  level: TechnicalLevel;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  messages: SupportMessage[];
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  companyId: string;
}

export type OSStatus = 
  | 'Aberta' 
  | 'Em análise' 
  | 'Aguardando aprovação' 
  | 'Aguardando peça' 
  | 'Em reparo' 
  | 'Testes finais' 
  | 'Pronta' 
  | 'Entregue' 
  | 'Finalizada' 
  | 'Cancelada';

export interface OSItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'Produto' | 'Serviço';
}

export interface ServiceOrder {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  equipment: string;
  brand: string;
  model: string;
  serialNumber: string;
  defect: string;
  diagnosis?: string;
  diagnosisDate?: string;
  status: OSStatus;
  subStatus?: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  value: number;
  diagnosisDeadline?: string;
  completionDeadline?: string;
  paymentStatus?: 'Pendente' | 'Pago' | 'Parcial';
  paymentDate?: string;
  items?: OSItem[];
  serviceType?: 'Normal' | 'Garantia' | 'Retorno';
  isApproved?: boolean;
  accessories?: string;
  details?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  companyId: string;
  supplierId?: string;
  // Fiscal Fields
  ncm?: string;
  cest?: string;
  origin?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'; // 0: Nacional, etc.
  taxCategory?: string;
  cost?: number; // Valor de custo para cálculo de lucro
}

export interface Supplier {
  id: string;
  name: string;
  document: string; // CNPJ/CPF
  email: string;
  phone: string;
  address: string;
  contactName?: string;
  category?: string;
  companyId: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  category: string;
  status: 'PAID' | 'PENDING';
  companyId: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  defaultDiagnosisDays: number;
  defaultCompletionDays: number;
  companyId: string;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'variable' | 'barcode' | 'line' | 'qr';
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  width?: number;
  height?: number;
  strokeWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  rotation?: number;
}

export interface PrintTemplate {
  id: string;
  name: string;
  type: 'Etiqueta' | 'Cupom' | 'A4';
  width: number; // mm
  height: number; // mm
  showBorder?: boolean;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  borderThickness?: number;
  elements: TemplateElement[];
  companyId: string;
}
