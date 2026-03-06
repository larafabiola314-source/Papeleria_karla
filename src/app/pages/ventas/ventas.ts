import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Producto } from '../../models/producto';

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
  private servicioAuth = inject(Auth);

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
      error: () => console.error('Error al cargar productos para venta')
    });
  }

  //Calcular el total de dinero
  totalVenta = computed(() => {
    return this.listaProductos().reduce((total, p) => total + (p.Precio * p.cantidad), 0);
  });

  //Calcular el total de artículos
  totalUnidades = computed(() => {
    return this.listaProductos().reduce((total, p) => total + p.cantidad, 0);
  });

  //ordenar por cantidades
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

  //carrito
 generarOpcionesStock(stock: number): number[] {
  return Array.from({ length: stock + 1 }, (_, i) => i);
}

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
  
  // Validamos que no sea menor a 0 ni mayor al stock disponible [cite: 2025-11-30]
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
        alert('Venta realizada');
        this.limpiarCarrito();
        this.cargarInventario();
      } else {
        alert('Error: ' + res.message);
      }
    },
    error: () => {
      this.cargando.set(false);
      alert('Error de conexión con el servidor');
    }
  });
}

  cancelarVenta() {
  if (confirm('¿Seguro que deseas cancelar la venta actual?')) {
    this.limpiarCarrito();
  }
}

  limpiarCarrito() {
  this.listaProductos.update(productos => 
    productos.map(p => ({ ...p, cantidad: 0 }))
  );
  this.terminoBusqueda.set('');
}
}