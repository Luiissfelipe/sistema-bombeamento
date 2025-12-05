import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-viewer',
  imports: [MatIconModule],
  templateUrl: './map-viewer.component.html',
  styleUrl: './map-viewer.component.css',
})
export class MapViewerComponent implements AfterViewInit {
  map!: L.Map;
  point1: any = null;
  point2: any = null;
  alt1: number | null = null;
  alt2: number | null = null;
  distance: number | null = 0;

  async ngAfterViewInit() {
    this.map = L.map('map').setView([-15.326043, -49.117311], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('click', (e: any) => this.addPoint(e.latlng));
  }

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

  async addPoint(latlng: L.LatLng) {
    if (!this.point1) {
      this.point1 = latlng;
      L.marker(latlng, { icon: this.createColoredIcon('green') })
        .addTo(this.map)
        .bindPopup('Ponto de Captação')
        .openPopup();
      this.alt1 = await this.getElevation(latlng.lat, latlng.lng);
    } else if (!this.point2) {
      this.point2 = latlng;
      L.marker(latlng, { icon: this.createColoredIcon('red') })
        .addTo(this.map)
        .bindPopup('Reservatório')
        .openPopup();
      this.alt2 = await this.getElevation(latlng.lat, latlng.lng);
    } else {
      alert('Limpe o mapa para selecionar novos pontos.');
    }
  }

  async getElevation(lat: number, lon: number): Promise<number> {
    const res = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
    );
    const data = await res.json();
    return data.results[0].elevation;
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // raio da Terra em metros
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

    return R * c;
  }

  confirm() {
    if (this.alt1 !== null && this.alt2 !== null) {
      this.distance = this.calculateDistance(
        this.point1.lat,
        this.point1.lng,
        this.point2.lat,
        this.point2.lng
      );

      console.log(
        `Ponto 1: ${this.point1} - Altitude ${this.alt1} metros
        Ponto 2: ${this.point2} - Altitude ${this.alt2} metros
        Distancia: ${this.distance} metros`
      );
    } else {
      alert('Selecione os pontos no mapa!');
    }
  }
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
