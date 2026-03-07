import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  // Usamos inject en lugar del constructor para seguir el estándar moderno de Angular
  private ruteador = inject(Router);
  rolUsuario = signal<string>('user');

  tituloPagina = 'PUNTO DE VENTA';
  subtituloPagina = 'Papelería Karla - Registro de Transacciones';
  rutaActual = '';

  nombreUsuarioLogueado = signal('Usuario');
  menuAbierto = signal(false);

  ngOnInit() {
    // 1. Obtener nombre del usuario desde el nuevo JSON de Laravel
    const datos = localStorage.getItem('usuario_logueado');
    if (datos) {
      const usuario = JSON.parse(datos);
      this.nombreUsuarioLogueado.set(usuario.nombre || usuario.username || 'Usuario');
      this.rolUsuario.set(usuario.role || 'user');
    }

    // 2. Suscribirse a eventos de ruta
    this.ruteador.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.rutaActual = event.url;
      this.actualizarTextos(event.url);
      this.menuAbierto.set(false);
    });
  }

  toggleMenu() {
    this.menuAbierto.update(valor => !valor);
  }

  actualizarTextos(url: string) {
    if (url.includes('inventario')) {
      this.tituloPagina = 'GESTIÓN DE INVENTARIO';
      this.subtituloPagina = 'Panel de control de productos y existencias';
    } else if (url.includes('usuarios')) {
      this.tituloPagina = 'GESTIÓN DE PERSONAL';
      this.subtituloPagina = 'Administra las cuentas de los empleados';
    } else if (url.includes('ventas')) {
      this.tituloPagina = 'PUNTO DE VENTA';
      this.subtituloPagina = 'Papelería Karla - Registro de transacciones';
    } else {
      this.tituloPagina = 'DASHBOARD';
      this.subtituloPagina = 'Panel de Administración';
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario_logueado');
    this.ruteador.navigate(['/login']);
  }
}