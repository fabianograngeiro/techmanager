import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Rect, Group, Line, Transformer } from 'react-konva';
import { PrintTemplate, TemplateElement } from '../types';
import { 
  Type, 
  Hash, 
  QrCode, 
  Minus, 
  Move, 
  Trash2, 
  Save, 
  ChevronLeft, 
  Settings2,
  Plus,
  Copy,
  Layout,
  ZoomIn,
  ZoomOut,
  Maximize,
  Search,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
export function PrintDesigner({ template: initialTemplate, onSave, onCancel }: PrintDesignerProps) {
  const [template, setTemplate] = useState<PrintTemplate>(initialTemplate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.5); // Default zoom slightly higher for better visibility
  const transformerRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  // Base conversion factor: mm to pixels (approximate 3.78 for 96 DPI)
  const BASE_SCALE = 3.78;
  const SCALE = BASE_SCALE * zoom;
  const previewScale = Math.min(260 / template.width, 320 / template.height);
  const normalizedPreviewScale = Number.isFinite(previewScale) ? Math.max(0.6, previewScale) : 1;

  const handleAddField = (type: TemplateElement['type'], variable?: string) => {
    const newElement: TemplateElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: variable || (type === 'text' ? 'Novo Texto' : ''),
      x: 10,
      y: 10,
      fontSize: 12,
      fontWeight: 'normal',
      textAlign: type === 'text' || type === 'variable' ? 'left' : undefined,
      width: type === 'line'
        ? 50
        : type === 'text' || type === 'variable'
          ? 45
          : type === 'qr' || type === 'barcode'
            ? 30
            : undefined,
      height: type === 'line'
        ? 1
        : type === 'text' || type === 'variable'
          ? 8
          : type === 'qr'
            ? 30
            : type === 'barcode'
              ? 18
              : undefined,
      strokeWidth: type === 'line' ? 0.6 : undefined,
      lineStyle: type === 'line' ? 'solid' : undefined,
    };

    setTemplate({
      ...template,
      elements: [...template.elements, newElement]
    });
    setSelectedId(newElement.id);
  };

  const updateElement = (id: string, attrs: Partial<TemplateElement>) => {
    setTemplate({
      ...template,
      elements: template.elements.map(el => el.id === id ? { ...el, ...attrs } : el)
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
    onSave(template);
    toast.success('Template salvo com sucesso!');
  };

  return (
    <div className="flex flex-col h-full bg-secondary/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{template.name || 'Novo Template'}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{template.type} • {template.width}mm x {template.height}mm</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button className="gap-2" onClick={handleExport}>
            <Save className="w-4 h-4" /> Salvar Layout
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border">
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
            onClick={() => setZoom(1.5)}
            title="Sincronizar Zoom"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        {/* Left Side: Live Viewer + Properties */}
        <div className="w-80 bg-white border-r overflow-y-auto p-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Viewer em Tempo Real</h3>
            <div className="rounded-md border bg-secondary/20 p-3 overflow-auto">
              <div
                className="mx-auto bg-white relative shadow-sm"
                style={{
                  width: template.width * normalizedPreviewScale,
                  height: template.height * normalizedPreviewScale,
                  border: template.showBorder
                    ? `${Math.max(0.2, template.borderThickness || 0.5) * normalizedPreviewScale * 3.4}px ${template.borderStyle === 'double' ? 'double' : (template.borderStyle || 'solid')} #111827`
                    : '1px dashed #d1d5db',
                }}
              >
                {template.elements.map((el) => {
                  if (el.type === 'line') {
                    return (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: el.x * normalizedPreviewScale,
                          top: el.y * normalizedPreviewScale,
                          width: (el.width || 50) * normalizedPreviewScale,
                          borderTop: `${Math.max(1, (el.strokeWidth || 0.6) * normalizedPreviewScale * 3.4)}px ${el.lineStyle === 'double' ? 'double' : (el.lineStyle || 'solid')} #111`,
                        }}
                      />
                    );
                  }

                  if (el.type === 'qr' || el.type === 'barcode') {
                    return (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: el.x * normalizedPreviewScale,
                          top: el.y * normalizedPreviewScale,
                          width: (el.width || 30) * normalizedPreviewScale,
                          height: (el.height || (el.type === 'qr' ? 30 : 18)) * normalizedPreviewScale,
                          border: '1px solid #111',
                          background: '#f4f4f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 600,
                        }}
                      >
                        {el.type.toUpperCase()}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: el.x * normalizedPreviewScale,
                        top: el.y * normalizedPreviewScale,
                        width: (el.width || 45) * normalizedPreviewScale,
                        height: (el.height || 8) * normalizedPreviewScale,
                        fontSize: (el.fontSize || 12) * normalizedPreviewScale * 1.15,
                        fontWeight: el.fontWeight === 'bold' ? 700 : 400,
                        textAlign: el.textAlign || 'left',
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 1.1,
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                      }}
                    >
                      {replaceVariableTokens(el.content)}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Preview com variaveis ficticias para validar o layout final.
            </p>
          </div>

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
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">Configuracao Visual</p>
                <p className="text-xs text-muted-foreground mt-2">Selecione um elemento para ajustar propriedades de fonte, espaco e linha.</p>
              </div>
            </div>
          )}
        </div>

        {/* Workspace Central */}
        <div className="flex-1 overflow-auto p-12 flex items-start justify-center bg-gray-100">
          <div 
            className="bg-white shadow-2xl relative"
            style={{ 
              width: template.width * SCALE, 
              height: template.height * SCALE,
              backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 0)',
              backgroundSize: '10px 10px'
            }}
            onClick={() => setSelectedId(null)}
          >
            <Stage 
              width={template.width * SCALE} 
              height={template.height * SCALE}
              onMouseDown={handleStageMouseDown}
              onContextMenu={(e) => e.evt.preventDefault()}
            >
              <Layer ref={layerRef}>
                {template.showBorder && (
                  <>
                    <Rect
                      x={0}
                      y={0}
                      width={template.width * SCALE}
                      height={template.height * SCALE}
                      stroke="#111"
                      strokeWidth={Math.max(1, (template.borderThickness || 0.5) * SCALE)}
                      dash={lineDashByStyle(template.borderStyle)}
                      listening={false}
                    />
                    {template.borderStyle === 'double' && (
                      <Rect
                        x={Math.max(2, (template.borderThickness || 0.5) * SCALE * 2.5)}
                        y={Math.max(2, (template.borderThickness || 0.5) * SCALE * 2.5)}
                        width={Math.max(1, template.width * SCALE - Math.max(4, (template.borderThickness || 0.5) * SCALE * 5))}
                        height={Math.max(1, template.height * SCALE - Math.max(4, (template.borderThickness || 0.5) * SCALE * 5))}
                        stroke="#111"
                        strokeWidth={Math.max(1, (template.borderThickness || 0.5) * SCALE)}
                        listening={false}
                      />
                    )}
                  </>
                )}

                {template.elements.map((el) => {
                  const isSelected = selectedId === el.id;
                  
                  if (el.type === 'line') {
                    const widthPx = Math.max(1, (el.width || 50) * SCALE);
                    const lineStroke = Math.max(1, (el.strokeWidth || 0.6) * SCALE);
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
                          strokeWidth={isSelected ? 2 : 1}
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
                      text={el.content}
                      x={el.x * SCALE}
                      y={el.y * SCALE}
                      width={(el.width || 45) * SCALE}
                      height={(el.height || 8) * SCALE}
                      align={el.textAlign || 'left'}
                      verticalAlign="middle"
                      wrap="word"
                      ellipsis
                      fontSize={(el.fontSize || 12) * zoom * 3.8}
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
                        updateElement(el.id, {
                          width: Math.max(5, (node.width() * scaleX) / SCALE),
                          height: Math.max(4, (node.height() * scaleY) / SCALE),
                          x: node.x() / SCALE,
                          y: node.y() / SCALE
                        });
                        node.scaleX(1);
                        node.scaleY(1);
                      }}
                    />
                  );
                })}
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
              <span className="rotate-0 uppercase">{template.height}mm</span>
            </div>
            <div className="absolute bottom-full mb-2 left-0 w-full flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span className="uppercase">0mm</span>
              <div className="flex-1 h-px bg-muted-foreground/30 mx-2"></div>
              <span className="uppercase">{template.width}mm</span>
            </div>
          </div>
        </div>

        {/* Right Side: Toolbar (Formerly Left) */}
        <div className="w-80 bg-white border-l overflow-y-auto p-4 space-y-6">
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
              <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleAddField('text')}>
                <Type className="w-5 h-5" />
                <span className="text-[10px]">Texto</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleAddField('line')}>
                <Minus className="w-5 h-5" />
                <span className="text-[10px]">Linha</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleAddField('qr')}>
                <QrCode className="w-5 h-5" />
                <span className="text-[10px]">QR Code</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={() => handleAddField('barcode')}>
                <Hash className="w-5 h-5" />
                <span className="text-[10px]">Cód. Barras</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Variáveis do Sistema</h3>
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
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Configuracoes da Folha</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Largura (mm)</Label>
                <Input
                  type="number"
                  value={template.width}
                  onChange={(e) => setTemplate({ ...template, width: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase">Altura (mm)</Label>
                <Input
                  type="number"
                  value={template.height}
                  onChange={(e) => setTemplate({ ...template, height: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
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
    </div>
  );
}


