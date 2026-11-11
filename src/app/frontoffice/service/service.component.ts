import { ViewportScroller } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-service',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './service.component.html',
  styleUrl: './service.component.scss'
})
export class ServiceComponent implements OnInit, AfterViewInit{

  isServicesPage: boolean = false;
  currentSection: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['section']) {
        // Attendre que la vue soit rendue puis scroller
        setTimeout(() => {
          this.scrollToSection(params['section']);
        }, 100);
      }
    });
  }

  ngAfterViewInit() {
    // Vérifier les paramètres après le rendu initial
    setTimeout(() => {
      this.route.queryParams.subscribe(params => {
        if (params['section']) {
          this.scrollToSection(params['section']);
        }
      });
    }, 200);
  }


  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculer la position en tenant compte du header fixe
      const headerHeight = 80; // Hauteur de votre header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Optionnel: Ajouter une classe active pour highlight
      this.removeAllActiveClasses();
      element.classList.add('section-active');
      
      // Nettoyer les paramètres d'URL après le scroll
      setTimeout(() => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }, 1000);
    }
  }

  private removeAllActiveClasses() {
    const sections = ['sourcing', 'customs-clearance', 'warehousing', 'call-center', 'shipping', 'remittance'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.remove('section-active');
      }
    });
  }

  // Méthode pour naviguer vers une section depuis la même page
  navigateToSection(sectionId: string) {
    this.router.navigate(['/services'], { 
      queryParams: { section: sectionId },
      fragment: sectionId
    }).then(() => {
      this.scrollToSection(sectionId);
    });
  }

  //

  updateActiveState(): void {
    const url = this.router.url;
    this.isServicesPage = url.includes('/services');
    
    if (this.isServicesPage) {
      // Extraire la section des query params
      const urlTree = this.router.parseUrl(url);
      this.currentSection = urlTree.queryParams['section'] || '';
    } else {
      this.currentSection = '';
    }
  }

  isServicesActive(): boolean {
    return this.isServicesPage;
  }

  isServiceSectionActive(section: string): boolean {
    return this.isServicesPage && this.currentSection === section;
  }

  

}
