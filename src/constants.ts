import { ServiceOrder, OSStatus } from './types';

export const MOCK_OS: ServiceOrder[] = [
  {
    id: '1',
    number: 'OS-2024-001',
    customerId: 'cust-1',
    customerName: 'João Silva',
    equipment: 'iPhone 13',
    brand: 'Apple',
    model: '13 Pro',
    serialNumber: 'SN123456',
    defect: 'Tela quebrada',
    status: 'Aberta',
    priority: 'Alta',
    value: 450.00,
    items: [
      { id: '1', description: 'Tela iPhone 13 Original', quantity: 1, unitPrice: 350.00, totalPrice: 350.00, type: 'Produto' },
      { id: '2', description: 'Mão de obra troca de tela', quantity: 1, unitPrice: 100.00, totalPrice: 100.00, type: 'Serviço' }
    ],
    diagnosisDeadline: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    completionDeadline: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'Pendente',
    technicianId: '2',
    technicianName: 'Técnico João',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 'comp-1'
  },
  {
    id: '2',
    number: 'OS-2024-002',
    customerId: 'cust-2',
    customerName: 'Maria Oliveira',
    equipment: 'Impressora L3250',
    brand: 'Epson',
    model: 'EcoTank',
    serialNumber: 'EPS-9988',
    defect: 'Não puxa papel',
    status: 'Em reparo',
    priority: 'Média',
    value: 180.00,
    diagnosisDeadline: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday (Overdue)
    completionDeadline: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'Pago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 'comp-1'
  },
  {
    id: '3',
    number: 'OS-2024-003',
    customerId: 'cust-3',
    customerName: 'Tech Solutions LTDA',
    equipment: 'Notebook Dell G15',
    brand: 'Dell',
    model: 'G15 5511',
    serialNumber: 'TAG-XYZ',
    defect: 'Superaquecimento',
    status: 'Em reparo',
    subStatus: 'Aguardando senha do sistema',
    priority: 'Alta',
    value: 250.00,
    diagnosisDeadline: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completionDeadline: new Date().toISOString(), // Today (Yellow/Red)
    paymentStatus: 'Pendente',
    technicianId: '2',
    technicianName: 'Técnico João',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 'comp-1'
  }
];

export const STATUS_COLUMNS: OSStatus[] = [
  'Aberta',
  'Em análise',
  'Aguardando aprovação',
  'Aguardando peça',
  'Em reparo',
  'Testes finais',
  'Pronta',
  'Entregue',
  'Finalizada',
  'Cancelada'
];
