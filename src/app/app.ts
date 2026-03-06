import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { NotificacionService } from './services/notificacion.service';
import { ConfirmacionService } from './services/confirmacion.service';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet, CommonModule], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Papeleria-Karla');

  public notificationService = inject(NotificacionService);
  public confirmacionService = inject(ConfirmacionService);
  notificacion = this.notificationService.mensajeActual;
  confirmService = this.confirmacionService;
}