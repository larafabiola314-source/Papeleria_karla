import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

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
  mensajeError = signal('');
  cargando = signal(false);

  private servicioAuth = inject(Auth);
  constructor(private router: Router) {}

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
    this.mensajeError.set('');

    if (this.cargando()) return;

    this.mensajeError.set('');
    this.cargando.set(true);
    
    this.servicioAuth.validarUsuario(this.nombreUsuario(), this.contrasenia())
    .pipe(
    finalize(() => this.cargando.set(false))
  )
    .subscribe({
      next: (respuesta) => {
        if (respuesta.status === 'success') {
          localStorage.setItem('usuario_logueado', JSON.stringify(respuesta.usuario));
          this.router.navigate(['/inicio']);
        } else {
          this.mensajeError.set('Usuario o contraseña incorrectos. Verifica tus datos.');
        }
      },
      error: () => {
        this.mensajeError.set('Error de conexión');
      }
    });
  }
}