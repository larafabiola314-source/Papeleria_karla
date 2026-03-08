export interface Usuario {
  id: number;          // Antes Id_Usuario [cite: 2025-11-23]
  nombre: string;      // Nombre del empleado [cite: 2025-11-23]
  ap: string;          // Apellido Paterno [cite: 2025-11-23]
  am: string;          // Apellido Materno [cite: 2025-11-23]
  username: string;
  email: string;     // Nombre de usuario para el login [cite: 2025-11-23]
  role: 'admin' | 'user'; // Rol definido en la base de datos
  password?: string;   // Opcional, solo se usa al crear/editar
  created_at?: Date;
  updated_at?: Date;
}