import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Importa os dados de localização do Angular para Português
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// Registra os dados (formatação de data, números, moeda)
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Define o ID global da aplicação como 'pt-BR'
    // Isso faz o pipe | number usar vírgula para decimais automaticamente
    { provide: LOCALE_ID, useValue: 'pt-BR' } 
  ]
};