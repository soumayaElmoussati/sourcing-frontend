import { Label } from './Label';

import { Skills } from './Skills';
import { JobQuestion } from './JobQuestion';
import { Sector } from './sector';
import { Exigence } from './exigence';

export interface FicheProfilBesoin {
 
  idFPB?: number;
  profileTitle: string;
  exigences: Exigence[] ;
  jobDescription: string;
  secteurFk: Sector | null;
  listLabelsTagProfile: Label[] |null;
  listMissionTask: string[];
  skills: Skills[];
  questions: JobQuestion[];
}
