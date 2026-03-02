import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  private servicioAuth = inject(Auth);

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
      error: () => console.error('Error al cargar usuarios')
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

    // Validaciones
    if (!datosUsuario.nombre || !datosUsuario.ap || !datosUsuario.am || !datosUsuario.username) {
      alert('Campos incompletos');
      return;
    }
    // La contraseña es obligatoria si es un nuevo usuario
    if (!this.idEditando() && !datosUsuario.password) {
      alert('Se requiere contraseña para un nuevo usuario');
      return;
    }

    //contraseña de al menos 8 caracteres
  if (!this.idEditando()) {
    //registro
    if (!datosUsuario.password) {
      alert('se necesita contraseña para un nuevo usuario');
      return;
    }
    if (datosUsuario.password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }
  } else {
    //editar
    if (datosUsuario.password && datosUsuario.password.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres. Deja el campo en blanco sí no quieres cambiarla');
      return;
    }
  }

    this.cargando.set(true);

    if (this.idEditando()) {
      this.servicioAuth.actualizarUsuario(datosUsuario).subscribe({
        next: (res: any) => this.procesarRespuesta(res, 'Usuario actualizado'),
        error: () => this.procesarError()
      });
    } else {
      this.servicioAuth.guardarUsuario(datosUsuario).subscribe({
        next: (res: any) => this.procesarRespuesta(res, 'Usuario guardado'),
        error: () => this.procesarError()
      });
    }
  }

  eliminarUsuario(id: number) {
    if (id === this.idUsuarioLogueado()) {
      alert('No puedes eliminar tu cuenta mientras estás en sesión.');
      return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.cargando.set(true);
      this.servicioAuth.eliminarUsuario(id).subscribe({
        next: (res: any) => {
          this.cargando.set(false);
          if (res.status === 'success') {
            this.cargarUsuarios();
          } else {
            alert('Error: ' + res.message);
          }
        },
        error: () => this.procesarError()
      });
    }
  }

  procesarRespuesta(res: any, mensajeExito: string) {
    this.cargando.set(false);
    if (res.status === 'success') {
      alert(mensajeExito);
      this.limpiarCampos();
      this.cargarUsuarios();
    } else {
      alert('Error: ' + res.message);
    }
  }

  procesarError() {
    this.cargando.set(false);
    alert('Error de conexión con el servidor');
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
  }

  
}