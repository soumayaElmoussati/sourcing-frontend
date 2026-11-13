import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnDestroy, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { LangSwitcherComponent } from '@/shared/components/lang-switcher/lang-switcher/lang-switcher.component';
import { LanguageService } from '@/core/services/language.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, TranslateDirective, LangSwitcherComponent],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements AfterViewInit, OnDestroy {

  isScrolled = false;
  menuOpen  = false;

  private observer!: IntersectionObserver;
  private animFrame!: number;

  get isRtl(): boolean { return this.langService.isRtl; }

  get fulfillmentImg(): string {
    const lang = this.langService.currentLang();
    if (lang === 'ar') return '/images/fulfillment-ar.jpeg';
    return '/images/fulfillment-fr.jpeg';
  }

  constructor(
    public langService: LanguageService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  @HostListener('window:scroll')
  onScroll() { this.isScrolled = window.scrollY > 30; }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu()  { this.menuOpen = false; }

  /* ── CTA floating particles ── */
  ctaParticles = Array.from({ length: 12 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    size: Math.random() * 6 + 3,
  }));

  /* ── GCC countries ── */
  countries = [
    { flag: '🇸🇦', name: 'Saudi Arabia' },
    { flag: '🇦🇪', name: 'UAE' },
    { flag: '🇰🇼', name: 'Kuwait' },
    { flag: '🇶🇦', name: 'Qatar' },
    { flag: '🇧🇭', name: 'Bahrain' },
    { flag: '🇴🇲', name: 'Oman' },
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    /* Intersection Observer – fade-in anims */
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          this.observer.unobserve(e.target);
          /* Trigger counter if needed */
          const strong = e.target.querySelector
            ? e.target.querySelector('.counter[data-target]')
            : (e.target.matches('.counter[data-target]') ? e.target : null);
          if (strong) this.animateCounter(strong as HTMLElement);
          /* Animate all counters inside */
          const counters = e.target.querySelectorAll?.('.counter[data-target]');
          counters?.forEach(c => this.animateCounter(c as HTMLElement));
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.anim').forEach(el => this.observer.observe(el));

    /* Animate hero stats counters immediately on load */
    setTimeout(() => {
      document.querySelectorAll('.hero-stats .counter[data-target]').forEach(el => {
        this.animateCounter(el as HTMLElement);
      });
    }, 600);

    /* Canvas dots */
    this.initHeroCanvas();
  }

  private animateCounter(el: HTMLElement): void {
    const target = parseInt(el.dataset['target'] || '0', 10);
    if (!target) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private initHeroCanvas(): void {
    const canvas = document.querySelector('.hero-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = 60;
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.5 + .5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16,185,129,.7)';
        ctx.fill();
      });
      /* Connections */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16,185,129,${.15 * (1 - dist / 100)})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
      }
      this.animFrame = requestAnimationFrame(draw);
    };
    draw();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.animFrame);
  }

  solutions = [
    { icon: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', titleKey: 'ABOUT.SOL.S1_T', descKey: 'ABOUT.SOL.S1_D', color: '#10b981' },
    { icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z', titleKey: 'ABOUT.SOL.S2_T', descKey: 'ABOUT.SOL.S2_D', color: '#0ea5e9' },
    { icon: 'M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z', titleKey: 'ABOUT.SOL.S3_T', descKey: 'ABOUT.SOL.S3_D', color: '#8b5cf6' },
    { icon: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z', titleKey: 'ABOUT.SOL.S4_T', descKey: 'ABOUT.SOL.S4_D', color: '#f59e0b' },
  ];

  values = [
    { icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z', color: '#10b981', titleKey: 'ABOUT.VAL.V1_T', descKey: 'ABOUT.VAL.V1_D' },
    { icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', color: '#1a56e8', titleKey: 'ABOUT.VAL.V2_T', descKey: 'ABOUT.VAL.V2_D' },
    { icon: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z', color: '#8b5cf6', titleKey: 'ABOUT.VAL.V3_T', descKey: 'ABOUT.VAL.V3_D' },
    { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', color: '#f59e0b', titleKey: 'ABOUT.VAL.V4_T', descKey: 'ABOUT.VAL.V4_D' },
  ];
}