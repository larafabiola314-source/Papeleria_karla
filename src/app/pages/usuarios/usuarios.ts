import { FormsModule } from '@angular/forms';
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service'; //
import { Usuario } from '../../models/usuario';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmacionService } from '../../services/confirmacion.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  // Inyectamos el servicio especializado
  private usuarioService = inject(UsuarioService);
  private toast = inject(NotificacionService);
  private confirmar = inject(ConfirmacionService);
  
  nombre = signal('');
  ap = signal('');
  am = signal('');
  username = signal('');
  password = signal('');
  listaUsuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  idEditando = signal<number | null>(null);
  idUsuarioLogueado = signal<number>(0);
  role = signal<'admin' | 'user'>('user');
  email = signal('');

  ngOnInit() {
    const datosUsuario = localStorage.getItem('usuario_logueado');
    if (datosUsuario) {
      const usuarioParseado = JSON.parse(datosUsuario);
      // Laravel devuelve 'id' en minúsculas
      const idReal = usuarioParseado.id; 
      this.idUsuarioLogueado.set(Number(idReal));
    }
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (res: Usuario[]) => this.listaUsuarios.set(res),
      error: () => this.toast.mostrar('Error al cargar la lista de usuarios', 'error')
    });
  }

  registrarUsuario() {

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const usernameValido = /^[a-zA-Z0-0.]+$/;

    const datosUsuario = {
      id: this.idEditando(),
      nombre: this.nombre().trim(),
      ap: this.ap().trim(),
      am: this.am().trim(),
      username: this.username().trim(),
      email: this.email().trim(),
      password: this.password().trim(),
      role: this.role() 
    };

    if (!soloLetras.test(datosUsuario.nombre) || !soloLetras.test(datosUsuario.ap) || !soloLetras.test(datosUsuario.am)) {
    this.toast.mostrar('Los nombres y apellidos solo deben contener letras', 'error'); 
    return;
    }

    if (!usernameValido.test(datosUsuario.username)) {
    this.toast.mostrar('El username solo permite letras, números y puntos', 'error'); 
    return;
    } 

    if (!datosUsuario.nombre || !datosUsuario.ap || !datosUsuario.am || !datosUsuario.username || !datosUsuario.email) {
      this.toast.mostrar('Por favor, completa todos los campos obligatorios', 'error');
      return;
    }

    // Validaciones de contraseña
    if (!this.idEditando() && (!datosUsuario.password || datosUsuario.password.length < 8)) {
      this.toast.mostrar('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    this.cargando.set(true);

    // Usamos el método unificado guardarUsuario (POST o PUT)
    this.usuarioService.guardarUsuario(datosUsuario).subscribe({
      next: (res: any) => this.procesarRespuesta(res, this.idEditando() ? '¡Usuario actualizado!' : '¡Usuario registrado!'),
      error: () => this.procesarError()
    });
  }

  async eliminarUsuario(id: number) {
    if (id === this.idUsuarioLogueado()) {
      this.toast.mostrar('No puedes eliminar tu propia cuenta', 'error');
      return;
    }

    const acepto = await this.confirmar.preguntar(
      '¿Estás seguro de que deseas eliminar a este empleado?'
    );

    if (acepto) {
      this.cargando.set(true);
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: (res: any) => {
          this.cargando.set(false);
          this.toast.mostrar('Usuario eliminado del sistema', 'success');
          this.cargarUsuarios();
        },
        error: () => this.procesarError()
      });
    }
  }

  procesarRespuesta(res: any, mensajeExito: string) {
    this.cargando.set(false);
    this.toast.mostrar(mensajeExito, 'success');
    this.limpiarCampos();
    this.cargarUsuarios();
  }

  procesarError() {
    this.cargando.set(false);
    this.toast.mostrar('Error de conexión con Laravel', 'error');
  }

  limpiarCampos() {
    this.idEditando.set(null);
    this.nombre.set('');
    this.ap.set('');
    this.am.set('');
    this.username.set('');
    this.email.set(''),
    this.password.set('');
    this.role.set('user');
  }

  prepararEdicion(usuario: Usuario) {
    // Sincronizamos con las propiedades en minúsculas del modelo
    this.idEditando.set(usuario.id);
    this.nombre.set(usuario.nombre);
    this.ap.set(usuario.ap);
    this.am.set(usuario.am);
    this.username.set(usuario.username);
    this.email.set(usuario.email);
    this.password.set('');
    this.role.set(usuario.role);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toast.mostrar('Editando datos de: ' + usuario.nombre, 'success');
  }
}