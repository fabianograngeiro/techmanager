import {
  ServiceOrder,
  SupportAttachment,
  SupportSession,
  TechnicalLevel,
  TechnicalSector,
} from '../types';

export const TECHNICAL_LEVEL_REFERENCE: Record<
  Exclude<TechnicalSector, 'Outro'>,
  {
    title: string;
    levels: Record<TechnicalLevel, string>;
  }
> = {
  'Notebook-PC-AllinOne': {
    title: 'Tecnico de Notebook, PC Gamer e All-in-One',
    levels: {
      1: 'Preventiva e software: limpeza interna, pasta termica, formatacao, drivers e upgrades simples (RAM/SSD).',
      2: 'Hardware modular: telas, teclados, carcasas, dobradicas, wifi, cooler e montagem completa de PC Gamer.',
      3: 'Placa avancada: analise eletrica, micro solda, troca de DC jack, reballing/reflow e regravacao de BIOS.',
    },
  },
  'Celulares-Tablets': {
    title: 'Tecnico de Celulares e Tablets',
    levels: {
      1: 'Frontal e perifericos: modulo de tela, bateria, limpeza de conectores/alto-falante e pelicula.',
      2: 'Componentes internos: conector de carga, camera, flex de volume/power e carcaca traseira.',
      3: 'Micro reparos: jumper de trilha, banho quimico avancado, troca de CI e troca somente de vidro.',
    },
  },
  'Impressoras-Scanners': {
    title: 'Tecnico de Impressoras e Scanners',
    levels: {
      1: 'Operacional: drivers, rede/Wi-Fi, limpeza por software e troca de cartucho/toner.',
      2: 'Mecanica: roletes, almofada de tinta, unidade fusora e correias do scanner.',
      3: 'Eletronica e firmware: placa logica/fonte, reset de firmware e manutencao de bulk ink/tanque.',
    },
  },
  Televisores: {
    title: 'Tecnico de Televisores (LED, OLED, QLED)',
    levels: {
      1: 'Configuracao e acessorios: smart setup, atualizacao, suporte e conectividade.',
      2: 'Troca de barras de LED: diagnostico de som sem imagem e troca segura do kit LED.',
      3: 'Placa e painel: reparo em fonte/principal/T-CON, recuperacao de flat e diagnostico de painel.',
    },
  },
};

export const TECHNICAL_AI_SYSTEM_PROMPT = `
Voce e o Assistente Tecnico Multi-Setor da TechManager.

Objetivo:
- Apoiar tecnicos de diferentes setores de assistencia tecnica.
- Adaptar profundidade da resposta conforme setor e nivel tecnico detectado automaticamente.
- Encontrar defeito raiz e propor solucoes praticas do inicio da OS ate a entrega do equipamento.
- Entregar orientacao pratica, segura e objetiva com foco tecnico e comercial.

Regras:
1) Sempre use o contexto da Ordem de Servico (OS), cliente, equipamento, defeito e historico recente.
2) Sugira um ou mais agentes especialistas quando o caso exigir multidisciplinaridade.
3) Sempre considerar:
   - possibilidade de venda adicional (up-sell/cross-sell),
   - troca de peca,
   - peca/placa similar,
   - compatibilidade ou incompatibilidade tecnica.
4) Explique risco, custo estimado, tempo estimado e prioridade da intervencao.
5) Evite respostas genericas: usar linguagem de bancada.
6) Se faltar dado, perguntar de forma objetiva o minimo necessario.
7) Nao inventar laudo final sem teste.
8) Sempre incluir trilha de acompanhamento: entrada -> diagnostico -> aprovacao -> reparo -> testes -> entrega.
9) Sempre sugerir servico adicional quando fizer sentido, por exemplo limpeza preventiva por 7% do valor da OS.
10) Ler produtos, valores e saldo para sugerir pecas/servicos. Se nao houver item em estoque, sugerir compra.
11) Responder somente ao pedido atual do tecnico, sem repetir historico completo da conversa.
12) Quando recomendar peca, verificar compatibilidade com equipamento/modelo antes de sugerir compra.

Formato esperado:
- Diagnostico provavel
- Testes recomendados (curtos e ordenados)
- Pecas/placas candidatas e compatibilidade
- Sugestao comercial e oferta adicional
- Plano de acompanhamento ate entrega
- Proximo passo pratico
`.trim();

