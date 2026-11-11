import { Role } from './role'; // Import the full Role object

export interface Utilisateur {
  id?: number;
  username: string;
  email: string;
  role: Role; // Now it's a full object
  password?: string;
}
