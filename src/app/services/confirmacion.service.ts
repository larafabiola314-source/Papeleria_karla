import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  public visible = signal(false);
  public mensaje = signal('');
  private resolver: any;

  preguntar(mensaje: string): Promise<boolean> {
    this.mensaje.set(mensaje);
    this.visible.set(true);
    return new Promise((res) => {
      this.resolver = res;
    });
  }

  responder(valor: boolean) {
    this.visible.set(false);
    if (this.resolver) this.resolver(valor);
  }
}