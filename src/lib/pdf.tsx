import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

function sanitizeFilename(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\\/:*?"<>|]/g, "-")
    .slice(0, 180);
}

export function toPdfFilename(name: string) {
  const base = sanitizeFilename(name || "document") || "document";
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

async function waitForNextPaint() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export async function exportElementToPdf(element: HTMLElement, filename: string) {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  await waitForNextPaint();

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(toPdfFilename(filename));
}

export async function exportReactNodeToPdf(node: ReactNode, filename: string) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = "794px";
  host.style.background = "white";
  host.style.color = "black";
  host.style.padding = "24px";
  host.style.zIndex = "-1";

  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(<div className="bg-white text-black">{node}</div>);

  try {
    await waitForNextPaint();
    await exportElementToPdf(host, filename);
  } finally {
    root.unmount();
    host.remove();
  }
}

export async function exportHtmlToPdf(html: string, filename: string) {
  return exportReactNodeToPdf(
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />,
    filename
  );
}
