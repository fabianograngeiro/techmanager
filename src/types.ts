export type UserRole = 'ADMIN-SAAS' | 'ADMIN-USER' | 'USUARIO';
export type Privilege = 'Completo' | 'Profissional';

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
  width?: number;
  height?: number;
  rotation?: number;
}

export interface PrintTemplate {
  id: string;
  name: string;
  type: 'Etiqueta' | 'Cupom' | 'A4';
  width: number; // mm
  height: number; // mm
  elements: TemplateElement[];
  companyId: string;
}
