import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CalculationService } from '../services/calculation.service';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Sun, MapPin, BrushCleaning, Navigation } from 'lucide-angular';

@Component({
  selector: 'app-map-viewer',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.css',
})
export class MapViewerComponent implements AfterViewInit {
  // Ícones do Lucide
  readonly Sun = Sun;
  readonly MapPin = MapPin;
  readonly BrushCleaning = BrushCleaning;
  readonly Navigation = Navigation;

  map!: L.Map; // Instância do mapa Leaflet
  
  // Dados brutos das coordenadas
  point1: any = null; 
  point2: any = null; 
  
  // Referências visuais (Marcadores) para poder remover depois
  marker1: L.Marker | null = null;
  marker2: L.Marker | null = null;

  alt1: number | null = null; 
  alt2: number | null = null; 
  distance: number | null = 0; 

  constructor(
    private router: Router,
    private calcService: CalculationService,
    private cdr: ChangeDetectorRef // Necessário para atualizar a tela após restaurar pontos
  ) {}

  async ngAfterViewInit() {
    // 1. Inicializa o mapa focado na região padrão
    this.map = L.map('map').setView([-15.326043, -49.117311], 14);

    // 2. Carrega as "telhas" (imagens) do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // 3. Ouve o clique no mapa para adicionar pontos
    this.map.on('click', (e: any) => this.addPoint(e.latlng));

    // 4. Verifica se já existem pontos salvos (ao voltar da tela de config) e os redesenha
    this.restorePoints();
    
    // 5. Força a detecção de mudanças para evitar erro "ExpressionChangedAfterItHasBeenChecked"
    this.cdr.detectChanges();
  }

  // Restaura o estado do mapa se o usuário voltou da próxima tela
  restorePoints() {
    const savedData = this.calcService.getGeoData();

    if (savedData) {
      this.alt1 = savedData.alt1;
      this.alt2 = savedData.alt2;
      this.distance = savedData.distance;

      // Recria Ponto 1 (Origem - Verde)
      if (savedData.point1) {
        this.point1 = new L.LatLng(savedData.point1.lat, savedData.point1.lng);
        this.marker1 = L.marker(this.point1, { icon: this.createColoredIcon('green') })
          .addTo(this.map);

        this.marker1.bindPopup(this.createPopupContent('Ponto de Captação', 1), {
          closeButton: false, autoClose: false, closeOnClick: false
        }).openPopup();
      }

      // Recria Ponto 2 (Destino - Vermelho)
      if (savedData.point2) {
        this.point2 = new L.LatLng(savedData.point2.lat, savedData.point2.lng);
        this.marker2 = L.marker(this.point2, { icon: this.createColoredIcon('red') })
          .addTo(this.map);

        this.marker2.bindPopup(this.createPopupContent('Reservatório', 2), {
          closeButton: false, autoClose: false, closeOnClick: false
        }).openPopup();
      }

      // Ajusta o zoom para mostrar os dois pontos
      if (this.point1 && this.point2) {
        const group = new L.FeatureGroup([this.marker1!, this.marker2!]);
        this.map.fitBounds(group.getBounds().pad(0.2));
      } else if (this.point1) {
        this.map.panTo(this.point1);
      }
    }
  }

  // Helper para criar ícones coloridos
  createColoredIcon(color: string) {
    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  // Cria o HTML do balão com um botão "X" personalizado que chama removePoint
  createPopupContent(title: string, type: 1 | 2): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';
    container.style.minWidth = '160px';

    const titleSpan = document.createElement('span');
    titleSpan.innerHTML = `<b>${title}</b>`;

    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&#10006;'; // Caractere X
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#ff4444'; 
    closeBtn.title = 'Remover ponto';

    // Ação de clique no X
    closeBtn.onclick = (e) => {
      e.stopPropagation(); // Impede clique no mapa
      this.removePoint(type);
    };

    container.appendChild(titleSpan);
    container.appendChild(closeBtn);

    return container;
  }

  // Adiciona ponto ao clicar no mapa
  async addPoint(latlng: L.LatLng) {
    if (!this.point1) {
      // Adiciona Origem
      this.point1 = latlng;
      this.marker1 = L.marker(latlng, { icon: this.createColoredIcon('green') }).addTo(this.map);
      
      // Abre popup sem o botão fechar padrão
      this.marker1.bindPopup(this.createPopupContent('Ponto de Captação', 1), {
        closeButton: false, autoClose: false, closeOnClick: false
      }).openPopup();

      this.alt1 = await this.getElevation(latlng.lat, latlng.lng);

    } else if (!this.point2) {
      // Adiciona Destino
      this.point2 = latlng;
      this.marker2 = L.marker(latlng, { icon: this.createColoredIcon('red') }).addTo(this.map);
      
      this.marker2.bindPopup(this.createPopupContent('Reservatório', 2), {
        closeButton: false, autoClose: false, closeOnClick: false
      }).openPopup();

      this.alt2 = await this.getElevation(latlng.lat, latlng.lng);

      // Calcula distância assim que tem os 2 pontos
      this.distance = this.calculateDistance(
        this.point1.lat, this.point1.lng, this.point2.lat, this.point2.lng
      );
    } else {
      alert('É necessário remover um ponto antes de adicionar outro.');
    }
  }

  // Remove o marcador do mapa e limpa a variável
  removePoint(type: 1 | 2) {
    if (type === 1 && this.marker1) {
      this.map.removeLayer(this.marker1);
      this.marker1 = null;
      this.point1 = null;
      this.alt1 = null;
    } else if (type === 2 && this.marker2) {
      this.map.removeLayer(this.marker2);
      this.marker2 = null;
      this.point2 = null;
      this.alt2 = null;
    }
    // Reseta distância pois falta um ponto
    this.distance = 0;
  }

  // Chama API externa para pegar altitude
  async getElevation(lat: number, lon: number): Promise<number> {
    try {
        const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`);
        const data = await res.json();
        return data.results[0].elevation;
    } catch (error) {
        console.error("Erro API Elevation", error);
        return 0; 
    }
  }

  // Fórmula de Haversine para distância geográfica
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  // Botão Confirmar Pontos
  confirm() {
    if (this.point1 && this.point2 && this.alt1 !== null && this.alt2 !== null) {
      // Recalcula para garantir
      this.distance = this.calculateDistance(
        this.point1.lat, this.point1.lng, this.point2.lat, this.point2.lng
      );

      // Salva no serviço e muda de página
      this.calcService.setGeoData({
        point1: { lat: this.point1.lat, lng: this.point1.lng },
        point2: { lat: this.point2.lat, lng: this.point2.lng },
        alt1: this.alt1,
        alt2: this.alt2,
        distance: this.distance,
      });

      this.router.navigate(['/config']);
    } else {
      alert('Selecione os dois pontos no mapa e aguarde o carregamento da altitude!');
    }
  }

  // Limpa tudo (chamado pelo botão Limpar)
  clearMap() {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });
    this.point1 = null; this.point2 = null;
    this.marker1 = null; this.marker2 = null;
    this.alt1 = null; this.alt2 = null;
    this.distance = 0;
  }
}