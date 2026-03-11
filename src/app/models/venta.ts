export interface Venta {
  id?: number;
  user_id: number; 
  total: number;
  created_at?: Date;
  detalles: VentaDetalle[]; 
}

export interface VentaDetalle {
  id?: number;
  venta_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}