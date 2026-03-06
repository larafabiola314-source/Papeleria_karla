import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service'; // Cambiamos el servicio

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  // Inyectamos el servicio correcto
  private servicioDashboard = inject(DashboardService);

  gananciasHoy = signal<number>(0);
  tendenciaPorcentaje = signal<number>(0);
  ventasHoy = signal<number>(0);
  minutosUltimaVenta = signal<number | string>('-');
  alertasStock = signal<number>(0);
  
  ventasDia = signal<number>(0);
  ventasSemana = signal<number>(0);
  ventasMes = signal<number>(0);
  
  ultimasVentas = signal<any[]>([]);

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    // Usamos el servicio de Dashboard
    this.servicioDashboard.obtenerDashboard().subscribe({
      next: (res: any) => {
        // Laravel devolverá los datos en este formato JSON
        this.gananciasHoy.set(res.ganancias_hoy || 0);
        this.ventasHoy.set(res.ventas_hoy || 0);
        this.minutosUltimaVenta.set(res.minutos_ultima_venta ?? '-');
        this.alertasStock.set(res.alertas_stock || 0); 
        
        this.ventasDia.set(res.ventas_dia || 0);
        this.ventasSemana.set(res.ventas_semana || 0);
        this.ventasMes.set(res.ventas_mes || 0);
        
        this.ultimasVentas.set(res.ultimas_ventas || []);
      },
      error: () => console.error('Error al cargar métricas del dashboard')
    });
  }
}