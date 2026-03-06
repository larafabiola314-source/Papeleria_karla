import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private url = 'http://127.0.0.1:8000/api/productos'; 

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  // Si tiene ID, usamos PUT (editar); si no, POST (crear) [cite: 2025-11-23]
  guardarProducto(datos: any, id: number | null): Observable<any> {
    return id ? this.http.put(`${this.url}/${id}`, datos) : this.http.post(this.url, datos);
  }

  // Laravel usa DELETE para el método destroy [cite: 2026-02-12]
  darDeBaja(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}