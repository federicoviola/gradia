'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getEvaluationHistory, getEvaluationStats } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';

type Evaluation = {
    id: number;
    examType: string | null;
    totalStudents: number | null;
    averageGrade: string | null;
    createdAt: Date | null;
};

type Stats = {
    totalEvaluations: number;
    thisMonth: number;
    averageGrade: string;
    totalStudents: number;
};

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        async function loadData() {
            const [evals, statistics] = await Promise.all([
                getEvaluationHistory(),
                getEvaluationStats()
            ]);
            setEvaluations(evals || []);
            setStats(statistics);
            setIsLoading(false);
        }
        if (session) loadData();
    }, [session]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Resumen de tus evaluaciones y estadísticas
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Evaluaciones
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalEvaluations || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Este Mes
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.thisMonth || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Promedio General
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.averageGrade || '0.0'}/10</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Alumnos Evaluados
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Evaluations List */}
            <Card>
                <CardHeader>
                    <CardTitle>Evaluaciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    {evaluations.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No hay evaluaciones aún</p>
                            <Link href="/">
                                <Button className="mt-4">Crear Primera Evaluación</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {evaluations.map((evaluation) => (
                                <div key={evaluation.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                    <div>
                                        <p className="font-medium">
                                            {evaluation.createdAt
                                                ? new Date(evaluation.createdAt).toLocaleDateString('es-AR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })
                                                : 'Fecha desconocida'
                                            } - {evaluation.examType || 'Evaluación'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {evaluation.totalStudents} alumno{evaluation.totalStudents !== 1 ? 's' : ''} •
                                            Promedio: {evaluation.averageGrade}/10
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/results/${evaluation.id}`}>Ver Resultados</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
