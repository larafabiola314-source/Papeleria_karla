import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Producto } from '../../models/producto';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmacionService } from '../../services/confirmacion.service'; // 1. Importar servicio

export interface ProductoVenta extends Producto {
  cantidad: number;
  opcionesStock?: number[];
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {

  private notificacion = inject(NotificacionService);
  private servicioAuth = inject(Auth);
  private confirmar = inject(ConfirmacionService); // 2. Inyectar servicio

  listaProductos = signal<ProductoVenta[]>([]);
  terminoBusqueda = signal('');
  cargando = signal(false);

  ngOnInit() {
    this.cargarInventario();
  }

  cargarInventario() {
    this.servicioAuth.obtenerProductos().subscribe({
      next: (res: Producto[]) => {
        const productosConCantidad = res.map(p => ({ ...p, cantidad: 0,
          opcionesStock: Array.from({ length: p.Stock + 1 }, (_, i) => i) 
      }));
        this.listaProductos.set(productosConCantidad);
      },
      error: () => this.notificacion.mostrar('Error al cargar productos', 'error')
    });
  }

  totalVenta = computed(() => {
    return this.listaProductos().reduce((total, p) => total + (p.Precio * p.cantidad), 0);
  });

  totalUnidades = computed(() => {
    return this.listaProductos().reduce((total, p) => total + p.cantidad, 0);
  });

  productosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const productos = this.listaProductos();

    const filtrados = productos.filter(p => 
      p.Nombre.toLowerCase().includes(termino)
    );

    return filtrados.sort((a, b) => {
      if (a.cantidad > 0 && b.cantidad === 0) return -1;
      if (a.cantidad === 0 && b.cantidad > 0) return 1;
      return 0;
    });
  });

  cambiarCantidad(productoId: number, evento: any) {
    const nuevaCantidad = parseInt(evento.target.value, 10);
    this.listaProductos.update(productos => 
      productos.map(p => {
        if (p.Id_Producto === productoId) {
          return { ...p, cantidad: nuevaCantidad };
        }
        return p;
      })
    );
  }

  cambiarCantidadManual(producto: any, cambio: number) {
    const nuevaCantidad = producto.cantidad + cambio;
    if (nuevaCantidad >= 0 && nuevaCantidad <= producto.Stock) {
      this.cambiarCantidad(producto.Id_Producto, { target: { value: nuevaCantidad } });
    }
  }

  realizarVenta() {
    const productosVenta = this.listaProductos()
      .filter(p => p.cantidad > 0)
      .map(p => ({
        id_producto: p.Id_Producto,
        cantidad: p.cantidad,
        precio: p.Precio,
        subtotal: p.Precio * p.cantidad
      }));

    if (productosVenta.length === 0) return;
    const datosUsuario = localStorage.getItem('usuario_logueado');
    const idUsuario = datosUsuario ? JSON.parse(datosUsuario).Id_Usuario : 1; 

    const payload = {
      id_usuario: idUsuario,
      total: this.totalVenta(),
      productos: productosVenta
    };

    this.cargando.set(true);

    this.servicioAuth.registrarVenta(payload).subscribe({
      next: (res: any) => {
        this.cargando.set(false);
        if (res.status === 'success') {
          this.notificacion.mostrar('¡Venta registrada con éxito!', 'success');
          this.limpiarCarrito();
          this.cargarInventario();
        } else {
          this.notificacion.mostrar('Error: ' + res.message, 'error');
        }
      },
      error: () => {
        this.cargando.set(false);
        this.notificacion.mostrar('Error de conexión con el servidor', 'error');
      }
    });
  }

  // 3. Convertir a async y usar el modal personalizado
  async cancelarVenta() {
    const seguro = await this.confirmar.preguntar(
      '¿Seguro que deseas cancelar la venta actual? Se vaciarán todos los productos seleccionados.'
    );

    if (seguro) {
      this.limpiarCarrito();
      this.notificacion.mostrar('Venta cancelada', 'success');
    }
  }

  limpiarCarrito() {
    this.listaProductos.update(productos => 
      productos.map(p => ({ ...p, cantidad: 0 }))
    );
    this.terminoBusqueda.set('');
  }
}