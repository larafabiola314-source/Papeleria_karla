import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Producto } from '../../models/producto';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmacionService } from '../../services/confirmacion.service'; // Importamos el nuevo servicio

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario implements OnInit {
  // Inyectamos los servicios
  private servicioAuth = inject(Auth);
  private toast = inject(NotificacionService);
  private confirmar = inject(ConfirmacionService); // Inyectamos el servicio del modal

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
      p.Nombre.toLowerCase().includes(termino) || 
      p.Descripcion.toLowerCase().includes(termino)
    );
  });

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.servicioAuth.obtenerProductos().subscribe({
      next: (res: Producto[]) => this.listaProductos.set(res),
      error: () => this.toast.mostrar('Error al conectar con el inventario', 'error')
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
      this.toast.mostrar('Por favor, completa el nombre y la descripción', 'error');
      return;
    }

    if (datosProducto.precio <= 0) {
      this.toast.mostrar('El precio debe ser mayor a cero', 'error');
      return;
    }

    if (datosProducto.stock < 0) {
      this.toast.mostrar('El stock no puede ser un número negativo', 'error');
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
        const msj = this.idEditando() ? '¡Producto actualizado correctamente!' : '¡Nuevo producto registrado!';
        this.toast.mostrar(msj, 'success');
        this.limpiarFormulario();
        this.cargarProductos();
      },
      error: () => {
        this.cargando.set(false);
        this.toast.mostrar('No se pudo guardar el producto. Revisa la conexión.', 'error');
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

  // Cambiamos a async para esperar la respuesta del modal
  async darDeBaja(id: number) {
    const confirmado = await this.confirmar.preguntar(
      '¿Estás seguro de que deseas dar de baja este producto? Esta acción ocultará el artículo de las ventas actuales.'
    );

    if (confirmado) {
      this.servicioAuth.cambiarEstadoProducto(id, false).subscribe({
        next: () => {
          this.toast.mostrar('El producto ha sido dado de baja', 'success');
          this.cargarProductos();
        },
        error: () => this.toast.mostrar('Error al intentar dar de baja', 'error')
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
    this.toast.mostrar('Modo edición activado', 'success');
  }
}