'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/file-validation';

interface PDFPreviewProps {
    file: File;
    onRemove: () => void;
}

export function PDFPreview({ file, onRemove }: PDFPreviewProps) {
    return (
        <Card className="p-4">
            <div className="flex gap-4">
                {/* Icon instead of thumbnail */}
                <div className="w-16 h-16 border rounded bg-muted flex-shrink-0 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
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
                            <p className="text-xs text-muted-foreground">
                                PDF • Listo para procesar
                            </p>
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
