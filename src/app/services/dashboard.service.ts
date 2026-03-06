import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  // URL de la API de Laravel
  private url = 'http://127.0.0.1:8000/api/dashboard';

  obtenerDashboard(): Observable<any> {
    return this.http.get(this.url);
  }
}