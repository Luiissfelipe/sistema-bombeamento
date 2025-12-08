import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalculationService, GeoData } from '../services/calculation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css',
})
export class ConfigComponent implements OnInit {
  geoData: GeoData | null = null;

  // Objeto do formulário
  formData = {
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
    this.geoData = this.calcService.getGeoData();
    // Se não tiver dados geográficos (acesso direto pela URL), volta ao mapa
    if (!this.geoData) {
      this.router.navigate(['/']);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  submitConfig() {
    // 1. Validação de Campos Obrigatórios
    if (
      !this.formData.type ||
      this.formData.depth === null ||
      this.formData.height === null ||
      this.formData.flow === null
    ) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Conversão para números para garantir a validação matemática
    const depth = Number(this.formData.depth);
    const height = Number(this.formData.height);
    const flow = Number(this.formData.flow);

    // 2. Validação de Valores Negativos
    // Profundidade e Altura podem ser 0, mas não negativos. Vazão deve ser maior que 0.
    if (depth < 0 || height < 0 || flow <= 0) {
      alert(
        'Atenção: Os valores não podem ser negativos e a vazão deve ser maior que zero.'
      );
      return;
    }

    // Se passou nas validações, salva e navega
    this.calcService.setConfigData({
      pumpType: this.formData.type,
      wellDepth: depth,
      tankHeight: height,
      flowRate: flow,
    });

    this.router.navigate(['/result']);
  }
}