const AGENT_POOL: Record<Exclude<TechnicalSector, 'Outro'>, string[]> = {
  'Notebook-PC-AllinOne': ['Agente Placa Notebook', 'Agente Performance PC', 'Agente BIOS e Firmware'],
  'Celulares-Tablets': ['Agente Micro-Solda Mobile', 'Agente Carcaca e Modulo', 'Agente CI de Carga'],
  'Impressoras-Scanners': ['Agente Mecanica de Tracao', 'Agente Firmware Printer', 'Agente Bulk Ink'],
  Televisores: ['Agente Barras LED', 'Agente Fonte e T-CON', 'Agente Diagnostico de Painel'],
};

export function detectTechnicalSector(equipment: string): TechnicalSector {
  const normalized = equipment.toLowerCase();
  if (/(notebook|pc|computador|all[- ]?in[- ]?one|aio|desktop|gamer)/.test(normalized)) return 'Notebook-PC-AllinOne';
  if (/(iphone|celular|smartphone|tablet|ipad|android)/.test(normalized)) return 'Celulares-Tablets';
  if (/(impressora|scanner|multifuncional|toner|cartucho)/.test(normalized)) return 'Impressoras-Scanners';
  if (/(tv|televis|oled|qled|led)/.test(normalized)) return 'Televisores';
  return 'Outro';
}

export function getRecommendedAgents(sector: TechnicalSector, level: TechnicalLevel, defect: string): string[] {
  if (sector === 'Outro') return ['Agente Triagem Tecnica'];
  const pool = AGENT_POOL[sector];
  const defectText = defect.toLowerCase();
  const picks = new Set<string>();

  picks.add(pool[Math.min(level - 1, pool.length - 1)]);

  if (/(placa|curto|ci|bios|t-con|fonte|micro|solder|solda|trilha|firmware)/.test(defectText)) {
    picks.add(pool[pool.length - 1]);
  }
  if (/(tela|modulo|bateria|conector|carcaca|dobradica|teclado|led)/.test(defectText)) {
    picks.add(pool[1] || pool[0]);
  }

  return Array.from(picks);
}

export function inferTechnicalLevel(params: {
  defect: string;
  diagnosis?: string;
  equipment?: string;
}): TechnicalLevel {
  const defect = String(params.defect || '').toLowerCase();
  const diagnosis = String(params.diagnosis || '').toLowerCase();
  const equipment = String(params.equipment || '').toLowerCase();
  const text = `${defect} ${diagnosis} ${equipment}`;

  if (
    /(ci|bios|reball|reflow|curto|trilha|micro ?solda|t-con|fonte primar|bga|jumper|firmware avancad|placa mae)/.test(text)
  ) {
    return 3;
  }

  if (
    /(conector|troca de tela|modulo|dobradica|teclado|carcaca|camera|flat|led|fusora|rolete|bulk ink|placa secundaria)/.test(text)
  ) {
    return 2;
  }

  return 1;
}

