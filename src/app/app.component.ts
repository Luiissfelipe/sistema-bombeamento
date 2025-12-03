import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapViewerComponent } from './map-viewer/map-viewer.component';
import { ConfigComponent } from "./config/config.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MapViewerComponent, ConfigComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sistema-bombeamento';
}
