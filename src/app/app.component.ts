import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Para usar las rutas dentro del componente

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],  // Aquí importamos RouterOutlet para que las rutas se rendericen
  template: `<router-outlet></router-outlet>`, // Usamos router-outlet para mostrar las vistas de las rutas
})
export class AppComponent {}