export function buildTechnicalPrompt(params: {
  companyName: string;
  technicianName: string;
  os: ServiceOrder;
  sector: TechnicalSector;
  level: TechnicalLevel;
  userMessage: string;
  attachments?: SupportAttachment[];
  inventory?: Array<{
    name: string;
    sku?: string;
    price?: number;
    stock?: number;
  }>;
  compatibleInventory?: Array<{
    name: string;
    sku?: string;
    price?: number;
    stock?: number;
    compatibilityReason?: string;
  }>;
  webReferences?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
  shortHistory?: string;
}): string {
  const {
    companyName,
    technicianName,
    os,
    sector,
    level,
    userMessage,
    attachments = [],
    inventory = [],
    compatibleInventory = [],
    webReferences = [],
    shortHistory = 'Sem historico adicional.',
  } = params;
  const attachmentSummary = attachments.length
    ? attachments.map((a) => `${a.name} (${a.category}, ${Math.round(a.size / 1024)} KB)`).join('; ')
    : 'sem anexos';
  const inventorySummary = inventory.length
    ? inventory
        .slice(0, 20)
        .map((item) => {
          const stock = Number(item.stock || 0);
          const price = Number(item.price || 0);
          return `${item.name}${item.sku ? ` [${item.sku}]` : ''} | saldo: ${stock} | valor: R$ ${price.toFixed(2)}`;
        })
        .join('\n')
    : 'Sem dados de estoque compartilhados nesta solicitacao.';

  const compatibleInventorySummary = compatibleInventory.length
    ? compatibleInventory
        .slice(0, 12)
        .map((item) => {
          const stock = Number(item.stock || 0);
          const price = Number(item.price || 0);
          return `${item.name}${item.sku ? ` [${item.sku}]` : ''} | saldo: ${stock} | valor: R$ ${price.toFixed(2)} | motivo: ${item.compatibilityReason || 'compatibilidade por texto do modelo/equipamento'}`;
        })
        .join('\n')
    : 'Nenhuma peca compativel encontrada no estoque para esta solicitacao.';

  const webReferencesSummary = webReferences.length
    ? webReferences
        .slice(0, 8)
        .map((item, idx) => `${idx + 1}) ${item.title}\nURL: ${item.url}\nResumo: ${item.snippet || 'Sem resumo.'}`)
        .join('\n\n')
    : 'Sem referencias web nesta solicitacao.';

  const levelReference =
    sector !== 'Outro' ? TECHNICAL_LEVEL_REFERENCE[sector].levels[level] : 'Nivel tecnico geral.';

  return `
${TECHNICAL_AI_SYSTEM_PROMPT}

Contexto da empresa:
- Empresa: ${companyName}
- Tecnico solicitante: ${technicianName}

Contexto da O.S:
- Numero: ${os.number}
- Cliente: ${os.customerName}
- Equipamento: ${os.equipment} ${os.brand} ${os.model}
- Defeito informado: ${os.defect}
- Diagnostico atual: ${os.diagnosis || 'nao informado'}
- Status: ${os.status}
- Prioridade: ${os.priority}
- Valor da O.S.: R$ ${(Number(os.value || 0) || 0).toFixed(2)}
- Setor: ${sector}
- Nivel tecnico: ${level}
- Referencia de nivel: ${levelReference}
- Anexos: ${attachmentSummary}
- Historico curto recente: ${shortHistory}

Catalogo de produtos/pecas para oferta:
${inventorySummary}

Pecas compativeis detectadas no estoque:
${compatibleInventorySummary}

Referencias web atuais (somente quando necessario):
${webReferencesSummary}

Diretriz comercial obrigatoria:
- Sempre avaliar oferta de limpeza preventiva por 7% do valor da O.S. quando tecnicamente aplicavel.
- Se faltar peca em estoque, sugerir compra com justificativa tecnica e incluir link de referencia quando houver.

Diretriz de formato:
- Responda de forma objetiva apenas para o pedido atual, sem repetir historico completo.
- Se houver referencias web no contexto, use-as para responder de forma direta e evite resposta generica como "consulte o manual".

Solicitacao do tecnico:
${userMessage}
`.trim();
}

export function buildMockAgentResponse(params: {
  os: ServiceOrder;
  sector: TechnicalSector;
  level: TechnicalLevel;
  message: string;
  recommendedAgents: string[];
  attachments?: SupportAttachment[];
}): string {
  const { os, sector, level, message, recommendedAgents, attachments = [] } = params;
  const hasCompatibilityNeed = /(compativ|similar|placa|peca)/i.test(message) || attachments.length > 0;

  const sectorHint =
    sector === 'Outro'
      ? 'Fazer triagem tecnica inicial e separar hipoteses por risco.'
      : TECHNICAL_LEVEL_REFERENCE[sector].levels[level];

  return [
    `Agentes acionados: ${recommendedAgents.join(', ')}.`,
    `Diagnostico provavel para ${os.number}: validar primeiro alimentacao, comunicacao e componente critico do defeito relatado.`,
    `Passo tecnico (${sector}, nivel ${level}): ${sectorHint}`,
    hasCompatibilityNeed
      ? 'Compatibilidade: validar revisao de placa, conector, tensao nominal e pinagem antes de substituir por similar.'
      : 'Compatibilidade: manter check-list de part-number, revisao e firmware antes de fechar compra.',
    `Sugestao comercial: oferecer opcao de peca original x premium compatibilizada e limpeza preventiva por 7% (R$ ${(Number(os.value || 0) * 0.07).toFixed(2)}).`,
    'Acompanhamento: registrar entrada, diagnostico, aprovacao, reparo, testes e entrega no historico da O.S.',
    'Proximo passo: registrar testes executados na OS e retornar com foto/medicoes para segunda validacao.',
  ].join('\n');
}

export function getSupportExpiryDate(fromIso = new Date().toISOString()): string {
  const base = new Date(fromIso);
  base.setDate(base.getDate() + 15);
  return base.toISOString();
}

export function pruneSupportSessions(sessions: SupportSession[], validOsIds: Set<string>, now = new Date()): SupportSession[] {
  return sessions.filter((session) => {
    if (!validOsIds.has(session.osId)) return false;
    const expiresAt = new Date(session.expiresAt);
    return expiresAt.getTime() > now.getTime();
  });
}
