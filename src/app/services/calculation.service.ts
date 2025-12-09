import { Injectable } from '@angular/core';

// Interface que define a estrutura dos dados vindos do Mapa
export interface GeoData {
  point1: { lat: number; lng: number };
  point2: { lat: number; lng: number };
  alt1: number;
  alt2: number;
  distance: number;
}

// Interface que define a estrutura dos dados vindos do Formulário
export interface ConfigData {
  pumpType: string;
  wellDepth: number;
  tankHeight: number;
  flowRate: number;
}

@Injectable({
  providedIn: 'root', // Singleton: O mesmo serviço é usado em toda a aplicação
})
export class CalculationService {
  // --- ESTADO DA APLICAÇÃO ---
  // Armazenam os dados enquanto o usuário navega entre as telas.
  // Se forem null, significa que o usuário ainda não preencheu.
  private geoData: GeoData | null = null;
  private configData: ConfigData | null = null;

  // Constante: Média de horas de sol pleno (insolação) considerada para o cálculo
  readonly SUN_HOURS = 5.5;

  // Salva os dados do Mapa (Latitude, Longitude, Altitude, Distância)
  setGeoData(data: GeoData) {
    this.geoData = data;
  }

  // Recupera os dados do Mapa
  getGeoData() {
    return this.geoData;
  }

  // Salva os dados de Configuração (Tipo de Bomba, Vazão, Alturas)
  setConfigData(data: ConfigData) {
    this.configData = data;
  }

  // Recupera os dados de Configuração
  getConfigData() {
    return this.configData;
  }

  // --- CÁLCULOS HIDRÁULICOS ---
  calculateResults() {
    // Segurança: Se faltar dado, não calcula
    if (!this.geoData || !this.configData) return null;

    const g = this.geoData;
    const c = this.configData;

    // 1. Comprimento da Tubulação:
    // Pega a distância geográfica e adiciona 10% de margem de segurança
    // para compensar curvas, conexões e desníveis do terreno.
    const pipingLength = g.distance * 1.1;

    // 2. Desnível Geográfico:
    // Diferença entre a altitude do destino e a origem.
    // Math.max(0, ...) garante que, se for descida, o valor seja 0 (gravidade ajuda).
    const geoHeight = Math.max(0, g.alt2 - g.alt1);

    // 3. Altura Manométrica Estática (AMT Estática):
    // Soma do desnível + profundidade do poço + altura da caixa d'água.
    const staticHead = geoHeight + c.wellDepth + c.tankHeight;

    // 4. Perda de Carga:
    // Estimativa simplificada de 10% sobre a altura estática.
    // (Em projetos complexos, usaria tabelas de atrito baseadas no diâmetro do cano).
    const frictionLoss = staticHead * 0.1;

    // 5. Altura Manométrica Total (AMT):
    // É a força total que a bomba precisa exercer (Altura + Resistência dos canos).
    const totalHead = staticHead + frictionLoss;

    // 6. Vazão Real:
    // Considera uma perda de eficiência de 10% na bomba (0.9).
    const realFlowRate = c.flowRate * 0.9;

    // 7. Volume Diário Estimado:
    // Vazão Real (m³/h) * Horas de Sol * 1000 (para converter para Litros).
    const dailyVolume = realFlowRate * this.SUN_HOURS * 1000;

    // Retorna o objeto pronto para ser exibido na tela de resultados
    return {
      pumpType:
        c.pumpType === 'submerged' ? 'Bomba Submersa' : 'Bomba de Superfície',
      distance: pipingLength,
      staticHead,
      totalHead,
      nominalFlow: c.flowRate * 1000,
      realFlow: realFlowRate * 1000,
      dailyVolume,
      geoData: g,
    };
  }

  // --- MÉTODOS AUXILIARES PARA GUARDS ---
  // Usados pelo roteador para saber se pode deixar o usuário entrar na página
  hasGeoData(): boolean {
    return !!this.geoData;
  }

  hasConfigData(): boolean {
    return !!this.configData;
  }
}