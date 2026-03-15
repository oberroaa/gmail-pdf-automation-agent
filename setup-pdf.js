import { DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';

// Inyectar en el global para que pdfjs-dist los encuentre
globalThis.DOMMatrix = DOMMatrix;
globalThis.ImageData = ImageData;
globalThis.Path2D = Path2D;
