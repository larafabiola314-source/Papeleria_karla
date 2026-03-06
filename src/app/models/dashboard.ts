export interface DashboardStats {
  ganancias_hoy: number;
  ventas_hoy: number;
  minutos_ultima_venta: number | string;
  alertas_stock: number;
  ventas_dia: number;
  ventas_semana: number;
  ventas_mes: number;
  ultimas_ventas: any[];
}