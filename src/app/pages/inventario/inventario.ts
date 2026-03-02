import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario implements OnInit {
  nombre = signal('');
  descripcion = signal('');
  precio = signal(0);
  stock = signal(0);
  idEditando = signal<number | null>(null);
  cargando = signal(false);

  listaProductos = signal<Producto[]>([]);
  terminoBusqueda = signal('');

  productosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    
    if (!termino) {
      return this.listaProductos();
    }

    return this.listaProductos().filter(p => 
      p.Nombre.toLowerCase().includes(termino) || 
      p.Descripcion.toLowerCase().includes(termino)
    );
  });

  private servicioAuth = inject(Auth);

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.servicioAuth.obtenerProductos().subscribe({
      next: (res: Producto[]) => {
        this.listaProductos.set(res);
      },
      error: () => console.error('Error al cargar inventario')
    });
  }

  registrarProducto() {
    const datosProducto: any = {
      nombre: this.nombre().trim(),
      descripcion: this.descripcion().trim(),
      precio: Number(this.precio()),
      stock: Number(this.stock())
    };

    if (!datosProducto.nombre || !datosProducto.descripcion) {
    alert('Nombre o descripción faltante');
    return;
  }

  if (datosProducto.precio <= 0) {
    alert('El precio no puede ser cero ser negativo.');
    return;
  }

  if (datosProducto.stock < 0) {
    alert('El stock no puede ser negativo');
    return;
  }

  if (this.idEditando()) {
    datosProducto.id_producto = this.idEditando();
    datosProducto.accion = 'editar_completo';
  }

  this.cargando.set(true);

    this.servicioAuth.guardarProducto(datosProducto).subscribe({
    next: (res) => {
      this.cargando.set(false);
      
      alert(this.idEditando() ? 'Producto actualizado' : 'Producto registrado');
      this.limpiarFormulario();
      this.cargarProductos();
    },
    error: () => {
      this.cargando.set(false);
      alert('Error en la operación');
    }
  });
}

  limpiarFormulario() {
    this.idEditando.set(null);
    this.nombre.set('');
    this.descripcion.set('');
    this.precio.set(0);
    this.stock.set(0);
  }

  darDeBaja(id: number) {
  if (confirm('¿Estás seguro de dar de baja este producto?')) {
    this.servicioAuth.cambiarEstadoProducto(id, false).subscribe({
      next: (res) => {
        alert('Producto actualizado');
        this.cargarProductos();
      },
      error: () => alert('Error al dar de baja el producto')
    });
  }
}

prepararEdicion(producto: Producto) {
  this.idEditando.set(producto.Id_Producto);
  this.nombre.set(producto.Nombre);
  this.descripcion.set(producto.Descripcion);
  this.precio.set(producto.Precio);
  this.stock.set(producto.Stock);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

}