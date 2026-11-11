import { Injectable } from '@angular/core';
import { Langue } from '@/types/langue.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LangueService {
  private langues: Langue[] = [
    {
      idL: 1,
      codeLg: 'Fr',
      titre: 'Français',
      flag: 'flags/fr.png'
    },
    {
      idL: 2,
      codeLg: 'En',
      titre: 'English',
      flag: 'flags/en.png'
    },
    {
      idL: 3,
      codeLg: 'Ar',
      titre: 'العربية',
      flag: 'flags/ar.png'
    },
    {
      idL: 4,
      codeLg: 'Es',
      titre: 'Español',
      flag: 'flags/es.png'
    }
  ];

  private languesSubject = new BehaviorSubject<Langue[]>([...this.langues]);

  constructor() {}

  // 🔄 Observable for language list
  getLangues(): Observable<Langue[]> {
    return this.languesSubject.asObservable();
  }

  // 🔍 Get by ID
  getLangueById(id: number): Langue | undefined {
    return this.langues.find(l => l.idL === id);
  }

  // ➕ Add a new language with default flag if missing
  addLangue(newLangue: Langue): void {
    newLangue.idL = this.generateNewId();

    // Use default flag if none provided
    if (!newLangue.flag || newLangue.flag.trim() === '') {
      newLangue.flag = 'flags/default.png';
    }

    this.langues.push(newLangue);
    this.updateState();
  }

  // ✏️ Update an existing language
  updateLangue(updated: Langue): void {
    const index = this.langues.findIndex(l => l.idL === updated.idL);
    if (index !== -1) {
      this.langues[index] = {
        ...updated,
        flag: updated.flag && updated.flag.trim() !== ''
          ? updated.flag
          : 'flags/default.png'
      };
      this.updateState();
    }
  }

  // 🗑️ Delete a language
  deleteLangue(id: number): void {
    this.langues = this.langues.filter(l => l.idL !== id);
    this.updateState();
  }

  // 📌 Internal: refresh observable value
  private updateState(): void {
    this.languesSubject.next([...this.langues]);
  }

  // 📌 Internal: auto-increment simulation
  private generateNewId(): number {
    return this.langues.length > 0
      ? Math.max(...this.langues.map(l => l.idL)) + 1
      : 1;
  }
}
