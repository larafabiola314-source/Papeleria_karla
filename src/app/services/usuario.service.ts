import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private urlApi = 'https://papeleriaback.papeleriakarla.com/api/usuarios';

  
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.urlApi);
  }

  guardarUsuario(datos: any): Observable<any> {
    if (datos.id) {
      return this.http.put(`${this.urlApi}/${datos.id}`, datos);
    }
    return this.http.post(this.urlApi, datos);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.urlApi}/${id}`); 
  }
}