import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalculationService } from '../services/calculation.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { LucideAngularModule, Activity, Sun, CircleAlert, MapPinPlus, Settings } from 'lucide-angular';

@Component({
  selector: 'app-result',
  imports: [CommonModule, LucideAngularModule],
  providers: [DecimalPipe], // Permite usar o pipe {{ value | number }}
  templateUrl: './result.component.html',
  styleUrl: './result.component.css',
})
export class ResultComponent implements OnInit {
  readonly Activity = Activity;
  readonly Sun = Sun;
  readonly CircleAlert = CircleAlert;
  readonly MapPinPlus  = MapPinPlus ;
  readonly Settings = Settings;

  results: any = null;

  constructor(
    private router: Router,
    private calcService: CalculationService
  ) {}

  ngOnInit() {
    // Ao carregar, pede ao serviço para cruzar os dados (Mapa + Config) e calcular
    this.results = this.calcService.calculateResults();
  }

  // Botão "Novo Mapa" - Reseta a aplicação
  goBackToMap() {
    // 1. Apaga os dados geográficos do serviço (forçando null)
    this.calcService.setGeoData(null as any);
    
    // 2. Apaga as configurações do serviço
    this.calcService.setConfigData(null as any);

    // 3. Volta para a home. Como o serviço está limpo, o MapViewer carregará zerado.
    this.router.navigate(['/']);
  }

  // Botão "Reconfigurar" - Apenas volta, mantendo os dados
  reconfigure() {
    this.router.navigate(['/config']);
  }
}