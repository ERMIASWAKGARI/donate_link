/* eslint-disable react/prop-types */
// components/PDFViewer.jsx
import * as pdfjsLib from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const PDFViewer = ({ url }) => {
  const canvasRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setError(null);
      } catch (err) {
        console.error('PDF error:', err);
        setError('Failed to load PDF');
      }
    };

    loadPDF();
  }, [url, pageNumber]);

  return (
    <div className="pdf-viewer">
      {error ? (
        <div className="error">
          <p>{error}</p>
          <a href={url} download>
            Download PDF
          </a>
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} />
          <div className="controls">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </button>
            <span>
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PDFViewer;
