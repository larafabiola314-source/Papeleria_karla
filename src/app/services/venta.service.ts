import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  
  // URL que apunta al controlador de ventas en Laravel
  private urlApi = 'https://papeleriaback.papeleriakarla.com/api/ventas'; 

  /**
   * Registra una nueva venta en el sistema.
   * El payload incluye el user_id, total y el arreglo de productos.
   */
  registrarVenta(datosVenta: any): Observable<any> {
    return this.http.post(this.urlApi, datosVenta); 
  }

  /**
   * (Opcional) Obtener el historial de ventas para reportes
   */
  obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(this.urlApi);
  }
}