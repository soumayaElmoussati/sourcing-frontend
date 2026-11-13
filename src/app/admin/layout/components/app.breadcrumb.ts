import {Component, computed, ElementRef, inject, ViewChild} from '@angular/core';
import {ActivatedRouteSnapshot, NavigationEnd, Router, RouterModule} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {LayoutService} from '@/layout/service/layout.service';

interface Breadcrumb {
    label: string;
    url?: string;
}

@Component({
    selector: '[app-breadcrumb]',
    standalone: true,
    imports: [CommonModule, RouterModule, IconField, InputIcon, InputText, ButtonModule, RippleModule],
    template: ` 
`,
    host: {
        class: 'layout-breadcrumb flex items-center relative h-12'
    }
})
export class AppBreadcrumb {
    @ViewChild('searchinput') searchInput!: ElementRef<HTMLElement>;

    private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

    readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

    constructor(private router: Router) {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
            const root = this.router.routerState.snapshot.root;
            const breadcrumbs: Breadcrumb[] = [];
            this.addBreadcrumb(root, [], breadcrumbs);

            this._breadcrumbs$.next(breadcrumbs);
        });
    }

    layoutService = inject(LayoutService);

    searchActive = computed(() => this.layoutService.layoutState().searchBarActive);

    private addBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: Breadcrumb[]) {
        const routeUrl = parentUrl.concat(route.url.map((url) => url.path));
        const breadcrumb = route.data['breadcrumb'];
        const parentBreadcrumb = route.parent && route.parent.data ? route.parent.data['breadcrumb'] : null;

        if (breadcrumb && breadcrumb !== parentBreadcrumb) {
            breadcrumbs.push({
                label: route.data['breadcrumb'],
                url: '/' + routeUrl.join('/')
            });
        }

        if (route.firstChild) {
            this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
        }
    }

    activateSearch() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            searchBarActive: true
        }));
        setTimeout(() => {
            this.searchInput.nativeElement?.focus();
            console.log(this.searchInput);
        }, 250);
    }

    deactivateSearch() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            searchBarActive: false
        }));
    }

    onProfileMenuButtonClick() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            rightMenuActive: true
        }));
    }

}
