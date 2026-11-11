export type QuestionType = 'HS' | 'SMng' | 'SExpAcad'; // Hard Skill, Soft Management, or Academic/Experience

export interface JobQuestion {
  idJQ?: number;
  type: QuestionType;
  question: string;
  reponse: string;
  importante: 'Y' | 'N';
  skillFk?: number |null; // optional because not all questions are tied to a skill
}
