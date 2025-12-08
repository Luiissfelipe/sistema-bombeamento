import { Injectable } from '@angular/core';

// Interface para tipar os dados geográficos (vêm do Mapa)
export interface GeoData {
  point1: { lat: number; lng: number };
  point2: { lat: number; lng: number };
  alt1: number;
  alt2: number;
  distance: number;
}

// Interface para tipar os dados de configuração (vêm do Formulário)
export interface ConfigData {
  pumpType: string;
  wellDepth: number;
  tankHeight: number;
  flowRate: number;
}

@Injectable({
  providedIn: 'root', // Torna o serviço acessível em toda a aplicação (Singleton)
})
export class CalculationService {
  // Variáveis para armazenar o estado da aplicação enquanto o usuário navega
  private geoData: GeoData | null = null;
  private configData: ConfigData | null = null;

  // Constante de horas de sol pleno para o cálculo (média)
  readonly SUN_HOURS = 5.5;

  // Salva os dados vindos do componente de Mapa
  setGeoData(data: GeoData) {
    this.geoData = data;
  }

  // Recupera os dados do Mapa
  getGeoData() {
    return this.geoData;
  }

  // Salva os dados vindos do formulário de Configuração
  setConfigData(data: ConfigData) {
    this.configData = data;
  }

  // Recupera os dados de Configuração
  getConfigData() {
    return this.configData;
  }

  // O MÉTODO PRINCIPAL: Realiza todos os cálculos hidráulicos
  calculateResults() {
    // Se faltar algum dado, não calcula e retorna null
    if (!this.geoData || !this.configData) return null;

    const g = this.geoData;
    const c = this.configData;

    // Adiciona 10% à distância geográfica para considerar curvas e conexões da tubulação
    // Ex: Se a distância reta é 1000m, vira 1100m.
    const pipingLength = g.distance * 1.1;

    // 1. Cálculo do Desnível Geográfico (Altura Destino - Altura Origem)
    // Math.max(0, ...) garante que não seja negativo se bombear para baixo
    const geoHeight = Math.max(0, g.alt2 - g.alt1);

    // 2. Altura Manométrica Estática (Desnível + Profundidade Poço + Altura Caixa)
    const staticHead = geoHeight + c.wellDepth + c.tankHeight;

    // 3. Perda de Carga (Estimativa simplificada de 10% da altura estática)
    // Em projetos reais, isso usaria o pipingLength e tabelas de atrito, mas mantivemos a lógica simplificada
    const frictionLoss = staticHead * 0.1;

    // 4. Altura Manométrica Total (AMT) = Estática + Perdas
    const totalHead = staticHead + frictionLoss;

    // 5. Vazão Real (Estimativa de perda de eficiência de 10% na bomba)
    const realFlowRate = c.flowRate * 0.9;

    // 6. Volume Diário (Vazão Real x Horas de Sol)
    // Multiplica por 1000 para converter m³ para Litros
    const dailyVolume = realFlowRate * this.SUN_HOURS * 1000;

    // Retorna o objeto completo para ser exibido na tela de resultados
    return {
      pumpType:
        c.pumpType === 'submerged' ? 'Bomba Submersa' : 'Bomba de Superfície',
      distance: pipingLength, // Retorna o valor JÁ COM OS 10% ADICIONADOS
      staticHead,
      totalHead,
      nominalFlow: c.flowRate * 1000,
      realFlow: realFlowRate * 1000,
      dailyVolume,
      geoData: g,
    };
  }

  // Métodos auxiliares para os Guards (proteção de rotas) verifiquem se há dados
  hasGeoData(): boolean {
    return !!this.geoData;
  }

  hasConfigData(): boolean {
    return !!this.configData;
  }
}
