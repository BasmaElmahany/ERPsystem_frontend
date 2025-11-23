import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import en from '../JsonFiles/en.json';
import ar from '../JsonFiles/ar.json';

export type Language = 'en' | 'ar';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: en as any,
  ar: ar as any,
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private renderer: Renderer2;
  private currentLangSubject: BehaviorSubject<Language> = new BehaviorSubject<Language>('en');
  public currentLang$: Observable<Language> = this.currentLangSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    const storedLang = (localStorage.getItem('lang') as Language) || 'en';
    this.setLanguage(storedLang);
  }

  get currentLang(): Language {
    return this.currentLangSubject.value;
  }

  get isRTL(): boolean {
    return this.currentLangSubject.value === 'ar';
  }

  setLanguage(lang: Language): void {
    if (this.currentLangSubject.value === lang) return;

    this.currentLangSubject.next(lang);
    localStorage.setItem('lang', lang);

    const isRTL = lang === 'ar';
    const body = document.body;
    this.renderer.setAttribute(body, 'lang', lang);
    this.renderer.setAttribute(body, 'dir', isRTL ? 'rtl' : 'ltr');
  }

  toggleLanguage(): void {
    const newLang: Language = this.currentLang === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  /**
   * Synchronously get a translated string for a key with optional params.
   */
  instant(key: string, params?: Record<string, any>): string {
    const lang = this.currentLang;
    let text = TRANSLATIONS[lang]?.[key] ?? key;

    if (params && typeof text === 'string') {
      Object.keys(params).forEach(k => {
        const val = params[k] == null ? '' : String(params[k]);
        text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), val);
      });
    }

    return text;
  }
}
