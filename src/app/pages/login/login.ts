import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // [cite: 2026-02-21]
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { NotificacionService } from '../../services/notificacion.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Signals para capturar los datos del formulario [cite: 2026-02-20]
  nombreUsuario = signal('');
  contrasenia = signal('');
  cargando = signal(false);

  // Inyectamos el nuevo servicio AuthService [cite: 2026-02-21]
  private servicioAuth = inject(AuthService); 
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

    // Validación básica antes de enviar a Laravel [cite: 2025-11-23]
    if (!this.nombreUsuario().trim() || !this.contrasenia().trim()) {
      this.toast.mostrar('Por favor, ingresa tu usuario y contraseña', 'error');
      return;
    }

    this.cargando.set(true);
    
    // Petición al Backend de Laravel 12 [cite: 2026-02-21]
    this.servicioAuth.validarUsuario(this.nombreUsuario(), this.contrasenia())
    .pipe(finalize(() => this.cargando.set(false)))
    .subscribe({
      next: (respuesta: any) => {
        console.log('Respuesta de Laravel:', respuesta);
        if (respuesta.status === 'success') {
          // Guardamos el objeto usuario con sus nuevos campos en minúsculas [cite: 2025-11-23]
          localStorage.setItem('usuario_logueado', JSON.stringify(respuesta.usuario));
          
          // Accedemos a .nombre (en minúscula) como viene de la DB corregida [cite: 2025-11-23]
          this.toast.mostrar(`¡Bienvenido(a), ${respuesta.usuario.nombre}!`, 'success');
          this.router.navigate(['/inicio']);
        }
      },
      error: (err) => {
        // Manejo de errores de credenciales (401) o conexión [cite: 2025-11-23]
        const mensaje = err.error?.message || 'Usuario o contraseña incorrectos';
        this.toast.mostrar(mensaje, 'error');
      }
    });
  }
}