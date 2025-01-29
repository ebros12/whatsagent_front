import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';  // Importa el módulo de animaciones
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    BrowserModule,
    BrowserAnimationsModule,  // Proporciona el módulo de animaciones
    NoopAnimationsModule,
  ],
}).catch(err => console.error(err));
