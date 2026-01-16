'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getEvaluationResults } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';

type Result = {
    id: number;
    studentName: string | null;
    grade: string | null;
    feedback: string | null;
    submissionPath: string | null;
};

type Evaluation = {
    id: number;
    examType: string | null;
    createdAt: Date | null;
    averageGrade: string | null;
    totalStudents: number | null;
};

export default function ResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [data, setData] = useState<{ evaluation: Evaluation; results: Result[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        async function loadData() {
            if (!params.id) return;
            const results = await getEvaluationResults(parseInt(params.id as string));
            setData(results);
            setIsLoading(false);
        }
        if (session) loadData();
    }, [params.id, session]);

    const toggleExpand = (id: number) => {
        setExpandedResults(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleExportCSV = () => {
        if (!data) return;
        exportToCSV(data.results, `evaluacion_${params.id}`);
    };

    const handleExportPDF = () => {
        if (!data) return;
        exportToPDF(data.evaluation, data.results, `evaluacion_${params.id}`);
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Cargando resultados...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-muted-foreground">No se encontraron resultados</p>
                <Button asChild>
                    <Link href="/dashboard">Volver al Dashboard</Link>
                </Button>
            </div>
        );
    }

    const passedStudents = data.results.filter(r => parseFloat(r.grade || '0') >= 6).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Link>
                </Button>
                <div className="flex gap-2 no-print">
                    <Button variant="outline" onClick={handleExportCSV}>
                        <FileText className="mr-2 h-4 w-4" />
                        CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                </div>
            </div>

            {/* Header Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {data.evaluation.examType || 'Evaluación'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {data.evaluation.createdAt
                            ? new Date(data.evaluation.createdAt).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })
                            : 'Fecha desconocida'
                        }
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Estudiantes</p>
                            <p className="text-2xl font-bold">{data.results.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Promedio</p>
                            <p className="text-2xl font-bold">{data.evaluation.averageGrade}/10</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Aprobados</p>
                            <p className="text-2xl font-bold text-green-600">{passedStudents}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Desaprobados</p>
                            <p className="text-2xl font-bold text-red-600">{data.results.length - passedStudents}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results List */}
            <div className="space-y-3">
                <h2 className="text-xl font-semibold">Resultados por Estudiante</h2>
                {data.results.map(result => {
                    const isExpanded = expandedResults.has(result.id);
                    const grade = parseFloat(result.grade || '0');
                    const gradeColor = grade >= 6 ? 'text-green-600' : 'text-red-600';

                    return (
                        <Card key={result.id} className="overflow-hidden">
                            <button
                                onClick={() => toggleExpand(result.id)}
                                className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-lg">
                                            {result.studentName || 'Sin nombre'}
                                        </p>
                                        <p className={`text-2xl font-bold ${gradeColor}`}>
                                            {result.grade}/10
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {isExpanded && result.feedback && (
                                <div className="border-t p-4 bg-muted/20">
                                    <h4 className="font-semibold mb-2">Feedback:</h4>
                                    <div className="prose prose-sm max-w-none">
                                        <p className="whitespace-pre-wrap text-sm">{result.feedback}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
