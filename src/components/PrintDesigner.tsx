import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Rect, Group, Line, Transformer, Ellipse } from 'react-konva';
import { PrintTemplate, TemplateElement } from '../types';
import { 
  Type, 
  Hash, 
  QrCode, 
  Minus, 
  Trash2, 
  Save, 
  ChevronLeft, 
  Plus,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize,
  Printer,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PrintDesignerProps {
  template: PrintTemplate;
  onSave: (template: PrintTemplate) => void;
  onCancel: () => void;
}

const SYSTEM_VARIABLES = [
  { id: '{{os_number}}', name: 'Numero da O.S.' },
  { id: '{{customer_name}}', name: 'Nome do Cliente' },
  { id: '{{customer_phone}}', name: 'Telefone do Cliente' },
  { id: '{{equipment}}', name: 'Equipamento' },
  { id: '{{brand}}', name: 'Marca' },
  { id: '{{model}}', name: 'Modelo' },
  { id: '{{serial_number}}', name: 'S/N' },
  { id: '{{problem}}', name: 'Problema' },
  { id: '{{os_date}}', name: 'Data de Entrada' },
  { id: '{{status}}', name: 'Status' },
  { id: '{{company_name}}', name: 'Nome da Empresa' },
  { id: '{{company_phone}}', name: 'Telefone Empresa' },
];

const TEST_VARIABLE_VALUES: Record<string, string> = {
  '{{os_number}}': 'OS-2026-015',
  '{{customer_name}}': 'Carlos Souza',
  '{{customer_phone}}': '(11) 99888-7766',
  '{{equipment}}': 'NOTEBOOK',
  '{{brand}}': 'LENOVO',
  '{{model}}': 'IDEAPAD 3',
  '{{serial_number}}': 'SN-ABC123456',
  '{{problem}}': 'NAO LIGA',
  '{{os_date}}': '21/04/2026',
  '{{status}}': 'Em analise',
  '{{company_name}}': 'TechManager Assistencia',
  '{{company_phone}}': '(11) 4002-8922',
};

const replaceVariableTokens = (content: string) => {
  let result = content;
  Object.entries(TEST_VARIABLE_VALUES).forEach(([token, value]) => {
    result = result.replace(new RegExp(token, 'g'), value);
  });
  return result;
};

const lineDashByStyle = (style?: TemplateElement['lineStyle']) => {
  if (style === 'dashed') return [12, 8];
  if (style === 'dotted') return [2, 8];
  return undefined;
};

const BASE_SCALE = 3.78;
const MM_TO_PT = 2.83465;
const MIN_CANVAS_STROKE_PX = 0.25;

const mmStrokeToCanvasPx = (strokeMm: number, scale: number) => (
  Math.max(MIN_CANVAS_STROKE_PX, strokeMm * scale)
);

const computeFitZoom = (labelWidthMm: number, labelHeightMm: number) => {
  if (typeof window === 'undefined') return 1.2;
  const availableWidth = Math.max(360, window.innerWidth - 760);
  const availableHeight = Math.max(260, window.innerHeight - 220);
  const zoomByWidth = availableWidth / (Math.max(1, labelWidthMm) * BASE_SCALE);
  const zoomByHeight = availableHeight / (Math.max(1, labelHeightMm) * BASE_SCALE);
  return Math.min(2.4, Math.max(0.35, Math.min(zoomByWidth, zoomByHeight)));
};

const getFittedFontSizePt = ({
  content,
  baseFontSize,
  widthMm,
  heightMm,
}: {
  content: string;
  baseFontSize: number;
  widthMm: number;
  heightMm: number;
}) => {
  const safeContent = (content || ' ').trim() || ' ';
  const lines = safeContent.split('\n');
  const heightBasedPt = (Math.max(4, heightMm) * MM_TO_PT * 0.84) / Math.max(1, lines.length);
  return Math.max(4, Math.min(baseFontSize, heightBasedPt));
};

const clampElementToCanvas = (element: TemplateElement, canvasWidthMm: number, canvasHeightMm: number): TemplateElement => {
  const safeCanvasWidth = Math.max(10, canvasWidthMm);
  const safeCanvasHeight = Math.max(10, canvasHeightMm);

  if (element.type === 'line') {
    const width = Math.max(1, Math.min(element.width || 50, safeCanvasWidth));
    const x = Math.max(0, Math.min(element.x, safeCanvasWidth - width));
    const y = Math.max(0, Math.min(element.y, safeCanvasHeight));
    return { ...element, width, x, y };
  }

  const width = Math.max(5, Math.min(element.width || 45, safeCanvasWidth));
  const height = Math.max(4, Math.min(element.height || 8, safeCanvasHeight));
  const x = Math.max(0, Math.min(element.x, safeCanvasWidth - width));
  const y = Math.max(0, Math.min(element.y, safeCanvasHeight - height));
  return { ...element, width, height, x, y };
};

const withTemplateDefaults = (template: PrintTemplate): PrintTemplate => ({
  ...template,
  orientation: template.orientation || 'vertical',
  labelRows: Math.max(1, template.labelRows || 1),
  labelColumns: Math.max(1, template.labelColumns || 1),
  gapX: Math.max(0, template.gapX || 0),
  gapY: Math.max(0, template.gapY || 0),
  density: Math.min(2.5, Math.max(0.5, template.density || 1)),
  shape: template.shape || 'rectangle',
  cornerRadius: Math.max(1, template.cornerRadius || 4),
  showBorder: template.showBorder ?? false,
  borderStyle: template.borderStyle || 'solid',
  borderThickness: Math.max(0.1, template.borderThickness || 0.5),
});

export function PrintDesigner({ template: initialTemplate, onSave, onCancel }: PrintDesignerProps) {
  const [template, setTemplate] = useState<PrintTemplate>(() => withTemplateDefaults(initialTemplate));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const initialOrientation = (initialTemplate.orientation || 'vertical');
  const initialWidth = initialOrientation === 'horizontal' ? initialTemplate.height : initialTemplate.width;
  const initialHeight = initialOrientation === 'horizontal' ? initialTemplate.width : initialTemplate.height;
  const [zoom, setZoom] = useState(() => computeFitZoom(initialWidth, initialHeight));
  const [isVariablesExpanded, setIsVariablesExpanded] = useState(true);
  const [isPrintTestOpen, setIsPrintTestOpen] = useState(false);
  const [printCanvasDataUrl, setPrintCanvasDataUrl] = useState('');
  const [showGuides, setShowGuides] = useState(true);
  const transformerRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  const SCALE = BASE_SCALE * zoom;
  const orientation = template.orientation || 'vertical';
  const shape = template.shape || 'rectangle';
  const labelRows = Math.max(1, template.labelRows || 1);
  const labelColumns = Math.max(1, template.labelColumns || 1);
  const density = Math.min(2.5, Math.max(0.5, template.density || 1));
  const totalWidthMm = orientation === 'horizontal' ? template.height : template.width;
  const labelHeightMm = orientation === 'horizontal' ? template.width : template.height;
  const maxGapX = labelColumns > 1 ? Math.max(0, (totalWidthMm - (labelColumns * 5)) / (labelColumns - 1)) : 0;
  const effectiveGapX = labelColumns > 1 ? Math.min((template.gapX || 0) / density, maxGapX) : 0;
  const effectiveGapY = (template.gapY || 0) / density;
  const labelWidthMm = Math.max(5, (totalWidthMm - (effectiveGapX * (labelColumns - 1))) / labelColumns);
  const sheetWidthMm = totalWidthMm;
  const sheetHeightMm = (labelHeightMm * labelRows) + (effectiveGapY * (labelRows - 1));
  const borderThicknessMm = Math.max(0.1, template.borderThickness || 0.5);
  const cornerRadiusMm = Math.max(1, template.cornerRadius || 4);
  const previewCells = Array.from({ length: labelRows * labelColumns }, (_, index) => {
    const row = Math.floor(index / labelColumns);
    const col = index % labelColumns;
    return {
      id: `${row}-${col}`,
      left: (col * labelWidthMm) + (col * effectiveGapX),
      top: (row * labelHeightMm) + (row * effectiveGapY),
    };
  });
  const verticalGuideMarks = Array.from({ length: labelColumns + 1 }, (_, index) => {
    const x = index === labelColumns
      ? sheetWidthMm
      : index * (labelWidthMm + effectiveGapX);
    return Number(x.toFixed(2));
  });
  const horizontalGuideMarks = Array.from({ length: labelRows + 1 }, (_, index) => {
    const y = index === labelRows
      ? sheetHeightMm
      : index * (labelHeightMm + effectiveGapY);
    return Number(y.toFixed(2));
  });

  useEffect(() => {
    setZoom(computeFitZoom(sheetWidthMm, sheetHeightMm));
  }, [sheetWidthMm, sheetHeightMm]);

  const handleAddField = (type: TemplateElement['type'], variable?: string) => {
    const safeWidth = Math.max(10, labelWidthMm);
    const safeHeight = Math.max(10, labelHeightMm);
    const preferredWidth = type === 'line'
      ? Math.min(32, safeWidth - 2)
      : type === 'text' || type === 'variable'
        ? Math.min(24, safeWidth - 2)
        : Math.min(18, safeWidth - 2);
    const preferredHeight = type === 'line'
      ? 1
      : type === 'text' || type === 'variable'
        ? Math.min(6, safeHeight - 2)
        : type === 'qr'
          ? Math.min(18, safeHeight - 2)
          : Math.min(12, safeHeight - 2);

    const newElementBase: TemplateElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: variable || (type === 'text' ? 'Novo Texto' : ''),
      x: 2,
      y: 2,
      fontSize: type === 'text' || type === 'variable' ? 9 : 12,
      fontWeight: 'normal',
      textAlign: type === 'text' || type === 'variable' ? 'left' : undefined,
      wrapMode: type === 'text' || type === 'variable' ? 'wrap' : undefined,
      width: preferredWidth,
      height: preferredHeight,
      strokeWidth: type === 'line' ? 0.6 : undefined,
      lineStyle: type === 'line' ? 'solid' : undefined,
    };
    const newElement = clampElementToCanvas(newElementBase, safeWidth, safeHeight);

    setTemplate({
      ...template,
      elements: [...template.elements, newElement]
    });
    setSelectedId(newElement.id);
  };

  const updateElement = (id: string, attrs: Partial<TemplateElement>) => {
    setTemplate({
      ...template,
      elements: template.elements.map((el) => {
        if (el.id !== id) return el;
        const merged = { ...el, ...attrs };
        return clampElementToCanvas(merged, labelWidthMm, labelHeightMm);
      })
    });
  };

  const removeElement = (id: string) => {
    setTemplate({
      ...template,
      elements: template.elements.filter(el => el.id !== id)
    });
    setSelectedId(null);
  };

  const selectedElement = template.elements.find(el => el.id === selectedId);

  useEffect(() => {
    if (selectedId && transformerRef.current && layerRef.current) {
      const node = layerRef.current.findOne('#' + selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, template.elements]);

  const captureCanvasForPrint = () => {
    const stage = stageRef.current;
    if (!stage) return '';

    return stage.toDataURL({
      pixelRatio: 4,
      mimeType: 'image/png',
    });
  };

  useEffect(() => {
    if (!isPrintTestOpen) return;

    const timer = window.setTimeout(() => {
      setPrintCanvasDataUrl(captureCanvasForPrint());
    }, 80);

    return () => window.clearTimeout(timer);
  }, [isPrintTestOpen, selectedId, template, zoom, showGuides]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedId) return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingField = target?.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
      if (isTypingField) return;

      const step = event.shiftKey ? 5 : 1;
      const movementByKey: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
      };
      const movement = movementByKey[event.key];

      if (!movement) return;

      event.preventDefault();

      const selected = template.elements.find((el) => el.id === selectedId);
      if (!selected) return;

      updateElement(selectedId, {
        x: selected.x + movement.x,
        y: selected.y + movement.y,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, template.elements, labelWidthMm, labelHeightMm]);

  const handleStageMouseDown = (e: any) => {
    const clickedOnStage = e.target === e.target.getStage();
    
    if (clickedOnStage) {
      setSelectedId(null);
      return;
    }

    // Find the element ID by looking at the target and its parents
    let id = e.target.id();
    let curr = e.target;
    
    while (!id && curr.getParent()) {
      curr = curr.getParent();
      id = curr.id();
    }

    if (id && template.elements.some(el => el.id === id)) {
      setSelectedId(id);
    } else {
      const isTransformer = e.target.className === 'Transformer' || 
                           (e.target.getParent() && e.target.getParent().className === 'Transformer');
      if (!isTransformer) {
        setSelectedId(null);
      }
    }
  };

  const handleExport = () => {
    const trimmedName = (template.name || '').trim();
    if (!trimmedName) {
      toast.error('Informe um titulo para salvar a etiqueta personalizada.');
      return;
    }

    onSave(withTemplateDefaults({ ...template, name: trimmedName }));
    toast.success('Template salvo com sucesso!');
  };

  const handleSaveAsCopy = () => {
    const trimmedName = (template.name || '').trim();
    if (!trimmedName) {
      toast.error('Informe um titulo antes de salvar uma copia.');
      return;
    }

    const copyName = /\bcopia\b/i.test(trimmedName)
      ? `${trimmedName} ${new Date().toISOString().slice(11, 16).replace(':', '')}`
      : `${trimmedName} - Copia`;

    const duplicatedTemplate: PrintTemplate = withTemplateDefaults({
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      name: copyName,
    });

    onSave(duplicatedTemplate);
    toast.success('Copia do layout salva com sucesso!');
  };

  const handlePrintTest = () => {
    const latestCanvasDataUrl = captureCanvasForPrint();
    if (latestCanvasDataUrl) {
      setPrintCanvasDataUrl(latestCanvasDataUrl);
    }

    const printableNode = document.getElementById('printable-test-area');

    if (!printableNode) {
      window.print();
      return;
    }

    const printableHtml = latestCanvasDataUrl
      ? `<div id="printable-test-area"><img src="${latestCanvasDataUrl}" alt="Pre-visualizacao da impressao" /></div>`
      : printableNode.outerHTML;

    const printWindow = window.open('', '_blank', 'width=900,height=650');

    if (!printWindow) {
      toast.error('Nao foi possivel abrir a janela de impressao. Verifique o bloqueador de pop-ups.');
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Teste de Impressao</title>
          <style>
            @page {
              size: ${sheetWidthMm}mm ${sheetHeightMm}mm;
              margin: 0;
            }

            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            html,
            body {
              width: ${sheetWidthMm}mm;
              height: ${sheetHeightMm}mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
              background: #fff;
            }

            #printable-test-area {
              position: relative !important;
              width: ${sheetWidthMm}mm !important;
              height: ${sheetHeightMm}mm !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              overflow: hidden !important;
              background: #fff !important;
            }

            #printable-test-area img {
              display: block;
              width: ${sheetWidthMm}mm;
              height: ${sheetHeightMm}mm;
              object-fit: fill;
            }
          </style>
        </head>
        <body>
          ${printableHtml}
          <script>
            window.addEventListener('load', function () {
              window.focus();
              setTimeout(function () {
                window.print();
                window.close();
              }, 100);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleOpenPrintTest = () => {
    setSelectedId(null);
    setPrintCanvasDataUrl('');
    setIsPrintTestOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-card/95 border-b border-border shadow-sm z-10 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{template.name || 'Novo Template'}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{template.type} • folha {sheetWidthMm}mm x {sheetHeightMm}mm • etiqueta {labelWidthMm.toFixed(2)}mm x {labelHeightMm}mm</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="outline" className="gap-2" onClick={handleOpenPrintTest}>
            <Printer className="w-4 h-4" /> Teste de Impressao
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleSaveAsCopy}>
            <Copy className="w-4 h-4" /> Salvar como
          </Button>
          <Button className="gap-2" onClick={handleExport}>
            <Save className="w-4 h-4" /> Salvar Layout
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Zoom Controls Overlay */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-background/95 backdrop-blur-md p-2 rounded-full shadow-2xl border border-border">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={() => setZoom(prev => Math.max(0.2, prev - 0.2))}
            title="Reduzir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="w-16 text-center text-xs font-bold font-mono">
            {Math.round(zoom * 100)}%
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={() => setZoom(prev => Math.min(5, prev + 0.2))}
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={() => setZoom(computeFitZoom(sheetWidthMm, sheetHeightMm))}
            title="Ajustar na Tela"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        {/* Floating properties */}
        <div className={cn("absolute left-4 top-4 bottom-4 z-30 w-80 overflow-y-auto rounded-md border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-sm", !selectedElement && "hidden")}>
          {selectedElement ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground font-mono">Propriedades</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeElement(selectedElement.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {selectedElement.type === 'text' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase">Conteudo</Label>
                    <Input
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                )}

                {selectedElement.type === 'variable' && (
                  <div className="space-y-2 rounded-md border bg-secondary/10 p-2">
                    <Label className="text-[10px] uppercase">Variavel Selecionada</Label>
                    <p className="text-[11px] font-mono text-primary">{selectedElement.content}</p>
                    <p className="text-[11px] text-muted-foreground">Teste: {replaceVariableTokens(selectedElement.content)}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase">Posicao X (mm)</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase">Posicao Y (mm)</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {(selectedElement.type === 'text' || selectedElement.type === 'variable') && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase">Tamanho da Fonte (pt)</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => updateElement(selectedElement.id, { fontSize: Math.max(4, (selectedElement.fontSize || 12) - 1) })}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Select
                          value={(selectedElement.fontSize || 12).toString()}
                          onValueChange={(v) => updateElement(selectedElement.id, { fontSize: Number(v) })}
                        >
                          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].map(s => (
                              <SelectItem key={s} value={s.toString()}>{s}pt</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => updateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 12) + 1 })}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase">Largura do Espaco (mm)</Label>
                        <Input
                          type="number"
                          value={selectedElement.width || 45}
                          onChange={(e) => updateElement(selectedElement.id, { width: Math.max(5, Number(e.target.value) || 0) })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase">Altura do Espaco (mm)</Label>
                        <Input
                          type="number"
                          value={selectedElement.height || 8}
                          onChange={(e) => updateElement(selectedElement.id, { height: Math.max(4, Number(e.target.value) || 0) })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase">Alinhamento</Label>
                        <Select
                          value={selectedElement.textAlign || 'left'}
                          onValueChange={(value: 'left' | 'center' | 'right') => updateElement(selectedElement.id, { textAlign: value })}
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Esquerda</SelectItem>
                            <SelectItem value="center">Centro</SelectItem>
                            <SelectItem value="right">Direita</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase">Quebra de Linha</Label>
                        <Select
                          value={selectedElement.wrapMode || 'wrap'}
                          onValueChange={(value: 'wrap' | 'single-line') => updateElement(selectedElement.id, { wrapMode: value })}
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wrap">Quebra automatica</SelectItem>
                            <SelectItem value="single-line">Linha unica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase">Estilo</Label>
                        <Button
                          variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                          size="sm"
                          className="w-full h-8"
                          onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        >
                          Negrito
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {selectedElement.type === 'line' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase">Comprimento da Linha (mm)</Label>
                      <Input
                        type="number"
                        value={selectedElement.width || 50}
                        onChange={(e) => updateElement(selectedElement.id, { width: Math.max(1, Number(e.target.value) || 0) })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase">Espessura da Linha (mm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={selectedElement.strokeWidth || 0.6}
                        onChange={(e) => updateElement(selectedElement.id, { strokeWidth: Math.max(0.1, Number(e.target.value) || 0.1) })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase">Modelo da Linha</Label>
                      <Select
                        value={selectedElement.lineStyle || 'solid'}
                        onValueChange={(value: 'solid' | 'dashed' | 'dotted' | 'double') => updateElement(selectedElement.id, { lineStyle: value })}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solida</SelectItem>
                          <SelectItem value="dashed">Tracejada</SelectItem>
                          <SelectItem value="dotted">Pontilhada</SelectItem>
                          <SelectItem value="double">Dupla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {(selectedElement.type === 'qr' || selectedElement.type === 'barcode') && (
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase">Tamanho do Codigo (mm)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const newDim = Math.max(5, (selectedElement.width || 40) - 2);
                          updateElement(selectedElement.id, { width: newDim, height: selectedElement.type === 'qr' ? newDim : newDim / 2 });
                        }}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        value={selectedElement.width || 40}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updateElement(selectedElement.id, { width: val, height: selectedElement.type === 'qr' ? val : val / 2 });
                        }}
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const newDim = (selectedElement.width || 40) + 2;
                          updateElement(selectedElement.id, { width: newDim, height: selectedElement.type === 'qr' ? newDim : newDim / 2 });
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Workspace Central */}
        <div className="flex-1 overflow-auto p-12 flex items-start justify-center bg-muted/35">
          <div 
            className="border border-border shadow-2xl relative rounded-sm"
            style={{ 
              width: sheetWidthMm * SCALE, 
              height: sheetHeightMm * SCALE,
              backgroundColor: '#ffffff',
              backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.35) 1px, transparent 0)',
              backgroundSize: '10px 10px',
            }}
            onClick={() => setSelectedId(null)}
          >
            <Stage 
              ref={stageRef}
              width={sheetWidthMm * SCALE} 
              height={sheetHeightMm * SCALE}
              onMouseDown={handleStageMouseDown}
              onContextMenu={(e) => e.evt.preventDefault()}
            >
              <Layer ref={layerRef}>
                {showGuides && (
                  <>
                    {effectiveGapX > 0 && labelColumns > 1 && Array.from({ length: labelColumns - 1 }, (_, index) => {
                      const x = ((index + 1) * labelWidthMm) + (index * effectiveGapX);
                      return (
                        <React.Fragment key={`x-gap-${index}`}>
                          <Rect
                            x={x * SCALE}
                            y={0}
                            width={effectiveGapX * SCALE}
                            height={sheetHeightMm * SCALE}
                            fill="rgba(245, 158, 11, 0.14)"
                            stroke="rgba(245, 158, 11, 0.55)"
                            dash={[5, 5]}
                            listening={false}
                          />
                          <Text
                            text={`${effectiveGapX.toFixed(2)}mm`}
                            x={(x * SCALE) + 3}
                            y={Math.max(16, (sheetHeightMm * SCALE) / 2 - 7)}
                            fontSize={10}
                            fill="#b45309"
                            listening={false}
                          />
                        </React.Fragment>
                      );
                    })}
                    {effectiveGapY > 0 && labelRows > 1 && Array.from({ length: labelRows - 1 }, (_, index) => {
                      const y = ((index + 1) * labelHeightMm) + (index * effectiveGapY);
                      return (
                        <React.Fragment key={`y-gap-${index}`}>
                          <Rect
                            x={0}
                            y={y * SCALE}
                            width={sheetWidthMm * SCALE}
                            height={effectiveGapY * SCALE}
                            fill="rgba(245, 158, 11, 0.14)"
                            stroke="rgba(245, 158, 11, 0.55)"
                            dash={[5, 5]}
                            listening={false}
                          />
                          <Text
                            text={`${effectiveGapY.toFixed(2)}mm`}
                            x={Math.max(8, (sheetWidthMm * SCALE) / 2 - 20)}
                            y={(y * SCALE) + 3}
                            fontSize={10}
                            fill="#b45309"
                            listening={false}
                          />
                        </React.Fragment>
                      );
                    })}
                    {verticalGuideMarks.map((mark, index) => (
                      <React.Fragment key={`v-guide-${index}`}>
                        <Line
                          points={[mark * SCALE, 0, mark * SCALE, sheetHeightMm * SCALE]}
                          stroke={index === 0 || index === verticalGuideMarks.length - 1 ? '#64748b' : '#2563eb'}
                          strokeWidth={index === 0 || index === verticalGuideMarks.length - 1 ? 1 : 1.5}
                          dash={index === 0 || index === verticalGuideMarks.length - 1 ? [4, 4] : [8, 5]}
                          listening={false}
                        />
                        <Text
                          text={`${mark}mm`}
                          x={Math.min(Math.max(2, mark * SCALE + 3), sheetWidthMm * SCALE - 42)}
                          y={2}
                          fontSize={10}
                          fill="#2563eb"
                          listening={false}
                        />
                      </React.Fragment>
                    ))}
                    {horizontalGuideMarks.map((mark, index) => (
                      <React.Fragment key={`h-guide-${index}`}>
                        <Line
                          points={[0, mark * SCALE, sheetWidthMm * SCALE, mark * SCALE]}
                          stroke={index === 0 || index === horizontalGuideMarks.length - 1 ? '#64748b' : '#2563eb'}
                          strokeWidth={index === 0 || index === horizontalGuideMarks.length - 1 ? 1 : 1.5}
                          dash={index === 0 || index === horizontalGuideMarks.length - 1 ? [4, 4] : [8, 5]}
                          listening={false}
                        />
                        <Text
                          text={`${mark}mm`}
                          x={2}
                          y={Math.min(Math.max(2, mark * SCALE + 3), sheetHeightMm * SCALE - 14)}
                          fontSize={10}
                          fill="#2563eb"
                          listening={false}
                        />
                      </React.Fragment>
                    ))}
                  </>
                )}

                {template.showBorder && (
                  <>
                    {shape === 'ellipse' ? (
                      <>
                        <Ellipse
                          x={(labelWidthMm * SCALE) / 2}
                          y={(labelHeightMm * SCALE) / 2}
                          radiusX={(labelWidthMm * SCALE) / 2}
                          radiusY={(labelHeightMm * SCALE) / 2}
                          stroke="#111"
                          strokeWidth={mmStrokeToCanvasPx(borderThicknessMm, SCALE)}
                          dash={lineDashByStyle(template.borderStyle)}
                          listening={false}
                        />
                        {template.borderStyle === 'double' && (
                          <Ellipse
                            x={(labelWidthMm * SCALE) / 2}
                            y={(labelHeightMm * SCALE) / 2}
                            radiusX={Math.max(1, (labelWidthMm * SCALE) / 2 - Math.max(2, borderThicknessMm * SCALE * 2.5))}
                            radiusY={Math.max(1, (labelHeightMm * SCALE) / 2 - Math.max(2, borderThicknessMm * SCALE * 2.5))}
                            stroke="#111"
                            strokeWidth={mmStrokeToCanvasPx(borderThicknessMm, SCALE)}
                            listening={false}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <Rect
                          x={0}
                          y={0}
                          width={labelWidthMm * SCALE}
                          height={labelHeightMm * SCALE}
                          cornerRadius={shape === 'rounded' ? cornerRadiusMm * SCALE : 0}
                          stroke="#111"
                          strokeWidth={mmStrokeToCanvasPx(borderThicknessMm, SCALE)}
                          dash={lineDashByStyle(template.borderStyle)}
                          listening={false}
                        />
                        {template.borderStyle === 'double' && (
                          <Rect
                            x={Math.max(2, borderThicknessMm * SCALE * 2.5)}
                            y={Math.max(2, borderThicknessMm * SCALE * 2.5)}
                            width={Math.max(1, labelWidthMm * SCALE - Math.max(4, borderThicknessMm * SCALE * 5))}
                            height={Math.max(1, labelHeightMm * SCALE - Math.max(4, borderThicknessMm * SCALE * 5))}
                            cornerRadius={shape === 'rounded' ? Math.max(0, cornerRadiusMm * SCALE - Math.max(2, borderThicknessMm * SCALE * 2.5)) : 0}
                            stroke="#111"
                            strokeWidth={mmStrokeToCanvasPx(borderThicknessMm, SCALE)}
                            listening={false}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {template.elements.map((el) => {
                  const isSelected = selectedId === el.id;
                  const displayContent = el.type === 'variable' ? replaceVariableTokens(el.content) : el.content;
                  const fittedFontSizePt = getFittedFontSizePt({
                    content: displayContent,
                    baseFontSize: el.fontSize || 12,
                    widthMm: el.width || 45,
                    heightMm: el.height || 8,
                  });
                  
                  if (el.type === 'line') {
                    const widthPx = Math.max(1, (el.width || 50) * SCALE);
                    const lineStroke = mmStrokeToCanvasPx(el.strokeWidth || 0.6, SCALE);
                    return (
                      <Group
                        key={el.id}
                        id={el.id}
                        x={el.x * SCALE}
                        y={el.y * SCALE}
                        draggable
                        onDragEnd={(e) => {
                          updateElement(el.id, { 
                            x: e.target.x() / SCALE, 
                            y: e.target.y() / SCALE 
                          });
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const scaleY = node.scaleY();
                          updateElement(el.id, {
                            width: Math.max(1, (el.width || 50) * scaleX),
                            strokeWidth: Math.max(0.1, (el.strokeWidth || 0.6) * Math.abs(scaleY)),
                            x: node.x() / SCALE,
                            y: node.y() / SCALE
                          });
                          node.scaleX(1);
                          node.scaleY(1);
                        }}
                      >
                        {el.lineStyle === 'double' ? (
                          <>
                            <Line
                              points={[0, -lineStroke, widthPx, -lineStroke]}
                              stroke={isSelected ? "#2563eb" : "#111"}
                              strokeWidth={lineStroke}
                            />
                            <Line
                              points={[0, lineStroke, widthPx, lineStroke]}
                              stroke={isSelected ? "#2563eb" : "#111"}
                              strokeWidth={lineStroke}
                            />
                          </>
                        ) : (
                          <Line
                            points={[0, 0, widthPx, 0]}
                            stroke={isSelected ? "#2563eb" : "#111"}
                            strokeWidth={lineStroke}
                            dash={lineDashByStyle(el.lineStyle)}
                          />
                        )}
                        {isSelected && (
                          <Rect
                            x={0}
                            y={-Math.max(4, lineStroke * 2)}
                            width={widthPx}
                            height={Math.max(8, lineStroke * 4)}
                            stroke="#3b82f6"
                            dash={[6, 4]}
                            fillEnabled={false}
                            listening={false}
                          />
                        )}
                      </Group>
                    );
                  }

                  if (el.type === 'qr' || el.type === 'barcode') {
                    return (
                      <Group
                        key={el.id}
                        id={el.id}
                        x={el.x * SCALE}
                        y={el.y * SCALE}
                        draggable
                        onDragEnd={(e) => {
                          updateElement(el.id, { 
                            x: e.target.x() / SCALE, 
                            y: e.target.y() / SCALE 
                          });
                        }}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleX = node.scaleX();
                          const currentWidth = el.width || 40;
                          const newWidth = currentWidth * scaleX;
                          updateElement(el.id, {
                            width: newWidth,
                            height: el.type === 'qr' ? newWidth : newWidth / 2,
                            x: node.x() / SCALE,
                            y: node.y() / SCALE
                          });
                          node.scaleX(1);
                          node.scaleY(1);
                        }}
                      >
                        <Rect
                          width={(el.width || 40) * SCALE}
                          height={(el.height || (el.type === 'qr' ? 40 : 20)) * SCALE}
                          fill="#f3f4f6"
                          stroke={isSelected ? "#3b82f6" : "#e5e7eb"}
                          strokeWidth={isSelected ? 1.25 : 0.75}
                        />
                        <Text
                          text={el.type.toUpperCase()}
                          width={(el.width || 40) * SCALE}
                          height={(el.height || (el.type === 'qr' ? 40 : 20)) * SCALE}
                          align="center"
                          verticalAlign="middle"
                          fontSize={10 * (zoom / 1.5)}
                        />
                      </Group>
                    );
                  }

                  return (
                    <Text
                      key={el.id}
                      id={el.id}
                      text={displayContent}
                      x={el.x * SCALE}
                      y={el.y * SCALE}
                      width={(el.width || 45) * SCALE}
                      height={(el.height || 8) * SCALE}
                      align={el.textAlign || 'left'}
                      verticalAlign={(el.wrapMode || 'wrap') === 'single-line' ? 'middle' : 'top'}
                      wrap={(el.wrapMode || 'wrap') === 'single-line' ? 'none' : 'char'}
                      ellipsis={(el.wrapMode || 'wrap') === 'single-line'}
                      fontSize={fittedFontSizePt * zoom * (96 / 72)}
                      fontStyle={el.fontWeight === 'bold' ? 'bold' : 'normal'}
                      draggable
                      listening={true}
                      onDragEnd={(e) => {
                        updateElement(el.id, { 
                          x: e.target.x() / SCALE, 
                          y: e.target.y() / SCALE 
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        const scaleFactor = Math.min(Math.abs(scaleX), Math.abs(scaleY));
                        updateElement(el.id, {
                          width: Math.max(5, (node.width() * scaleX) / SCALE),
                          height: Math.max(4, (node.height() * scaleY) / SCALE),
                          fontSize: Math.max(4, (el.fontSize || 12) * Math.max(0.3, scaleFactor)),
                          x: node.x() / SCALE,
                          y: node.y() / SCALE
                        });
                        node.scaleX(1);
                        node.scaleY(1);
                      }}
                    />
                  );
                })}
                {previewCells.slice(1).map((cell) => (
                  <Group
                    key={`copy-cell-${cell.id}`}
                    x={cell.left * SCALE}
                    y={cell.top * SCALE}
                    listening={false}
                    opacity={0.85}
                  >
                    {template.showBorder && (
                      shape === 'ellipse' ? (
                        <Ellipse
                          x={(labelWidthMm * SCALE) / 2}
                          y={(labelHeightMm * SCALE) / 2}
                          radiusX={(labelWidthMm * SCALE) / 2}
                          radiusY={(labelHeightMm * SCALE) / 2}
                          stroke="#111"
                          strokeWidth={mmStrokeToCanvasPx(borderThicknessMm, SCALE)}
                          dash={lineDashByStyle(template.borderStyle)}
                        />
                      ) : (
                        <Rect
                          x={0}
                          y={0}
                          width={labelWidthMm * SCALE}
                          height={labelHeightMm * SCALE}
                          cornerRadius={shape === 'rounded' ? cornerRadiusMm * SCALE : 0}
                          stroke="#111"
                          strokeWidth={mmStrokeToCanvasPx(borderThicknessMm, SCALE)}
                          dash={lineDashByStyle(template.borderStyle)}
                        />
                      )
                    )}
                    {template.elements.map((el) => {
                      const displayContent = el.type === 'variable' ? replaceVariableTokens(el.content) : el.content;
                      const fittedFontSizePt = getFittedFontSizePt({
                        content: displayContent,
                        baseFontSize: el.fontSize || 12,
                        widthMm: el.width || 45,
                        heightMm: el.height || 8,
                      });

                      if (el.type === 'line') {
                        const widthPx = Math.max(1, (el.width || 50) * SCALE);
                        const lineStroke = mmStrokeToCanvasPx(el.strokeWidth || 0.6, SCALE);
                        return el.lineStyle === 'double' ? (
                          <Group key={`${cell.id}-${el.id}`} x={el.x * SCALE} y={el.y * SCALE}>
                            <Line points={[0, -lineStroke, widthPx, -lineStroke]} stroke="#111" strokeWidth={lineStroke} />
                            <Line points={[0, lineStroke, widthPx, lineStroke]} stroke="#111" strokeWidth={lineStroke} />
                          </Group>
                        ) : (
                          <Line
                            key={`${cell.id}-${el.id}`}
                            points={[el.x * SCALE, el.y * SCALE, (el.x * SCALE) + widthPx, el.y * SCALE]}
                            stroke="#111"
                            strokeWidth={lineStroke}
                            dash={lineDashByStyle(el.lineStyle)}
                          />
                        );
                      }

                      if (el.type === 'qr' || el.type === 'barcode') {
                        return (
                          <Group key={`${cell.id}-${el.id}`} x={el.x * SCALE} y={el.y * SCALE}>
                            <Rect
                              width={(el.width || 40) * SCALE}
                              height={(el.height || (el.type === 'qr' ? 40 : 20)) * SCALE}
                              fill="#f3f4f6"
                              stroke="#e5e7eb"
                              strokeWidth={0.75}
                            />
                            <Text
                              text={el.type.toUpperCase()}
                              width={(el.width || 40) * SCALE}
                              height={(el.height || (el.type === 'qr' ? 40 : 20)) * SCALE}
                              align="center"
                              verticalAlign="middle"
                              fontSize={10 * (zoom / 1.5)}
                            />
                          </Group>
                        );
                      }

                      return (
                        <Text
                          key={`${cell.id}-${el.id}`}
                          text={displayContent}
                          x={el.x * SCALE}
                          y={el.y * SCALE}
                          width={(el.width || 45) * SCALE}
                          height={(el.height || 8) * SCALE}
                          align={el.textAlign || 'left'}
                          verticalAlign={(el.wrapMode || 'wrap') === 'single-line' ? 'middle' : 'top'}
                          wrap={(el.wrapMode || 'wrap') === 'single-line' ? 'none' : 'char'}
                          ellipsis={(el.wrapMode || 'wrap') === 'single-line'}
                          fontSize={fittedFontSizePt * zoom * (96 / 72)}
                          fontStyle={el.fontWeight === 'bold' ? 'bold' : 'normal'}
                        />
                      );
                    })}
                  </Group>
                ))}
                <Transformer
                  ref={transformerRef}
                  keepRatio={selectedElement?.type === 'qr' || selectedElement?.type === 'barcode'}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                />
              </Layer>
            </Stage>
            
            {/* Quick Actions Floating Toolbar */}
            {selectedElement && (
              <div 
                className="absolute z-30 flex items-center gap-1 bg-primary text-primary-foreground p-1 rounded-md shadow-xl -translate-y-full mb-2 pointer-events-auto"
                style={{ 
                  left: (selectedElement.x * SCALE), 
                  top: (selectedElement.y * SCALE) - 10,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {(selectedElement.type === 'text' || selectedElement.type === 'variable') && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 hover:bg-white/20 text-white" 
                      onClick={() => updateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 12) + 1 })}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <span className="text-[10px] font-bold px-1">{selectedElement.fontSize}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 hover:bg-white/20 text-white" 
                      onClick={() => updateElement(selectedElement.id, { fontSize: Math.max(4, (selectedElement.fontSize || 12) - 1) })}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </>
                )}
                <div className="w-px h-3 bg-white/20 mx-1"></div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 hover:bg-rose-500 text-white" 
                  onClick={() => removeElement(selectedElement.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* Overlay indicators */}
            <div className="absolute top-0 right-full mr-2 h-full flex flex-col items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span className="rotate-0 uppercase">0mm</span>
              <div className="flex-1 w-px bg-muted-foreground/30 my-1"></div>
              <span className="rotate-0 uppercase">{sheetHeightMm}mm</span>
            </div>
            <div className="absolute bottom-full mb-2 left-0 w-full flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span className="uppercase">0mm</span>
              <div className="flex-1 h-px bg-muted-foreground/30 mx-2"></div>
              <span className="uppercase">{sheetWidthMm}mm</span>
            </div>
          </div>
        </div>

        {/* Right Side: Toolbar (Formerly Left) */}
        <div className="w-72 bg-card/95 border-l border-border overflow-y-auto p-4 space-y-6 backdrop-blur-sm">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Itens Inseridos</h3>
            {template.elements.length > 0 ? (
              <div className="space-y-1 max-h-[200px] overflow-y-auto border rounded-md p-1 bg-secondary/5">
                {template.elements.map((el, index) => {
                  const varInfo = el.type === 'variable' ? SYSTEM_VARIABLES.find(v => v.id === el.content) : null;
                  const label = el.type === 'variable' ? varInfo?.name || el.content : 
                                el.type === 'text' ? el.content : 
                                el.type === 'qr' ? 'QR Code' : 
                                el.type === 'barcode' ? 'Código de Barras' : 'Linha';
                  
                  return (
                    <div className="flex items-center gap-1 group/row">
                      <button
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={cn(
                          "flex-1 flex items-center gap-2 px-3 py-2 text-xs text-left rounded-sm transition-all border border-transparent",
                          selectedId === el.id ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10"
                        )}
                      >
                        <span className="opacity-50 font-mono text-[10px] w-4">{index + 1}</span>
                        <div className="flex-1 truncate font-medium">
                          {label}
                        </div>
                        <div className="opacity-50 text-[9px] uppercase pr-1">
                          {el.type === 'variable' ? 'VAR' : el.type}
                        </div>
                      </button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-rose-500 opacity-0 group-hover/row:opacity-100 transition-opacity" 
                        onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-muted-foreground italic text-center py-4 border border-dashed rounded-md">
                Nenhum item adicionado
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Adicionar Campos</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="flex flex-col h-20 gap-2 bg-muted/25 hover:bg-primary/10 border-border" onClick={() => handleAddField('text')}>
                <Type className="w-5 h-5" />
                <span className="text-[10px]">Texto</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2 bg-muted/25 hover:bg-primary/10 border-border" onClick={() => handleAddField('line')}>
                <Minus className="w-5 h-5" />
                <span className="text-[10px]">Linha</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2 bg-muted/25 hover:bg-primary/10 border-border" onClick={() => handleAddField('qr')}>
                <QrCode className="w-5 h-5" />
                <span className="text-[10px]">QR Code</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2 bg-muted/25 hover:bg-primary/10 border-border" onClick={() => handleAddField('barcode')}>
                <Hash className="w-5 h-5" />
                <span className="text-[10px]">Cód. Barras</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              className="w-full flex items-center justify-between"
              onClick={() => setIsVariablesExpanded((prev) => !prev)}
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Variáveis do Sistema</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{SYSTEM_VARIABLES.length}</span>
                {isVariablesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {isVariablesExpanded ? (
              <div className="space-y-1">
                {SYSTEM_VARIABLES.map(v => (
                  <button 
                    key={v.id}
                    onClick={() => handleAddField('variable', v.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left border rounded-md hover:bg-primary/5 hover:border-primary/30 transition-all group"
                  >
                    <span className="font-mono text-[9px] text-primary">{v.id}</span>
                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground">Clique para expandir e inserir variáveis no layout.</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Configuracoes da Etiqueta</h3>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase">Titulo da Etiqueta</Label>
              <Input
                type="text"
                value={template.name || ''}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                placeholder="Ex: Etiqueta Entrada Notebook"
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Largura total (mm)</Label>
                <Input
                  type="number"
                  value={template.width}
                  onChange={(e) => setTemplate({ ...template, width: Math.max(10, Number(e.target.value) || 10) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Altura da etiqueta (mm)</Label>
                <Input
                  type="number"
                  value={template.height}
                  onChange={(e) => setTemplate({ ...template, height: Math.max(10, Number(e.target.value) || 10) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Orientacao</Label>
                <Select
                  value={template.orientation || 'vertical'}
                  onValueChange={(value: 'vertical' | 'horizontal') => setTemplate({ ...template, orientation: value })}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Forma</Label>
                <Select
                  value={template.shape || 'rectangle'}
                  onValueChange={(value: 'rectangle' | 'rounded' | 'ellipse') => setTemplate({ ...template, shape: value })}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">Retangulo</SelectItem>
                    <SelectItem value="rounded">Arredondado</SelectItem>
                    <SelectItem value="ellipse">Elipse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(template.shape || 'rectangle') === 'rounded' && (
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Raio dos Cantos (mm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  value={template.cornerRadius || 4}
                  onChange={(e) => setTemplate({ ...template, cornerRadius: Math.max(1, Number(e.target.value) || 1) })}
                  className="h-8 text-xs"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Colunas</Label>
                <Input
                  type="number"
                  min="1"
                  value={template.labelColumns || 1}
                  onChange={(e) => setTemplate({ ...template, labelColumns: Math.max(1, Number(e.target.value) || 1) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Linhas</Label>
                <Input
                  type="number"
                  min="1"
                  value={template.labelRows || 1}
                  onChange={(e) => setTemplate({ ...template, labelRows: Math.max(1, Number(e.target.value) || 1) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Intervalo horizontal (mm)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={template.gapX || 0}
                  onChange={(e) => setTemplate({ ...template, gapX: Math.max(0, Number(e.target.value) || 0) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Intervalo vertical (mm)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={template.gapY || 0}
                  onChange={(e) => setTemplate({ ...template, gapY: Math.max(0, Number(e.target.value) || 0) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 rounded-md border bg-secondary/10 px-3 py-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Exibir linhas de divisao e medidas no canva
            </label>

            <div className="rounded-md border bg-secondary/10 px-3 py-2 text-[11px] text-muted-foreground">
              Grade: {labelRows} x {labelColumns} etiquetas ({labelWidthMm.toFixed(2)} x {labelHeightMm} mm cada)
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase">Moldura</Label>
              <Select
                value={template.showBorder ? 'on' : 'off'}
                onValueChange={(value) => setTemplate({ ...template, showBorder: value === 'on' })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Sem moldura</SelectItem>
                  <SelectItem value="on">Com moldura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {template.showBorder && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase">Estilo da Moldura</Label>
                  <Select
                    value={template.borderStyle || 'solid'}
                    onValueChange={(value: 'solid' | 'dashed' | 'dotted' | 'double') => setTemplate({ ...template, borderStyle: value })}
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solida</SelectItem>
                      <SelectItem value="dashed">Tracejada</SelectItem>
                      <SelectItem value="dotted">Pontilhada</SelectItem>
                      <SelectItem value="double">Dupla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase">Espessura (mm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={template.borderThickness || 0.5}
                    onChange={(e) => setTemplate({ ...template, borderThickness: Math.max(0.1, Number(e.target.value) || 0.1) })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isPrintTestOpen} onOpenChange={setIsPrintTestOpen}>
        <DialogContent className="max-w-[95vw] w-fit">
          <DialogHeader>
            <DialogTitle>Teste de Impressao</DialogTitle>
            <DialogDescription>
              Esta pre-visualizacao usa os dados de teste e o tamanho real da etiqueta para validar o resultado antes de imprimir.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <div
              id="printable-test-area"
              className="bg-white border shadow-xl relative overflow-hidden"
              style={{
                width: `${sheetWidthMm}mm`,
                height: `${sheetHeightMm}mm`,
                boxSizing: 'border-box',
              }}
            >
              {printCanvasDataUrl ? (
                <img
                  src={printCanvasDataUrl}
                  alt="Pre-visualizacao da impressao"
                  style={{
                    width: `${sheetWidthMm}mm`,
                    height: `${sheetHeightMm}mm`,
                    display: 'block',
                    objectFit: 'fill',
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                  Gerando visualizacao do canva...
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <Button variant="outline" onClick={() => setIsPrintTestOpen(false)}>Fechar</Button>
              <Button className="gap-2" onClick={handlePrintTest}>
                <Printer className="w-4 h-4" /> Imprimir Teste
              </Button>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: ${sheetWidthMm}mm ${sheetHeightMm}mm;
                margin: 0;
              }
              html,
              body,
              #root {
                width: ${sheetWidthMm}mm !important;
                height: ${sheetHeightMm}mm !important;
                min-width: 0 !important;
                min-height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: #fff !important;
              }
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-test-area, #printable-test-area * {
                visibility: visible !important;
              }
              #printable-test-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: ${sheetWidthMm}mm !important;
                height: ${sheetHeightMm}mm !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                overflow: hidden !important;
              }
            }
          `}} />
        </DialogContent>
      </Dialog>
    </div>
  );
}


