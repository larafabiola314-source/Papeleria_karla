// En tu notificacion.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  // Usamos un signal para que Angular detecte el cambio al instante
  public mensajeActual = signal<any>(null);

  mostrar(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.mensajeActual.set({ mensaje, tipo });
    
    // Se quita automáticamente tras 3 segundos
    setTimeout(() => {
      this.mensajeActual.set(null);
    }, 3000);
  }
}