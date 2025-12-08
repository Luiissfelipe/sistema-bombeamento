import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CalculationService } from '../services/calculation.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-result',
  imports: [MatIconModule, CommonModule],
  providers: [DecimalPipe], // Necessário para usar o pipe number no HTML
  templateUrl: './result.component.html',
  styleUrl: './result.component.css',
})
export class ResultComponent implements OnInit {
  results: any = null;

  constructor(
    private router: Router,
    private calcService: CalculationService
  ) {}

  ngOnInit() {
    // Chama o método principal que cruza os dados do Mapa + Config e gera o relatório
    // O resultado já virá com a distância aumentada em 10%
    this.results = this.calcService.calculateResults();
  }

  // Botão "Novo Mapa" - Volta tudo pro início
  goBackToMap() {
    this.router.navigate(['/']);
  }

  // Botão "Reconfigurar" - Volta só para a tela anterior
  reconfigure() {
    this.router.navigate(['/config']);
  }
}
