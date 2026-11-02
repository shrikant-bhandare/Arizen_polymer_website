import { meta } from '../content/proposal';

/**
 * Downloads the pre-built PDF when it is hosted next to the page; otherwise
 * (opened from disk, or no PDF deployed) opens the print dialog, which uses the
 * dedicated print layout so "Save as PDF" produces the same document.
 */
export async function downloadProposalPdf(): Promise<void> {
  // Pages opened straight from disk cannot fetch neighbouring files.
  if (location.protocol === 'file:') {
    window.print();
    return;
  }
  try {
    const res = await fetch(meta.pdfFileName, { method: 'HEAD', cache: 'no-store' });
    if (res.ok && (res.headers.get('content-type') ?? '').includes('pdf')) {
      const link = document.createElement('a');
      link.href = meta.pdfFileName;
      link.download = meta.pdfFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }
  } catch {
    // file:// pages cannot fetch; fall through to printing.
  }
  window.print();
}
