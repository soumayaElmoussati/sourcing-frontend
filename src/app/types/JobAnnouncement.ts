import { FicheProfilBesoin } from './FicheProfilBesoin';

export interface JobAnnouncement {
  idJA?: number;
  dateCreation: Date;
  dateAffichage: Date;
  dateExpiration: Date;
  titreAnn: string;
  bodyAnnonce: string;
  pathImagePoster: string;
  pathImgDeco: string;
  email: string;
  wtsp: string;
  site: string;
  linkedIn: string;
  messageFinMotivant: string;
  qteRealisee: number;
  fkFicheProfileBesoin: FicheProfilBesoin;
}
