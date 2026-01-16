export const FILE_CONSTRAINTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    MAX_FILES: 50,
    ALLOWED_TYPES: ['application/pdf'],
    PDF_MAGIC_NUMBER: '%PDF-',
} as const;

export interface FileValidationError {
    file: File;
    error: string;
}

export async function validatePDF(file: File): Promise<string | null> {
    // Check file size
    if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
        return `El archivo "${file.name}" excede el tamaño máximo de 10 MB`;
    }

    // Check MIME type
    if (file.type !== 'application/pdf') {
        return `El archivo "${file.name}" no es un PDF válido`;
    }

    // Check magic number (PDF header)
    try {
        const buffer = await file.slice(0, 5).arrayBuffer();
        const header = new TextDecoder().decode(buffer);

        if (!header.startsWith(FILE_CONSTRAINTS.PDF_MAGIC_NUMBER)) {
            return `El archivo "${file.name}" no es un PDF válido (header incorrecta)`;
        }
    } catch (error) {
        return `Error al leer el archivo "${file.name}"`;
    }

    return null; // Valid
}

export async function validateFiles(files: File[]): Promise<FileValidationError[]> {
    const errors: FileValidationError[] = [];

    // Check total count
    if (files.length > FILE_CONSTRAINTS.MAX_FILES) {
        errors.push({
            file: files[0],
            error: `Se permiten máximo ${FILE_CONSTRAINTS.MAX_FILES} archivos. Has seleccionado ${files.length}.`,
        });
        return errors;
    }

    // Validate each file
    for (const file of files) {
        const error = await validatePDF(file);
        if (error) {
            errors.push({ file, error });
        }
    }

    return errors;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
