import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MapViewerComponent } from './map-viewer/map-viewer.component';
import { ConfigComponent } from './config/config.component';
import { ResultComponent } from './result/result.component';
import { CalculationService } from './services/calculation.service';

// --- GUARDS (Segurança de Navegação) ---

// Guard 1: Protege a rota '/config'
// Só deixa passar se o usuário já tiver selecionado os pontos no mapa.
const hasGeoDataGuard: CanActivateFn = () => {
  const service = inject(CalculationService);
  const router = inject(Router);
  // Se tem dados, retorna TRUE (entra). Se não, redireciona para o início.
  return service.hasGeoData() ? true : router.createUrlTree(['/']);
};

// Guard 2: Protege a rota '/result'
// Só deixa passar se o usuário já tiver preenchido o formulário.
const hasConfigDataGuard: CanActivateFn = () => {
  const service = inject(CalculationService);
  const router = inject(Router);
  // Se tem config, retorna TRUE. Se não, manda voltar para a config.
  return service.hasConfigData() ? true : router.createUrlTree(['/config']);
};

export const routes: Routes = [
  { path: '', component: MapViewerComponent }, // Tela Inicial
  {
    path: 'config',
    component: ConfigComponent,
    canActivate: [hasGeoDataGuard], // Aplica proteção
  },
  {
    path: 'result',
    component: ResultComponent,
    canActivate: [hasConfigDataGuard], // Aplica proteção
  },
];