import { TranslatePipe } from './translate.pipe';
import { of } from 'rxjs';

describe('TranslatePipe', () => {
  it('create an instance', () => {
    // provide a mock I18nService with currentLang$ observable
    const mockI18n = {
      currentLang$: of('en')
    } as any;
    const pipe = new TranslatePipe(mockI18n);
    expect(pipe).toBeTruthy();
  });
});
