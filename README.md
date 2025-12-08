# Sistema de Dimensionamento de Bombeamento Solar ☀️💧

Este projeto é uma aplicação web desenvolvida em **Angular** para auxiliar no dimensionamento técnico de sistemas de bombeamento de água movidos a energia solar.

O sistema permite que o usuário selecione pontos geográficos em um mapa, configura parâmetros do poço e da bomba, e recebe automaticamente os cálculos de altura manométrica, perdas de carga e estimativa de volume diário de água.

## 🚀 Funcionalidades

-   **Mapa Interativo (Leaflet):** Seleção visual do ponto de captação (origem) e do reservatório (destino).
-   **Altimetria Automática:** Integração com a **Open Elevation API** para obter a altitude exata dos pontos selecionados.
-   **Cálculo de Distância:** Uso da fórmula de Haversine para precisão geográfica, com acréscimo automático de margem de segurança para tubulações.
-   **Configuração Paramétrica:** Definição de tipo de bomba, profundidade do poço, altura da caixa d'água e vazão nominal.
-   **Resultados Detalhados:**
    -   Cálculo da Altura Manométrica Total (AMT).
    -   Estimativa de Perda de Carga.
    -   Cálculo de Vazão Real (considerando perdas de eficiência).
    -   Volume diário estimado com base na insolação média (5.5h/sol pleno).
-   **Proteção de Rotas (Guards):** O usuário só pode avançar para as telas de configuração e resultado se tiver preenchido os dados anteriores.

## 🛠️ Tecnologias Utilizadas

-   **Frontend:** [Angular 17+](https://angular.io/) (Standalone Components)
-   **Mapas:** [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)
-   **API de Elevação:** [Open Elevation API](https://open-elevation.com/)
-   **Estilização:** CSS3 com Flexbox (Design Responsivo)
-   **Ícones:** Angular Material Icons

## ⚙️ Instalação e Execução

Pré-requisitos: Node.js e Angular CLI instalados.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Luiissfelipe/sistema-bombeamento.git](https://github.com/Luiissfelipe/sistema-bombeamento.git)
    cd seu-projeto
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Execute o servidor de desenvolvimento:**
    ```bash
    ng serve
    ```

4.  **Acesse a aplicação:**
    Abra o navegador em `http://localhost:4200/`.

## 📐 Lógica de Cálculos

O sistema utiliza as seguintes premissas técnicas implementadas no `CalculationService`:

1.  **Comprimento da Tubulação:**
    * Distância em linha reta (Haversine) + **10%** (margem para curvas, conexões e relevo).
2.  **Desnível Geográfico:**
    * `Altitude Destino - Altitude Origem`. (O sistema considera valores negativos, ou seja, desníveis favoráveis onde a gravidade auxilia o fluxo).
3.  **Altura Manométrica Estática:**
    * `Desnível + Profundidade do Poço + Altura da Caixa`.
4.  **Perda de Carga:**
    * Estimada em **10%** da Altura Estática.
5.  **Vazão Real:**
    * Considera-se **90%** da vazão nominal da bomba (perda de eficiência de 10%).
6.  **Volume Diário:**
    * `Vazão Real (L/h) * 5.5 horas`.

## 📂 Estrutura do Projeto

```text
src/app/
├── config/           # Componente de formulário e validação
├── map-viewer/       # Componente do mapa interativo (Leaflet)
├── result/           # Componente de exibição do relatório final
├── services/         # CalculationService (Lógica de negócios e estado)
├── app.routes.ts     # Definição de rotas e Guards
└── ...