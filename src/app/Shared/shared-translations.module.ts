import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from './Pipes/translate.pipe';

@NgModule({
  imports: [CommonModule, TranslatePipe],
  exports: [CommonModule, TranslatePipe]
})
export class SharedTranslationsModule {}
