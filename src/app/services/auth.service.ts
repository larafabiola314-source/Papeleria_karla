import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  // Fíjate bien que sea el puerto 8000
  private urlApi = 'http://127.0.0.1:8000/api/login';

  validarUsuario(username: string, password: string): Observable<any> {
    return this.http.post(this.urlApi, { username, password });
  }
}