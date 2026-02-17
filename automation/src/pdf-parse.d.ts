declare module 'pdf-parse' {
  interface PdfData {
    numpages: number
    numrender: number
    info: Record<string, unknown>
    metadata: Record<string, unknown>
    text: string
  }
  function pdfParse(buffer: Buffer): Promise<PdfData>
  export = pdfParse
}
