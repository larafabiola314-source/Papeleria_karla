import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  
  // URL para la gestión de usuarios/empleados en Laravel
  private urlApi = 'http://127.0.0.1:8000/api/usuarios';

  /**
   * Obtiene la lista de todos los empleados
   */
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.urlApi);
  }

  /**
   * Registra un nuevo usuario o actualiza uno existente
   * Si el objeto tiene un 'id', Laravel usará el método PUT [cite: 2025-11-23]
   */
  guardarUsuario(datos: any): Observable<any> {
    if (datos.id) {
      return this.http.put(`${this.urlApi}/${datos.id}`, datos);
    }
    return this.http.post(this.urlApi, datos);
  }

  /**
   * Elimina (o desactiva) un usuario por su ID
   */
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.urlApi}/${id}`); 
  }
}