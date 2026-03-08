import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
      <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <h2 class="mb-6 text-xl font-black text-slate-800 text-center">Nueva Contraseña</h2>
        
        <div class="space-y-4">
          <input type="password" [(ngModel)]="password" placeholder="Nueva contraseña (mín. 8 caracteres)" 
                 class="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-lila-karla">
          
          <input type="password" [(ngModel)]="password_confirmation" placeholder="Confirmar contraseña" 
                 class="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-lila-karla">

          <button (click)="guardarNuevaPassword()" 
                  class="w-full rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white shadow-lg transition-all hover:bg-emerald-600">
            ACTUALIZAR CONTRASEÑA
          </button>
        </div>
      </div>
    </div>
  `
})
export class ResetPassword implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toast = inject(NotificacionService);

  token = '';
  email = '';
  password = signal('');
  password_confirmation = signal('');

  ngOnInit() {
    // Leemos los datos que Laravel mandó en la URL [cite: 2026-03-07]
    this.token = this.route.snapshot.queryParams['token'];
    this.email = this.route.snapshot.queryParams['email'];
  }

  guardarNuevaPassword() {
  // 1. Validar que los campos no estén vacíos [cite: 2026-03-07]
  if (!this.password() || !this.password_confirmation()) {
    this.toast.mostrar('Por favor, completa ambos campos', 'error'); 
    return;
  }

  // 2. Validar longitud mínima (seguridad básica) [cite: 2026-01-05, 2026-03-07]
  if (this.password().length < 8) {
    this.toast.mostrar('La contraseña debe tener al menos 8 caracteres', 'error'); 
    return;
  }

  // 3. Validar que coincidan [cite: 2026-03-07]
  if (this.password() !== this.password_confirmation()) {
    this.toast.mostrar('Las contraseñas no coinciden', 'error'); 
    return;
  }

  const datos = {
    token: this.token,
    email: this.email,
    password: this.password(),
    password_confirmation: this.password_confirmation()
  };

  this.http.post('http://localhost:8000/api/password/reset', datos)
    .subscribe({
      next: () => {
        this.toast.mostrar('¡Contraseña actualizada! Ya puedes iniciar sesión.', 'success'); 
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        // Mostramos el error específico de Laravel si el token expiró [cite: 2026-03-07]
        const msg = err.error?.error || 'El enlace ha expirado o es inválido';
        this.toast.mostrar(msg, 'error'); 
      }
    });
}
}