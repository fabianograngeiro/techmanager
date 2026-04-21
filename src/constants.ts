import { ServiceOrder, OSStatus } from './types';

export const MOCK_OS: ServiceOrder[] = [];

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
