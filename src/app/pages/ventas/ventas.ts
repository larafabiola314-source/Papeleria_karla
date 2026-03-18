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
  activo?: boolean; // Añadimos activo como opcional para evitar errores de TypeScript
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
        // Filtramos para asegurar que solo se muestren productos activos
        const productosConCantidad = (res as any[])
          .filter(p => p.activo === true || p.activo === 1 || p.activo === undefined)
          .map(p => ({ 
            ...p, 
            cantidad: 0 
          }));
        this.listaProductos.set(productosConCantidad);
      },
      error: () => this.notificacion.mostrar('Error al cargar productos', 'error')
    });
  }

  // AHORA TENEMOS EL CARRITO COMO SEÑAL COMPUTADA CENTRAL
  carrito = computed(() => {
    return this.listaProductos().filter(p => p.cantidad > 0);
  });

  // LOS TOTALES SE CALCULAN DIRECTO DEL CARRITO
  totalVenta = computed(() => {
    return this.carrito().reduce((total, p) => total + (p.precio * p.cantidad), 0);
  });

  totalUnidades = computed(() => {
    return this.carrito().reduce((total, p) => total + p.cantidad, 0);
  });

  productosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    return this.listaProductos().filter(p => 
      p.nombre.toLowerCase().includes(termino) || 
      p.id.toString().includes(termino)
    ).sort((a, b) => {
      if (a.cantidad > 0 && b.cantidad === 0) return -1;
      if (a.cantidad === 0 && b.cantidad > 0) return 1;
      return 0;
    });
  });

  // FUNCIÓN ÚNICA Y SEGURA PARA ACTUALIZAR CANTIDADES
  actualizarCantidad(productoId: number, nuevaCantidad: number) {
    this.listaProductos.update(productos => 
      productos.map(p => {
        if (p.id === productoId) {
          let cantidadValidada = Math.max(0, Math.min(nuevaCantidad, p.stock));
          
          if (nuevaCantidad > p.stock) {
            this.notificacion.mostrar(`Stock insuficiente de ${p.nombre}. Máximo: ${p.stock}`, 'error');
          }
          
          return { ...p, cantidad: cantidadValidada };
        }
        return p;
      })
    );
  }

  cambiarCantidadManual(producto: ProductoVenta, cambio: number) {
    const nuevaCantidad = (producto.cantidad || 0) + cambio;
    this.actualizarCantidad(producto.id, nuevaCantidad);
  }

  // ESTA ES LA FUNCIÓN QUE SE EJECUTA AL DAR "ENTER" O SALIR DEL INPUT
  validarEntradaTeclado(producto: ProductoVenta, evento: any) {
    const valor = parseInt(evento.target.value, 10);
    const cantidadFinal = isNaN(valor) ? 0 : valor;
    this.actualizarCantidad(producto.id, cantidadFinal);
  }

  realizarVenta() {
    const itemsVenta = this.carrito().map(p => ({
      id_producto: p.id,
      cantidad: p.cantidad,
      precio: p.precio,
      subtotal: p.precio * p.cantidad
    }));

    if (itemsVenta.length === 0) {
      this.notificacion.mostrar('Agregue al menos un producto al ticket', 'error');
      return;
    }
    
    const datosUsuario = localStorage.getItem('usuario_logueado');
    const idUsuario = datosUsuario ? JSON.parse(datosUsuario).id : 1; 

    const payload = {
      user_id: idUsuario, 
      total: this.totalVenta(),
      productos: itemsVenta
    };

    this.cargando.set(true);

    this.ventaService.registrarVenta(payload).subscribe({
      next: (res: any) => {
        this.cargando.set(false);
        this.notificacion.mostrar('¡Venta registrada con éxito!', 'success');
        this.limpiarCarrito();
        this.cargarInventario(); 
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err.error?.message || 'Hubo un problema al procesar la venta';
        this.notificacion.mostrar(msg, 'error');
      }
    });
  }

  async cancelarVenta() {
    if (this.carrito().length === 0) return;

    const seguro = await this.confirmar.preguntar('¿Seguro que deseas vaciar el ticket de venta actual?');
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