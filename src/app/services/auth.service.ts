import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
 
  private urlApi = 'https://papeleriaback.papeleriakarla.com/api/login';

  validarUsuario(username: string, password: string): Observable<any> {
    return this.http.post(this.urlApi, { username, password });
  }
}