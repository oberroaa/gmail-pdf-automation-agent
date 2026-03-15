// Este archivo crea los objetos visuales que pdfjs-dist busca en Vercel
// para evitar que dependa de librerías gráficas pesadas como canvas.
global.DOMMatrix = global.DOMMatrix || class DOMMatrix {};
global.ImageData = global.ImageData || class ImageData {};
global.Path2D = global.Path2D || class Path2D {};
