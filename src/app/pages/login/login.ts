import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 
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
  nombreUsuario = signal('');
  contrasenia = signal('');
  cargando = signal(false);

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

    if (!this.nombreUsuario().trim() || !this.contrasenia().trim()) {
      this.toast.mostrar('Por favor, ingresa tu usuario y contraseña', 'error');
      return;
    }

    this.cargando.set(true);
    
    this.servicioAuth.validarUsuario(this.nombreUsuario(), this.contrasenia())
    .pipe(finalize(() => this.cargando.set(false)))
    .subscribe({
      next: (respuesta: any) => {
        console.log('Respuesta de Laravel:', respuesta);
        if (respuesta.status === 'success') {
          localStorage.setItem('usuario_logueado', JSON.stringify(respuesta.usuario));
          
          this.toast.mostrar(`¡Bienvenido(a), ${respuesta.usuario.nombre}!`, 'success');
          this.router.navigate(['/inicio']);
        }
      },
      error: (err) => {
        // Manejo de errores de credenciales (401) o conexión 
        const mensaje = err.error?.message || 'Usuario o contraseña incorrectos';
        this.toast.mostrar(mensaje, 'error');
      }
    });
  }
}