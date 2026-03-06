import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private urlApi = 'http://localhost/Papeleria_karla/api/login.php';
  private urlUsuarios = 'http://localhost/Papeleria_karla/api/usuarios.php';
  private urlInventario = 'http://localhost/Papeleria_karla/api/inventario.php';
  private urlVentas = 'http://localhost/Papeleria_karla/api/ventas.php';

  validarUsuario(username: string, password: string): Observable<any> {
    return this.http.post(this.urlApi, { username, password });
  }

  guardarUsuario(datos: any): Observable<any> {
    return this.http.post(this.urlUsuarios, datos);
  }

  actualizarUsuario(datos: any): Observable<any> {
    return this.http.put(this.urlUsuarios, datos);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.urlUsuarios}?id=${id}`);
  }

obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.urlUsuarios);
  }

obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.urlInventario);
  }

  guardarProducto(datos: any): Observable<any> {
    return this.http.post(this.urlInventario, datos);
  }

  cambiarEstadoProducto(id: number, estado: boolean): Observable<any> {
  return this.http.post<any>(`${this.urlInventario}`, { id_producto: id, activo: estado });
}

   registrarVenta(datosVenta: any): Observable<any> {
  return this.http.post(this.urlVentas, datosVenta);
}

obtenerDashboard() {
   return this.http.get('http://localhost/Papeleria_karla/api/dashboard.php'); }
}


