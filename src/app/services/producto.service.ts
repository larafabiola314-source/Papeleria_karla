import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private url = 'https://papeleriaback.papeleriakarla.com/api/productos'; 

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  guardarProducto(datos: any, id: number | null): Observable<any> {
    return id ? this.http.put(`${this.url}/${id}`, datos) : this.http.post(this.url, datos);
  }

  darDeBaja(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}