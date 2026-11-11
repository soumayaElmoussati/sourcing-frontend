// src/app/types/categorie.ts
import { TypeCategorie } from './TypeCategorie';
import { LabelCategorie } from './label-categorie.enum';

export interface Categorie {
  idCA?: number;
  titre: string;
  label: LabelCategorie;
  type: TypeCategorie;
}
