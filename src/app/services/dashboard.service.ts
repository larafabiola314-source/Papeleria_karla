import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  // URL de la API de Laravel
  private url = 'https://papeleriaback.papeleriakarla.com/api/dashboard';

  obtenerDashboard(): Observable<any> {
    return this.http.get(this.url);
  }
}