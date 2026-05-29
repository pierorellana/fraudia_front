import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Rule } from '../models/rule.model';

const RULES: Rule[] = [
  {
    id: 1,
    code: 'RF-01',
    name: 'Ventana sensible de vigencia',
    description: 'Detecta siniestros ocurridos cerca del inicio o fin de la póliza.',
    category: 'Temporalidad de póliza',
    maxScore: 18,
    ruleType: 'Regla determinística',
    active: true,
    conditions: [
      {
        id: 101,
        name: 'Inicio menor o igual a 7 días',
        evaluatedField: 'daysFromPolicyStart',
        operator: '<=',
        maxValue: 7,
        points: 18,
        resultDescription: 'Siniestro reportado muy cerca del inicio de vigencia.',
      },
      {
        id: 102,
        name: 'Fin menor o igual a 7 días',
        evaluatedField: 'daysFromPolicyEnd',
        operator: '<=',
        maxValue: 7,
        points: 14,
        resultDescription: 'Siniestro reportado cerca del fin de vigencia.',
      },
    ],
  },
  {
    id: 2,
    code: 'RF-02',
    name: 'Reporte tardío',
    description: 'Evalúa demoras entre ocurrencia y reporte del siniestro.',
    category: 'Comportamiento de reporte',
    maxScore: 14,
    ruleType: 'Regla determinística',
    active: true,
    conditions: [
      {
        id: 201,
        name: 'Robo reportado después de 5 días',
        evaluatedField: 'reportDelayDays',
        operator: '>=',
        minValue: 5,
        points: 14,
        resultDescription: 'La demora exige revisión documental y de narrativa.',
      },
    ],
  },
  {
    id: 3,
    code: 'RF-03',
    name: 'Frecuencia inusual',
    description: 'Revisa patrones repetidos del asegurado, vehículo o conductor.',
    category: 'Historial',
    maxScore: 16,
    ruleType: 'Agregación histórica',
    active: true,
    conditions: [
      {
        id: 301,
        name: 'Asegurado con cuatro o más siniestros',
        evaluatedField: 'insuredClaimHistory',
        operator: '>=',
        minValue: 4,
        points: 16,
        resultDescription: 'El historial del asegurado supera el umbral esperado.',
      },
    ],
  },
  {
    id: 4,
    code: 'RF-04',
    name: 'Proveedor observado',
    description: 'Identifica proveedores restringidos o con alta recurrencia.',
    category: 'Proveedor',
    maxScore: 35,
    ruleType: 'Lista y recurrencia',
    active: true,
    conditions: [
      {
        id: 401,
        name: 'Proveedor restringido',
        evaluatedField: 'provider.isRestricted',
        operator: '=',
        points: 35,
        resultDescription: 'El proveedor requiere revisión antifraude especializada.',
      },
    ],
  },
  {
    id: 5,
    code: 'RF-05',
    name: 'Documentos inconsistentes',
    description: 'Detecta documentos faltantes, ilegibles o con inconsistencias.',
    category: 'Documentación',
    maxScore: 28,
    ruleType: 'Validación documental',
    active: true,
    conditions: [
      {
        id: 501,
        name: 'Documento inconsistente',
        evaluatedField: 'documents.inconsistencyDetected',
        operator: '=',
        points: 28,
        resultDescription: 'La documentación presenta señales críticas de revisión.',
      },
    ],
  },
  {
    id: 6,
    code: 'RF-06',
    name: 'Narrativa similar',
    description: 'Compara la descripción con reclamos previos para detectar similitud.',
    category: 'NLP',
    maxScore: 28,
    ruleType: 'Similitud textual',
    active: true,
    conditions: [
      {
        id: 601,
        name: 'Similitud mayor o igual a 85%',
        evaluatedField: 'narrativeSimilarity',
        operator: '>=',
        minValue: 85,
        points: 28,
        resultDescription: 'La narrativa puede haber sido reutilizada.',
      },
    ],
  },
  {
    id: 7,
    code: 'RF-07',
    name: 'Monto atípico',
    description: 'Evalúa montos cercanos a la suma asegurada o fuera del promedio.',
    category: 'Monto reclamado',
    maxScore: 18,
    ruleType: 'Umbral financiero',
    active: true,
    conditions: [
      {
        id: 701,
        name: 'Monto mayor o igual al 95%',
        evaluatedField: 'claimedAmount / insuredAmount',
        operator: '>=',
        minValue: 95,
        points: 18,
        resultDescription: 'El monto reclamado está muy cerca de la suma asegurada.',
      },
    ],
  },
  {
    id: 8,
    code: 'RF-08',
    name: 'Dinámica sospechosa',
    description: 'Analiza términos sensibles en la narrativa del evento.',
    category: 'Narrativa del evento',
    maxScore: 20,
    ruleType: 'Señales dinámicas',
    active: true,
    conditions: [
      {
        id: 801,
        name: 'Pérdida total por robo',
        evaluatedField: 'description',
        operator: 'contains',
        points: 20,
        resultDescription: 'La narrativa combina pérdida total con robo o hurto.',
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  listRules(): Observable<Rule[]> {
    return of(RULES).pipe(delay(120));
  }

  getRuleDetail(ruleId: number): Observable<Rule | undefined> {
    return of(RULES.find((rule) => rule.id === ruleId)).pipe(delay(80));
  }
}
