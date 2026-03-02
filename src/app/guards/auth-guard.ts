import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const ruteador = inject(Router);
  
  const usuarioActivo = localStorage.getItem('usuario_logueado');

  if (usuarioActivo) {
    return true;
  } else {
    ruteador.navigate(['/login']);
    return false;
  }
};