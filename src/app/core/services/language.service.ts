import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export type Lang = 'en' | 'fr' | 'ar';

export interface LangOption {
  code: Lang;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {

  readonly LANGUAGES: LangOption[] = [
    { code: 'en', label: 'English',  nativeLabel: 'English',  flag: '🇬🇧', dir: 'ltr' },
    { code: 'fr', label: 'French',   nativeLabel: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'ar', label: 'Arabic',   nativeLabel: 'العربية',  flag: '🇸🇦', dir: 'rtl' },
  ];

  private readonly STORAGE_KEY = 'x10ecom_lang';

  currentLang = signal<Lang>('en');

  constructor(private translate: TranslateService) {}

  // Retourne une Promise — APP_INITIALIZER attend sa résolution
  // avant de rendre le premier composant
  async init(): Promise<void> {
    const saved = (localStorage.getItem(this.STORAGE_KEY) as Lang) ?? 'en';
    this.translate.setFallbackLang('en');
    await this.setLanguage(saved, false);
  }

  async setLanguage(lang: Lang, save = true): Promise<void> {
    // firstValueFrom attend que le fichier JSON soit chargé via HTTP
    await firstValueFrom(this.translate.use(lang));
    this.currentLang.set(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', lang === 'ar');
    if (save) localStorage.setItem(this.STORAGE_KEY, lang);
  }

  get current(): LangOption {
    return this.LANGUAGES.find(l => l.code === this.currentLang()) ?? this.LANGUAGES[0];
  }

  get isRtl(): boolean { return this.currentLang() === 'ar'; }
}