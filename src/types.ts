export type UserRole = 'ADMIN-SAAS' | 'ADMIN-USER' | 'USUARIO';
export type Privilege = 'Completo' | 'Profissional';
export type SubscriptionPlan = 'Basic' | 'Premium' | 'Enterprise';
export type AIProvider = 'openai' | 'groq' | 'gemini' | 'claude';
export type CompanyAIAssistantMode = 'saas-managed' | 'company-own';
export type AIAgentPromptArea =
  | 'suporte-tecnico'
  | 'contador-fiscal'
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
  fiscalStrictModeEnabled?: boolean;
  fiscalUf?: string;
  fiscalActivitySector?: string;
  fiscalActivityCode?: string;
  fiscalActivitySearchTerm?: string;
  accountantAssistantEnabled?: boolean;
  accountantNotificationEnabled?: boolean;
  accountantReminderEnabled?: boolean;
  accountantReminderFrequencyDays?: number;
  accountantServices?: string[];
  labelPrinterName?: string;
  a4PrinterName?: string;
  osCopiesPerPage?: 1 | 2;
  notifyWhatsappOnOpen?: boolean;
  notifyBudgetReady?: boolean;
  pixKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA';
  pixKey?: string;
  businessHoursEnabled?: boolean;
  businessHoursWeekdays?: number[]; // 0=Dom, 1=Seg ... 6=Sab
  businessHoursStart?: string; // HH:mm
  businessHoursEnd?: string; // HH:mm
  businessHoursBreakStart?: string; // HH:mm
  businessHoursBreakEnd?: string; // HH:mm
  businessHoursBreakWeekdays?: number[]; // dias com intervalo ativo
  businessHoursSaturdayEnabled?: boolean;
  businessHoursSaturdayStart?: string; // HH:mm
  businessHoursSaturdayEnd?: string; // HH:mm
  businessHoursSundayEnabled?: boolean;
  businessHoursSundayStart?: string; // HH:mm
  businessHoursSundayEnd?: string; // HH:mm
  businessHoursHolidayClosed?: boolean;
  holidayWorkOverrides?: Record<string, {
    open: boolean;
    start: string;
    breakEnabled: boolean;
    breakStart: string;
    end: string;
  }>;
  waitingPartOptions?: Array<{
    id: string;
    institutionName: string;
    deadlineDays: number;
    purchaseType?: string;
  }>;
  aiAssistantMode?: CompanyAIAssistantMode;
  aiSaasCatalogId?: string;
  aiProvider?: AIProvider;
  aiModel?: string;
  aiModelSource?: 'provider-default' | 'preset';
  osStatuses?: OsStatusConfig[];
  defaultFallbackDiagnosisDays?: number;
  defaultFallbackCompletionDays?: number;
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
  ie?: string;
  email: string;
  phone: string;
  phone2?: string;
  address: string;
  addressStreet?: string;
  addressNumber?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  companyId: string;
  importedFromBackup?: boolean;
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
  | 'Cancelada'
  | 'Reprovado'
  | (string & {});

export interface OsStatusConfig {
  id: string;
  name: string;
  order: number;
}

export interface EquipmentDeadlineRule {
  id: string;
  serviceKeyword: string; // keyword to match in service description (case-insensitive)
  diagnosisHours?: number;
  diagnosisDays?: number;
  completionHours?: number;
  completionDays?: number;
  priority: number; // lower = higher priority
}

export interface OSItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'Produto' | 'Serviço';
  executionTimeValue?: number;
  executionTimeUnit?: 'Horas' | 'Dias';
}

export interface EquipmentBrandModel {
  brand: string;
  models: string[];
}

export interface EquipmentServiceDefinition {
  id: string;
  description: string;
  unitPrice?: number;
  executionTimeValue?: number;
  executionTimeUnit?: 'Horas' | 'Dias';
}

export interface ServiceOrder {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
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
  deliveredAt?: string;
  items?: OSItem[];
  serviceType?: 'Normal' | 'Garantia' | 'Retorno';
  isApproved?: boolean;
  accessories?: string;
  details?: string;
  observation?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  rejectionReason?: string;
  rejectionDate?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  importedFromBackup?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  image?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
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
  taxApiCode?: string;
  taxCategory?: string;
  fiscalCfop?: string;
  fiscalCstIcms?: string;
  fiscalCstPis?: string;
  fiscalCstCofins?: string;
  cost?: number; // Valor de custo para cálculo de lucro
  importedFromBackup?: boolean;
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
  importedFromBackup?: boolean;
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
  overloadFromQty?: number;
  overloadDiagnosisDays?: number;
  overloadCompletionDays?: number;
  chargeDiagnosisOnRejection?: boolean;
  diagnosisChargeValue?: number;
  deadlineRules?: EquipmentDeadlineRule[];
  brandModels?: EquipmentBrandModel[];
  services?: EquipmentServiceDefinition[];
  companyId: string;
}

export interface HolidayApiItem {
  date: string; // yyyy-MM-dd
  name: string;
  type: string;
}

export interface HolidayYearCache {
  fetchedAt: string;
  holidays: HolidayApiItem[];
}

export type HolidayCalendarCache = Record<string, HolidayYearCache>;

export interface TemplateElement {
  id: string;
  type: 'text' | 'variable' | 'barcode' | 'line' | 'qr';
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  wrapMode?: 'wrap' | 'single-line';
  width?: number;
  height?: number;
  rotation?: number;
  strokeWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
}

export interface PrintTemplate {
  id: string;
  name: string;
  type: 'Etiqueta' | 'Cupom' | 'A4';
  width: number; // mm
  height: number; // mm
  elements: TemplateElement[];
  orientation?: 'vertical' | 'horizontal';
  labelRows?: number;
  labelColumns?: number;
  gapX?: number; // mm
  gapY?: number; // mm
  density?: number; // 1 = normal, >1 = mais denso
  shape?: 'rectangle' | 'rounded' | 'ellipse';
  cornerRadius?: number; // mm
  showBorder?: boolean;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  borderThickness?: number; // mm
  companyId: string;
  isDefault?: boolean; // padrão para impressão automática (um por tipo)
}
