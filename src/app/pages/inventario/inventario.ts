import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service'; 
import { Producto } from '../../models/producto';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmacionService } from '../../services/confirmacion.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario implements OnInit {
  private productoService = inject(ProductoService);
  private toast = inject(NotificacionService);
  private confirmar = inject(ConfirmacionService);

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
    if (!termino) return this.listaProductos();

    return this.listaProductos().filter(p => 
      p.nombre.toLowerCase().includes(termino) || 
      p.descripcion.toLowerCase().includes(termino)
    );
  });

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (res: Producto[]) => this.listaProductos.set(res),
      error: () => this.toast.mostrar('Error al conectar con el inventario', 'error')
    });
  }

  registrarProducto() {
    const datosProducto = {
      nombre: this.nombre().trim(),
      descripcion: this.descripcion().trim(),
      precio: Number(this.precio()),
      stock: Number(this.stock())
    };

    if (!datosProducto.nombre || !datosProducto.descripcion) {
      this.toast.mostrar('Completa el nombre y la descripción', 'error');
      return;
    }

    this.cargando.set(true);

    
    this.productoService.guardarProducto(datosProducto, this.idEditando()).subscribe({
      next: () => {
        this.cargando.set(false);
        const msj = this.idEditando() ? '¡Actualizado!' : '¡Registrado!';
        this.toast.mostrar(msj, 'success');
        this.limpiarFormulario();
        this.cargarProductos();
      },
      error: () => {
        this.cargando.set(false);
        this.toast.mostrar('Error al guardar el producto', 'error');
      }
    });
  }

  async darDeBaja(id: number) {
    const confirmado = await this.confirmar.preguntar(
      '¿Deseas dar de baja este producto? Se ocultará de las ventas.'
    );

    if (confirmado) {
      this.productoService.darDeBaja(id).subscribe({
        next: () => {
          this.toast.mostrar('Producto dado de baja', 'success');
          this.cargarProductos();
        },
        error: () => this.toast.mostrar('Error al intentar dar de baja', 'error')
      });
    }
  }

  prepararEdicion(producto: Producto) {
    this.idEditando.set(producto.id);
    this.nombre.set(producto.nombre);
    this.descripcion.set(producto.descripcion);
    this.precio.set(producto.precio);
    this.stock.set(producto.stock);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  limpiarFormulario() {
    this.idEditando.set(null);
    this.nombre.set('');
    this.descripcion.set('');
    this.precio.set(0);
    this.stock.set(0);
  }
}