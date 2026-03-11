import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-solicitar-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <div class="mb-8 text-center">
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-lila-karla mb-4">
            <span class="material-symbols-outlined !text-4xl">lock_reset</span>
          </div>
          <h1 class="text-2xl font-black text-slate-800">Recuperar Acceso</h1>
          <p class="text-sm font-medium text-slate-400">Enviaremos un enlace a tu Gmail</p>
        </div>

        <div class="space-y-4">
          <div class="relative group">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-lila-karla transition-colors material-symbols-outlined !text-xl">mail</span>
            <input type="email" [(ngModel)]="email" placeholder="Correo electrónico" 
                   class="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:border-lila-karla focus:bg-white">
          </div>

          <button (click)="enviarEnlace()" [disabled]="cargando()"
                  class="w-full rounded-2xl bg-lila-karla py-4 text-sm font-black text-white shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
            {{ cargando() ? 'ENVIANDO...' : 'ENVIAR ENLACE' }}
          </button>

          <a routerLink="/login" class="block text-center text-xs font-bold text-slate-400 hover:text-lila-karla mt-4">
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  `
})
export class SolicitarReset {
  private http = inject(HttpClient);
  private toast = inject(NotificacionService);
  email = signal('');
  cargando = signal(false);

  enviarEnlace() {
  if (!this.email()) {
    this.toast.mostrar('Por favor, escribe tu correo', 'error'); 
    return;
  }
  this.cargando.set(true);
  
  this.http.post('https://papeleriaback.papeleriakarla.com/api/password/email', { email: this.email() })
    .subscribe({
      next: () => {
        this.toast.mostrar('¡Listo! Revisa tu bandeja de entrada en Gmail', 'success'); 
        this.cargando.set(false);
      },
      error: () => {
        this.toast.mostrar('No pudimos encontrar ese correo en el sistema', 'error'); 
        this.cargando.set(false);
      }
    });
}
}