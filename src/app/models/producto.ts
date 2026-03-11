export interface Producto {
  id: number;           
  nombre: string;      
  descripcion: string;  
  precio: number;  
  stock: number;  
  created_at: Date;    
  is_active: boolean; 
}