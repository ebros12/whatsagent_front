// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './featuring/login/login.component';
import { HomeComponent } from './featuring/home/home.component';

import { SocketComponent } from './featuring/socket/socket.component';



export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'socket', component: SocketComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },

];
