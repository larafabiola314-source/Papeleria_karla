
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  public mensajeActual = signal<any>(null);

  mostrar(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.mensajeActual.set({ mensaje, tipo });
    
    setTimeout(() => {
      this.mensajeActual.set(null);
    }, 3000);
  }
}