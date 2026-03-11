import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service'; 
import { VentaService } from '../../services/venta.service'; 
import { Producto } from '../../models/producto';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmacionService } from '../../services/confirmacion.service'; 
import { FormsModule } from '@angular/forms';

export interface ProductoVenta extends Producto {
  cantidad: number;
  opcionesStock?: number[];
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {

  private notificacion = inject(NotificacionService);
  private productoService = inject(ProductoService); 
  private ventaService = inject(VentaService); 
  private confirmar = inject(ConfirmacionService);

  listaProductos = signal<ProductoVenta[]>([]);
  terminoBusqueda = signal('');
  cargando = signal(false);

  ngOnInit() {
    this.cargarInventario();
  }

  cargarInventario() {
    this.productoService.obtenerProductos().subscribe({
      next: (res: Producto[]) => {
        const productosConCantidad = res.map(p => ({ ...p, cantidad: 0,
          opcionesStock: Array.from({ length: (p.stock || 0) + 1 }, (_, i) => i) 
      }));
        this.listaProductos.set(productosConCantidad);
      },
      error: () => this.notificacion.mostrar('Error al cargar productos', 'error')
    });
  }

  totalVenta = computed(() => {
    return this.listaProductos().reduce((total, p) => total + (p.precio * p.cantidad), 0);
  });

  totalUnidades = computed(() => {
    return this.listaProductos().reduce((total, p) => total + p.cantidad, 0);
  });

  productosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    const productos = this.listaProductos();

  
    const filtrados = productos.filter(p => 
      p.nombre.toLowerCase().includes(termino)
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
        if (p.id === productoId) {
          return { ...p, cantidad: nuevaCantidad };
        }
        return p;
      })
    );
  }

  cambiarCantidadManual(producto: any, cambio: number) {
    const nuevaCantidad = producto.cantidad + cambio;
    if (nuevaCantidad >= 0 && nuevaCantidad <= producto.stock) {
      this.cambiarCantidad(producto.id, { target: { value: nuevaCantidad } });
    }
  }

  validarStockDinamico(producto: any) {
    if (producto.cantidad === null || producto.cantidad === undefined) return; 

    if (producto.cantidad > producto.stock) {
      producto.cantidad = producto.stock;
      this.notificacion.mostrar(`Stock máximo alcanzado (${producto.stock} unidades)`, 'error');
    }

    if (producto.cantidad < 0) producto.cantidad = 0;
  }

  validarEntradaTeclado(producto: any, evento: any) {
    let valor = parseInt(evento.target.value, 10);
    if (isNaN(valor) || valor < 0) valor = 0;

    if (valor > producto.stock) {
      valor = producto.stock;
      this.notificacion.mostrar(`Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}`, 'error');
    }

    this.cambiarCantidad(producto.id, { target: { value: valor } });
  }

  realizarVenta() {
    const productosVenta = this.listaProductos()
      .filter(p => p.cantidad > 0)
      .map(p => ({
        id_producto: p.id,
        cantidad: p.cantidad,
        precio: p.precio,
        subtotal: p.precio * p.cantidad
      }));

    if (productosVenta.length === 0) return;
    
    const datosUsuario = localStorage.getItem('usuario_logueado');
    const idUsuario = datosUsuario ? JSON.parse(datosUsuario).id : 1; 

    const payload = {
      user_id: idUsuario, 
      total: this.totalVenta(),
      productos: productosVenta
    };

    this.cargando.set(true);

    this.ventaService.registrarVenta(payload).subscribe({
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

  async cancelarVenta() {
    const seguro = await this.confirmar.preguntar(
      '¿Seguro que deseas cancelar la venta actual?'
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