import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  styleUrl: './image-preview-modal.component.scss'
})
export class ImagePreviewModalComponent {

  constructor(
    public dialogRef: MatDialogRef<ImagePreviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string }
  ) {}

  // 🔍 Open in new tab (full size)
  openFull() {
    window.open(this.data.url, "_blank");
  }

  // 🖨 Print the image
  printImage() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Image</title>
        </head>
        <body style="margin:0;padding:0;text-align:center;">
          <img src="${this.data.url}" style="max-width:100%;"/>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Give the image time to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }
}
