import { Component, AfterViewInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CalculationService } from '../services/calculation.service';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-viewer',
  imports: [MatIconModule, CommonModule],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.css',
})
export class MapViewerComponent implements AfterViewInit {
  map!: L.Map; // Instância do mapa Leaflet
  point1: any = null; // Ponto A (Captação)
  point2: any = null; // Ponto B (Reservatório)
  alt1: number | null = null; // Altitude A
  alt2: number | null = null; // Altitude B
  distance: number | null = 0; // Distância em linha reta

  constructor(
    private router: Router,
    private calcService: CalculationService
  ) {}

  // Executado após o HTML estar pronto (necessário para o mapa carregar a div 'map')
  async ngAfterViewInit() {
    // Inicializa o mapa focado em Goianésia/Região (-15.32...)
    this.map = L.map('map').setView([-15.326043, -49.117311], 14);

    // Adiciona a camada visual do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Adiciona o evento de clique no mapa
    this.map.on('click', (e: any) => this.addPoint(e.latlng));
  }

  // Função auxiliar para criar ícones coloridos (Verde = Origem, Vermelho = Destino)
  createColoredIcon(color: string) {
    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  // Lógica principal ao clicar no mapa
  async addPoint(latlng: L.LatLng) {
    if (!this.point1) {
      // 1. Se não tem ponto 1, define a Origem (Verde)
      this.point1 = latlng;
      L.marker(latlng, { icon: this.createColoredIcon('green') })
        .addTo(this.map)
        .bindPopup('Ponto de Captação')
        .openPopup();
      // Busca altitude da API
      this.alt1 = await this.getElevation(latlng.lat, latlng.lng);
    } else if (!this.point2) {
      // 2. Se já tem ponto 1 mas não tem o 2, define o Destino (Vermelho)
      this.point2 = latlng;
      L.marker(latlng, { icon: this.createColoredIcon('red') })
        .addTo(this.map)
        .bindPopup('Reservatório')
        .openPopup();
      // Busca altitude da API
      this.alt2 = await this.getElevation(latlng.lat, latlng.lng);

      // Calcula a distância geográfica (Linha Reta)
      this.distance = this.calculateDistance(
        this.point1.lat,
        this.point1.lng,
        this.point2.lat,
        this.point2.lng
      );
    } else {
      // 3. Se já tem os dois, avisa para limpar
      alert('Limpe o mapa para selecionar novos pontos.');
    }
  }

  // Busca a altitude usando a API open-elevation
  async getElevation(lat: number, lon: number): Promise<number> {
    const res = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
    );
    const data = await res.json();
    return data.results[0].elevation;
  }

  // Fórmula de Haversine para calcular distância entre coordenadas geográficas
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Raio da terra em metros
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em metros
  }

  // Botão Confirmar
  confirm() {
    if (
      this.point1 &&
      this.point2 &&
      this.alt1 !== null &&
      this.alt2 !== null
    ) {
      // Recalcula distância para garantir
      this.distance = this.calculateDistance(
        this.point1.lat,
        this.point1.lng,
        this.point2.lat,
        this.point2.lng
      );

      // Envia os dados crus para o Serviço
      this.calcService.setGeoData({
        point1: { lat: this.point1.lat, lng: this.point1.lng },
        point2: { lat: this.point2.lat, lng: this.point2.lng },
        alt1: this.alt1,
        alt2: this.alt2,
        distance: this.distance,
      });

      // Navega para a próxima tela (Config)
      this.router.navigate(['/config']);
    } else {
      alert(
        'Selecione os dois pontos no mapa e aguarde o carregamento da altitude!'
      );
    }
  }

  // Limpa o mapa e reseta as variáveis
  clearMap() {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
    this.point1 = null;
    this.point2 = null;
    this.alt1 = null;
    this.alt2 = null;
    this.distance = 0;
  }
}
