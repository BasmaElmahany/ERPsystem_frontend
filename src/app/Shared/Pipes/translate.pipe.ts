import { Pipe, PipeTransform } from '@angular/core';

import { Observable, map } from 'rxjs';
import en from '../JsonFiles/en.json';
import ar from '../JsonFiles/ar.json';
import { I18nService, Language } from '../Services/i18n.service';
// Mock translation data
const translations: Record<Language, any> = { en, ar };


@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Important for re-evaluation on language change
})
export class TranslatePipe implements PipeTransform {
  constructor(private i18nService: I18nService) {}

  transform(key: string): Observable<string> {
    return this.i18nService.currentLang$.pipe(
      map(lang => {
        const translation = translations[lang][key];
        return translation || key; // Return key if translation is missing
      })
    );
  }
}
