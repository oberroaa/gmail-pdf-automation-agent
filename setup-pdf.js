import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfjsDist = require("pdfjs-dist/build/pdf.js");
pdfjsDist.GlobalWorkerOptions.workerSrc = `./node_modules/pdfjs-dist/build/pdf.worker.mjs`;
