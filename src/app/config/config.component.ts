import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalculationService, GeoData } from '../services/calculation.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Settings, MapPinCheckInside, CircleArrowLeft, Calculator } from 'lucide-angular';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css',
})
export class ConfigComponent implements OnInit {
  readonly Settings = Settings;
  readonly MapPinCheckInside = MapPinCheckInside;
  readonly CircleArrowLeft = CircleArrowLeft;
  readonly Calculator = Calculator;

  geoData: GeoData | null = null;

  // Modelo dos dados do formulário
  formData: {
    type: string;
    depth: number | null;
    height: number | null;
    flow: number | null;
  } = {
    type: '',
    depth: null,
    height: null,
    flow: null,
  };

  constructor(
    private router: Router,
    private calcService: CalculationService
  ) {}

  ngOnInit() {
    // 1. Busca dados do mapa
    this.geoData = this.calcService.getGeoData();
    
    // Segurança: Se tentar acessar direto pela URL sem ter mapa, volta pro início
    if (!this.geoData) {
      this.router.navigate(['/']);
      return;
    }

    // 2. Restauração: Verifica se já tinha configuração salva no serviço
    const savedConfig = this.calcService.getConfigData();
    
    if (savedConfig) {
      // Se tiver, preenche o formulário para o usuário não precisar digitar de novo
      this.formData = {
        type: savedConfig.pumpType,
        depth: savedConfig.wellDepth,
        height: savedConfig.tankHeight,
        flow: savedConfig.flowRate
      };
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  submitConfig() {
    // 1. Validação de Campos Obrigatórios
    if (!this.formData.type || this.formData.depth === null || 
        this.formData.height === null || this.formData.flow === null) {
      alert('Por favor, preencha todos os campos para prosseguir.');
      return;
    }

    const depth = Number(this.formData.depth);
    const height = Number(this.formData.height);
    const flow = Number(this.formData.flow);

    // 2. Validação de Lógica (Não aceita negativos)
    if (depth < 0 || height < 0 || flow <= 0) {
      alert('Atenção: Os valores não podem ser negativos e a vazão deve ser maior que zero.');
      return;
    }

    // 3. Salva no serviço e avança
    this.calcService.setConfigData({
      pumpType: this.formData.type,
      wellDepth: depth,
      tankHeight: height,
      flowRate: flow,
    });

    this.router.navigate(['/result']);
  }
}