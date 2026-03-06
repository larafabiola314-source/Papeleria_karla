import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmacionService } from '../../services/confirmacion.service'; // 1. Importar el servicio

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  private servicioAuth = inject(Auth);
  private toast = inject(NotificacionService);
  private confirmar = inject(ConfirmacionService); // 2. Inyectar el servicio

  nombre = signal('');
  ap = signal('');
  am = signal('');
  username = signal('');
  password = signal('');
  listaUsuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  idEditando = signal<number | null>(null);
  idUsuarioLogueado = signal<number>(0);

  ngOnInit() {
    const datosUsuario = localStorage.getItem('usuario_logueado');
    if (datosUsuario) {
      const usuarioParseado = JSON.parse(datosUsuario);
      const idReal = usuarioParseado.Id_Usuario || usuarioParseado.id_usuario || usuarioParseado.id;
      this.idUsuarioLogueado.set(Number(idReal));
    }
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.servicioAuth.obtenerUsuarios().subscribe({
      next: (res: Usuario[]) => this.listaUsuarios.set(res),
      error: () => this.toast.mostrar('Error al cargar la lista de usuarios', 'error')
    });
  }

  registrarUsuario() {
    const datosUsuario = {
      id: this.idEditando(),
      nombre: this.nombre().trim(),
      ap: this.ap().trim(),
      am: this.am().trim(),
      username: this.username().trim(),
      password: this.password().trim()
    };

    if (!datosUsuario.nombre || !datosUsuario.ap || !datosUsuario.am || !datosUsuario.username) {
      this.toast.mostrar('Por favor, completa todos los campos obligatorios', 'error');
      return;
    }

    if (!this.idEditando()) {
      if (!datosUsuario.password) {
        this.toast.mostrar('Se requiere una contraseña para el nuevo usuario', 'error');
        return;
      }
      if (datosUsuario.password.length < 8) {
        this.toast.mostrar('La contraseña debe tener al menos 8 caracteres', 'error');
        return;
      }
    } else {
      if (datosUsuario.password && datosUsuario.password.length < 8) {
        this.toast.mostrar('La nueva contraseña debe tener al menos 8 caracteres', 'error');
        return;
      }
    }

    this.cargando.set(true);

    if (this.idEditando()) {
      this.servicioAuth.actualizarUsuario(datosUsuario).subscribe({
        next: (res: any) => this.procesarRespuesta(res, '¡Usuario actualizado con éxito!'),
        error: () => this.procesarError()
      });
    } else {
      this.servicioAuth.guardarUsuario(datosUsuario).subscribe({
        next: (res: any) => this.procesarRespuesta(res, '¡Usuario registrado correctamente!'),
        error: () => this.procesarError()
      });
    }
  }

  // 3. Convertir a async y usar el modal lila
  async eliminarUsuario(id: number) {
    if (id === this.idUsuarioLogueado()) {
      this.toast.mostrar('No puedes eliminar tu propia cuenta en sesión', 'error');
      return;
    }

    const acepto = await this.confirmar.preguntar(
      '¿Estás seguro de que deseas eliminar a este empleado? Esta acción es permanente y el usuario perderá acceso al sistema.'
    );

    if (acepto) {
      this.cargando.set(true);
      this.servicioAuth.eliminarUsuario(id).subscribe({
        next: (res: any) => {
          this.cargando.set(false);
          if (res.status === 'success') {
            this.toast.mostrar('Usuario eliminado del sistema', 'success');
            this.cargarUsuarios();
          } else {
            this.toast.mostrar('Error: ' + res.message, 'error');
          }
        },
        error: () => this.procesarError()
      });
    }
  }

  procesarRespuesta(res: any, mensajeExito: string) {
    this.cargando.set(false);
    if (res.status === 'success') {
      this.toast.mostrar(mensajeExito, 'success');
      this.limpiarCampos();
      this.cargarUsuarios();
    } else {
      this.toast.mostrar('Error: ' + res.message, 'error');
    }
  }

  procesarError() {
    this.cargando.set(false);
    this.toast.mostrar('Error de conexión con el servidor PHP', 'error');
  }

  limpiarCampos() {
    this.idEditando.set(null);
    this.nombre.set('');
    this.ap.set('');
    this.am.set('');
    this.username.set('');
    this.password.set('');
  }

  prepararEdicion(usuario: Usuario) {
    this.idEditando.set(usuario.Id_Usuario);
    this.nombre.set(usuario.Nombre);
    this.ap.set(usuario.AP);
    this.am.set(usuario.AM);
    this.username.set(usuario.Username);
    this.password.set('');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toast.mostrar('Editando datos de: ' + usuario.Nombre, 'success');
  }
}