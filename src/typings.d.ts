// Custom ambient module declarations to satisfy TypeScript when libraries
// are missing or don't provide types in this project environment.

declare module 'exceljs' {
  const ExcelJS: any;
  export = ExcelJS;
}

declare module 'file-saver' {
  export function saveAs(data: any, filename?: string, options?: any): void;
}
