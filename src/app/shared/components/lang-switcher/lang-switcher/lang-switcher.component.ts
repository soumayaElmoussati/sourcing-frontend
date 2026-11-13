import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lang, LanguageService } from '@/core/services/language.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switcher" [class.ls-open]="open()">

      <!-- Trigger -->
      <button class="ls-trigger" (click)="toggle()" [title]="langService.current.nativeLabel">
        <span class="ls-flag">{{ langService.current.flag }}</span>
        <span class="ls-code">{{ langService.currentLang().toUpperCase() }}</span>
        <i class="pi pi-chevron-down ls-arrow"></i>
      </button>

      <!-- Dropdown -->
      <div class="ls-dropdown" *ngIf="open()">
        <div class="ls-header">Langue / Language / اللغة</div>
        <button
          *ngFor="let lang of langService.LANGUAGES"
          class="ls-option"
          [class.ls-active]="lang.code === langService.currentLang()"
          (click)="select(lang.code)">
          <span class="ls-opt-flag">{{ lang.flag }}</span>
          <span class="ls-opt-native" [style.font-family]="lang.code === 'ar' ? 'Arial' : 'inherit'">
            {{ lang.nativeLabel }}
          </span>
          <span class="ls-opt-latin">{{ lang.label }}</span>
          <i class="pi pi-check ls-check" *ngIf="lang.code === langService.currentLang()"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { position: relative; display: inline-block; }

    .lang-switcher { position: relative; }

    .ls-trigger {
      display: flex; align-items: center; gap: .35rem;
      padding: .4rem .7rem; border: 1.5px solid var(--ls-border, #e2e8f0);
      border-radius: 9px; background: var(--ls-bg, transparent);
      cursor: pointer; font-size: .82rem; font-weight: 700;
      color: var(--ls-text, #64748b); transition: all .2s;
      &:hover { border-color: #10b981; color: #10b981; }
    }
    .ls-open .ls-trigger { border-color: #10b981; color: #10b981; }
    .ls-flag { font-size: 1rem; line-height: 1; }
    .ls-code { font-size: .75rem; letter-spacing: .04em; }
    .ls-arrow { font-size: .6rem; transition: transform .2s; }
    .ls-open .ls-arrow { transform: rotate(180deg); }

    .ls-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      min-width: 180px; background: #fff; border: 1.5px solid #e2e8f0;
      border-radius: 14px; box-shadow: 0 8px 32px rgba(15,23,42,.12);
      overflow: hidden; z-index: 1000;
      animation: lsdrop .2s cubic-bezier(.16,1,.3,1);
    }
    @keyframes lsdrop {
      from { opacity: 0; transform: translateY(-6px) scale(.97); }
      to   { opacity: 1; transform: none; }
    }

    .ls-header {
      padding: .6rem .9rem .45rem; font-size: .68rem; font-weight: 800;
      color: #94a3b8; text-transform: uppercase; letter-spacing: .06em;
      border-bottom: 1px solid #f1f5f9;
    }

    .ls-option {
      display: flex; align-items: center; gap: .6rem;
      width: 100%; padding: .65rem .9rem; border: none; background: none;
      cursor: pointer; text-align: left; transition: background .15s;
      &:hover { background: rgba(16,185,129,.05); }
      &:last-child { border-bottom: none; }
    }
    .ls-active { background: rgba(16,185,129,.07); }
    .ls-opt-flag   { font-size: 1.1rem; flex-shrink: 0; }
    .ls-opt-native { font-size: .88rem; font-weight: 700; color: #fff; flex: 1; }
    .ls-opt-latin  { font-size: .72rem; color: #fff; }
    .ls-check      { font-size: .7rem; color: #10b981; margin-left: auto; }
  `]
})
export class LangSwitcherComponent {

  open = signal(false);

  constructor(public langService: LanguageService) {}

  toggle() { this.open.update(v => !v); }

  select(lang: Lang) {
    this.langService.setLanguage(lang);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const el = e.target as HTMLElement;
    if (!el.closest('.lang-switcher')) this.open.set(false);
  }
}