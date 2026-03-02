import { Routes } from '@angular/router';

import { Inicio } from './pages/inicio/inicio';
import { Inventario } from './pages/inventario/inventario';
import { Ventas } from './pages/ventas/ventas';
import { Usuarios } from './pages/usuarios/usuarios';
import { Login } from './pages/login/login';
import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // login sin el menu de arriba
  { path: 'login', component: Login },

  // Rutas con menú 
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'inicio', component: Inicio },
      { path: 'inventario', component: Inventario },
      { path: 'ventas', component: Ventas },
      { path: 'usuarios', component: Usuarios },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },

  // errores de 404
  { path: '**', redirectTo: 'login' }
];
