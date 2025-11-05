import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private renderer: Renderer2;
  private currentLangSubject: BehaviorSubject<Language> = new BehaviorSubject<Language>('en');
  public currentLang$: Observable<Language> = this.currentLangSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    // Initialize language from local storage or default to 'en'
    const storedLang = localStorage.getItem('lang') as Language;
    this.setLanguage(storedLang || 'en');
  }

  get currentLang(): Language {
    return this.currentLangSubject.value;
  }

  get isRTL(): boolean {
    return this.currentLangSubject.value === 'ar';
  }

  setLanguage(lang: Language): void {
    if (this.currentLangSubject.value === lang) {
      return;
    }

    this.currentLangSubject.next(lang);
    localStorage.setItem('lang', lang);

    const isRTL = lang === 'ar';
    const body = document.body;

    // Set 'lang' attribute on the body for CSS targeting
    this.renderer.setAttribute(body, 'lang', lang);

    // Set 'dir' attribute on the body for RTL support
    if (isRTL) {
      this.renderer.setAttribute(body, 'dir', 'rtl');
    } else {
      this.renderer.setAttribute(body, 'dir', 'ltr');
    }
  }

  toggleLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }
}
