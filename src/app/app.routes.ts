import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MapViewerComponent } from './map-viewer/map-viewer.component';
import { ConfigComponent } from './config/config.component';
import { ResultComponent } from './result/result.component';
import { CalculationService } from './services/calculation.service';

// --- GUARDS (Proteção de Rota) ---

// Guard 1: Verifica se já temos Latitude/Longitude/Altitude
// Se não tiver, impede de entrar na tela de Config e manda pro Início
const hasGeoDataGuard: CanActivateFn = () => {
  const service = inject(CalculationService);
  const router = inject(Router);
  return service.hasGeoData() ? true : router.createUrlTree(['/']);
};

// Guard 2: Verifica se já temos as Configurações da Bomba
// Se não tiver, impede de entrar na tela de Resultado e manda pra Config
const hasConfigDataGuard: CanActivateFn = () => {
  const service = inject(CalculationService);
  const router = inject(Router);
  return service.hasConfigData() ? true : router.createUrlTree(['/config']);
};

// Definição das Rotas
export const routes: Routes = [
  { path: '', component: MapViewerComponent }, // Rota raiz (Mapa)
  {
    path: 'config',
    component: ConfigComponent,
    canActivate: [hasGeoDataGuard], // Protegida pelo Guard 1
  },
  {
    path: 'result',
    component: ResultComponent,
    canActivate: [hasConfigDataGuard], // Protegida pelo Guard 2
  },
];