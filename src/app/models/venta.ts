export interface Venta {
  id?: number;
  user_id: number; // Relación con el usuario que vendió [cite: 2025-11-23]
  total: number;
  created_at?: Date;
  detalles: VentaDetalle[]; // Lista de productos vendidos
}

export interface VentaDetalle {
  id?: number;
  venta_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}