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
  nombreUsuario = signal('');
  contrasenia = signal('');
  cargando = signal(false);

  private servicioAuth = inject(Auth);
  private toast = inject(NotificacionService); // 2. Inyectar el servicio
  private router = inject(Router); // Usando inject para mayor consistencia

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

    // Validación básica antes de enviar
    if (!this.nombreUsuario().trim() || !this.contrasenia().trim()) {
      this.toast.mostrar('Por favor, ingresa tu usuario y contraseña', 'error');
      return;
    }

    if (this.cargando()) return;

    this.cargando.set(true);
    
    this.servicioAuth.validarUsuario(this.nombreUsuario(), this.contrasenia())
    .pipe(
      finalize(() => this.cargando.set(false))
    )
    .subscribe({
      next: (respuesta) => {
        if (respuesta.status === 'success') {
          localStorage.setItem('usuario_logueado', JSON.stringify(respuesta.usuario));
          
          // Mensaje de bienvenida antes de redirigir
          this.toast.mostrar(`¡Bienvenido(a), ${respuesta.usuario.Nombre}!`, 'success');
          
          this.router.navigate(['/inicio']);
        } else {
          // Reemplazamos el signal de error por un Toast
          this.toast.mostrar('Usuario o contraseña incorrectos', 'error');
        }
      },
      error: () => {
        this.toast.mostrar('Error de conexión con el servidor', 'error');
      }
    });
  }
}