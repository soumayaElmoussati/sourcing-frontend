import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
// ngx-translate v18: TranslateModule is removed — import standalone pieces directly
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { LangSwitcherComponent } from '@/shared/components/lang-switcher/lang-switcher/lang-switcher.component';
import { LanguageService } from '@/core/services/language.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, TranslateDirective, LangSwitcherComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  isScrolled = false;
  menuOpen   = false;

  get isRtl(): boolean { return this.langService.isRtl; }

  constructor(public langService: LanguageService) {}

  ngOnInit(): void {}

  @HostListener('window:scroll')
  onWindowScroll() { this.isScrolled = window.scrollY > 30; }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu()  { this.menuOpen = false; }

  // ── 6 services ────────────────────────────────────────────────────────
  services6 = [
    {
      icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z',
      titleKey: 'HOME.SVC.S1_TITLE',
      descKey:  'HOME.SVC.S1_DESC'
    },
    {
      icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H7v-2h8v2zm3-4H7v-2h11v2zm0-4H7V7h11v3z',
      titleKey: 'HOME.SVC.S2_TITLE',
      descKey:  'HOME.SVC.S2_DESC'
    },
    {
      icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z',
      titleKey: 'HOME.SVC.S3_TITLE',
      descKey:  'HOME.SVC.S3_DESC'
    },
    {
      icon: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
      titleKey: 'HOME.SVC.S4_TITLE',
      descKey:  'HOME.SVC.S4_DESC'
    },
    {
      icon: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-17 8.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5S4.83 16.5 4 16.5zM19.5 9.5l1.96 2.5H17V9.5h2.5zM18 16.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
      titleKey: 'HOME.SVC.S5_TITLE',
      descKey:  'HOME.SVC.S5_DESC'
    },
    {
      icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
      titleKey: 'HOME.SVC.S6_TITLE',
      descKey:  'HOME.SVC.S6_DESC'
    }
  ];

  // ── Benefits ──────────────────────────────────────────────────────────
  benefits = [
    {
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z',
      labelKey: 'HOME.BENEFITS.B1'
    },
    {
      icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
      labelKey: 'HOME.BENEFITS.B2'
    },
    {
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',
      labelKey: 'HOME.BENEFITS.B3'
    },
    {
      icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 14H7v-2h4v2zm6-4H7v-2h10v2zm0-4H7V7h10v3z',
      labelKey: 'HOME.BENEFITS.B4'
    }
  ];

  // ── Countries ─────────────────────────────────────────────────────────
  countries = [
    { flag: '🇸🇦', nameKey: 'HOME.COUNTRIES.C1' },
    { flag: '🇦🇪', nameKey: 'HOME.COUNTRIES.C2' },
    { flag: '🇰🇼', nameKey: 'HOME.COUNTRIES.C3' },
    { flag: '🇶🇦', nameKey: 'HOME.COUNTRIES.C4' },
    { flag: '🇧🇭', nameKey: 'HOME.COUNTRIES.C5' },
    { flag: '🇴🇲', nameKey: 'HOME.COUNTRIES.C6' },
  ];

  // ── Scroll helper ─────────────────────────────────────────────────────
  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}