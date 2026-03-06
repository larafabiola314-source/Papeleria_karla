import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Mantenemos los signals para capturar lo que el usuario escribe
  nombreUsuario = signal('');
  contrasenia = signal('');
  cargando = signal(false);

  private servicioAuth = inject(Auth);
  private toast = inject(NotificacionService);
  private router = inject(Router);

  actualizarUsuario(evento: Event) {
    const elemento = evento.target as HTMLInputElement;
    this.nombreUsuario.set(elemento.value);
  }

  actualizarPassword(evento: Event) {
    const elemento = evento.target as HTMLInputElement;
    this.contrasenia.set(elemento.value);
  }

  iniciarSesion(evento: Event) {
    evento.preventDefault();

    if (!this.nombreUsuario().trim() || !this.contrasenia().trim()) {
      this.toast.mostrar('Por favor, ingresa tu usuario y contraseña', 'error');
      return;
    }

    this.cargando.set(true);
    
    // Llamamos al servicio (que ahora apunta a Laravel)
    this.servicioAuth.validarUsuario(this.nombreUsuario(), this.contrasenia())
    .pipe(finalize(() => this.cargando.set(false)))
    .subscribe({
      next: (respuesta: any) => {
        // Laravel devuelve 'status' y el objeto 'usuario'
        if (respuesta.status === 'success') {
          // Guardamos el usuario (Laravel lo manda con id, nombre, ap, am en minúsculas)
          localStorage.setItem('usuario_logueado', JSON.stringify(respuesta.usuario));
          
          this.toast.mostrar(`¡Bienvenido(a), ${respuesta.usuario.nombre}!`, 'success');
          this.router.navigate(['/inicio']);
        }
      },
      error: (err) => {
        // Si Laravel devuelve 401, el error cae aquí
        const mensaje = err.error?.message || 'Error de conexión';
        this.toast.mostrar(mensaje, 'error');
      }
    });
  }
}