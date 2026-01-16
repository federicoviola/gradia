'use client';

import type { GradingResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocale } from '@/context/language-context';

type ResultsDisplayProps = {
  results: GradingResult[];
};

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const { t } = useLocale();

  const getGradeStyle = (grade: number): React.CSSProperties => {
    let colorVar: string;
    if (grade >= 90) {
      colorVar = 'var(--grade-excellent)';
    } else if (grade >= 70) {
      colorVar = 'var(--grade-good)';
    } else if (grade >= 50) {
      colorVar = 'var(--grade-average)';
    } else {
      colorVar = 'var(--grade-poor)';
    }
    
    return { 
      backgroundColor: `hsl(${colorVar})`,
      color: `hsl(var(--primary-foreground))`
    };
  }

  return (
    <div id="results-section" className="print-container mt-12 space-y-8 animate-in fade-in-0 zoom-in-95 duration-500">
       <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="font-headline text-3xl font-bold">{t('gradingResultsTitle')}</h2>
          <p className="text-muted-foreground">
            {t('gradingResultsDesc')}
          </p>
        </div>
        <Button onClick={() => window.print()} className="no-print w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
          <FileDown className="mr-2 h-4 w-4" />
          {t('downloadPdfReport')}
        </Button>
      </div>

      <div className="space-y-6">
        {results.map((result, index) => (
          <Card key={`${result.studentId}-${index}`} className="print-card shadow-lg">
            <CardHeader className="print-card-header flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  <GraduationCap className="h-6 w-6 text-primary"/>
                  {result.studentId}
                </CardTitle>
              </div>
              <div className="text-right">
                 <p className="mb-1 text-sm text-muted-foreground">{t('overallGrade')}</p>
                 <Badge style={getGradeStyle(result.grade)} className="badge-print px-4 py-2 text-2xl font-bold">
                   {result.grade}/100
                 </Badge>
              </div>
            </CardHeader>
            <CardContent className="print-card-content">
              <Separator className="my-4" />
              <h4 className="mb-2 text-lg font-semibold">{t('personalizedFeedback')}</h4>
              <div 
                className="prose-styles max-w-none rounded-md border bg-muted/30 p-4"
                dangerouslySetInnerHTML={{ __html: result.feedback }} 
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
