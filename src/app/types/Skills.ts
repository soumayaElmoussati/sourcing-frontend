import { Categorie } from './Categorie ';

export interface Skills {
  idHS?: number;
  titre: string;
  level: string;
  exigence: 'Requise' | 'Optionnelle';
  ficheBFk?: number; // optional because it might be set during creation
  cateFk: Categorie;
}
