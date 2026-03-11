import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private urlApi = 'https://papeleriaback.papeleriakarla.com/api/ventas'; 

  registrarVenta(datosVenta: any): Observable<any> {
    return this.http.post(this.urlApi, datosVenta); 
  }

  obtenerHistorial(): Observable<any[]> {
    return this.http.get<any[]>(this.urlApi);
  }
}