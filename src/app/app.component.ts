import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapViewerComponent } from './map-viewer/map-viewer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MapViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sistema-bombeamento';
}
