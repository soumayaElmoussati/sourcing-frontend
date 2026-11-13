import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit, Component, HostListener,
  Inject, OnDestroy, OnInit, PLATFORM_ID
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { LangSwitcherComponent } from '@/shared/components/lang-switcher/lang-switcher/lang-switcher.component';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, TranslateDirective, LangSwitcherComponent],
  templateUrl: './service.component.html',
  styleUrl: './service.component.scss'
})
export class ServiceComponent implements OnInit, AfterViewInit, OnDestroy {

  scrolled      = false;
  isScrolled    = false;   // used by about-header
  railStuck     = false;
  activeSection = '';
  menuOpen      = false;

  private sectionIds = ['sourcing','customs-clearance','warehousing','call-center','shipping','remittance'];
  private animObserver!: IntersectionObserver;
  private sectionObserver!: IntersectionObserver;
  private animCtx: CanvasRenderingContext2D | null = null;
  private animFrame = 0;
  private particles: { x:number; y:number; vx:number; vy:number; r:number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['section']) {
        setTimeout(() => this.scrollToSection(params['section']), 300);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initHeroCanvas();
    this.initAnimObserver();
    this.initSectionObserver();
  }

  ngOnDestroy(): void {
    this.animObserver?.disconnect();
    this.sectionObserver?.disconnect();
    cancelAnimationFrame(this.animFrame);
  }

  // ── Scroll state ─────────────────────────────────
  @HostListener('window:scroll')
  onScroll(): void {
    const y = window.scrollY;
    this.scrolled  = y > 20;
    this.isScrolled = y > 20;
    this.railStuck = y > 80;
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }

  // ── Scroll to section ────────────────────────────
  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = el.getBoundingClientRect().top + window.scrollY - 130;
    window.scrollTo({ top: offset, behavior: 'smooth' });
    this.activeSection = id;
    setTimeout(() => {
      this.router.navigate([], {
        relativeTo: this.route, queryParams: {}, replaceUrl: true
      });
    }, 1200);
  }

  // ── Intersection: fade-in sections ───────────────
  private initAnimObserver(): void {
    const sections = document.querySelectorAll<HTMLElement>('.anim-section');
    this.animObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          this.animObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    sections.forEach(s => this.animObserver.observe(s));
  }

  // ── Intersection: active rail link ───────────────
  private initSectionObserver(): void {
    const sections = this.sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    this.sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.3) {
          this.activeSection = e.target.id;
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(s => this.sectionObserver.observe(s));
  }

  // ── Hero canvas particle network ─────────────────
  private initHeroCanvas(): void {
    const canvas = document.querySelector<HTMLCanvasElement>('.hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.animCtx = ctx;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 60;
    this.particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      r: Math.random() * 1.5 + .5
    }));

    const draw = () => {
      this.animFrame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.45)';
        ctx.fill();
      });

      // connect nearby
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(this.particles[i].x, this.particles[i].y);
            ctx.lineTo(this.particles[j].x, this.particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(.12 * (1 - dist/110)).toFixed(3)})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
      }
    };
    draw();
  }

  // ── Legacy helpers (kept for routing compatibility) ──
  isServicesPage   = true;
  currentSection   = '';
  isServicesActive()                    { return true; }
  isServiceSectionActive(s: string)     { return this.activeSection === s; }
  navigateToSection(id: string)         { this.scrollToSection(id); }
  updateActiveState()                   {}
  removeAllActiveClasses()              {}
}