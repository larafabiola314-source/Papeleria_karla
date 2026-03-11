export interface Usuario {
  id: number;              
  nombre: string;      
  ap: string;         
  am: string;         
  username: string;
  email: string;     
  role: 'admin' | 'user'; 
  password?: string;   
  created_at?: Date;
  updated_at?: Date;
}