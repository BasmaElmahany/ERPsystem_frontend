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

  transform(key: string, params?: Record<string, any>): Observable<string> {
    return this.i18nService.currentLang$.pipe(
      map(lang => {
        let translation = translations[lang][key] || key;

        if (params && typeof translation === 'string') {
          Object.keys(params).forEach(k => {
            const val = params[k] == null ? '' : String(params[k]);
            // replace {{key}} and {{ key }} occurrences
            translation = translation.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), val);
          });
        }

        return translation;
      })
    );
  }
}
