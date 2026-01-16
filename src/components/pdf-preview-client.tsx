'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/file-validation';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
    file: File;
    onRemove: () => void;
}

export function PDFPreview({ file, onRemove }: PDFPreviewProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [error, setError] = useState(false);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <Card className="p-4">
            <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-32 h-40 border rounded overflow-hidden bg-muted flex-shrink-0">
                    {!error ? (
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={() => setError(true)}
                            loading={
                                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                    Cargando...
                                </div>
                            }
                        >
                            <Page
                                pageNumber={1}
                                width={128}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                loading=""
                            />
                        </Document>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Tamaño: {formatFileSize(file.size)}
                            </p>
                            {numPages > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Páginas: {numPages}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRemove}
                            className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
