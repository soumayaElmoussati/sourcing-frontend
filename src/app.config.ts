import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling
} from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@/core/services/auth.interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageService } from '@/core/services/language.service';

// APP_INITIALIZER doit retourner une fonction qui retourne une Promise
// Angular attend la résolution avant de rendre le premier composant
function initLanguage(langService: LanguageService): () => Promise<void> {
  return () => langService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      }),
      withEnabledBlockingInitialNavigation()
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),

    provideAnimationsAsync(),

    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } }
    }),

    provideTranslateService({
      fallbackLang: 'en'
    }),
    ...provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    }),

    {
      provide: APP_INITIALIZER,
      useFactory: initLanguage,
      deps: [LanguageService],
      multi: true
    }
  ]
};