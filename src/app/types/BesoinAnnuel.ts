// besoinAnnuel.ts
import { FicheProfilBesoin } from './FicheProfilBesoin';
import { Utilisateur } from './Utilisateur';

export interface BesoinAnnuel {
  id: number;
  ficheProfil: FicheProfilBesoin | null;
  qteGlobale: number;
  urgence: boolean;
  observations: string;
  exprimePar: Utilisateur;
  besoinsMensuels: { [mois: string]: number };
  annee: number; // ✅ AJOUT
  status: 'ouvert' | 'complet'; 
}
