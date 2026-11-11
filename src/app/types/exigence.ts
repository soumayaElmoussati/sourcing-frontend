import { FicheProfilBesoin } from "./FicheProfilBesoin";
import { Categorie } from "./Categorie ";

export interface Exigence {
  exigenceType: 'Acad' | 'Exp';       // Limité aux valeurs 'Acad' ou 'Exp'
  exigenceCategorie: Categorie;           // Catégorie (tu peux préciser un type si tu veux)
  titre: string;
  ididREA: number ;            // Identifiant (tu choisis type number ou string)
}