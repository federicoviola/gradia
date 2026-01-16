'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Copy, Check, Wand2, Save } from 'lucide-react';
import { useLocale } from '@/context/language-context';
import type { GeneratedExam } from '@/lib/types';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { useSession } from 'next-auth/react';
import { ExamEditor } from './exam-editor';

type ExamDisplayProps = {
  exam: GeneratedExam;
  onUseCriteria: (criteria: string) => void;
  onSaveCriteria: (name: string, criteria: string) => void;
};

export function ExamDisplay({ exam, onUseCriteria, onSaveCriteria }: ExamDisplayProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const { t } = useLocale();
  const [copied, setCopied] = useState<'exam' | 'criteria' | null>(null);
  const [criteriaName, setCriteriaName] = useState('');
  const [editedExamContent, setEditedExamContent] = useState(exam.examContent);

  const handleCopy = (content: string, type: 'exam' | 'criteria') => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (criteriaName.trim()) {
      onSaveCriteria(criteriaName.trim(), exam.evaluationCriteria);
    }
  };


  return (
    <div id="exam-section" className="print-container mt-12 space-y-8 animate-in fade-in-0 zoom-in-95 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="font-headline text-3xl font-bold">{t('generatedExamTitle')}</h2>
          <p className="text-muted-foreground">
            {t('generatedExamDesc')}
          </p>
        </div>
        <div className="flex gap-2 no-print w-full sm:w-auto">
          <Button onClick={handlePrint} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <FileDown className="mr-2 h-4 w-4" />
            {t('printOrSave')}
          </Button>
        </div>
      </div>

      <Card className="print-card shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('examContentTitle')}</CardTitle>
            <Button onClick={() => handleCopy(exam.examContent, 'exam')} variant="outline" size="sm">
              {copied === 'exam' ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied === 'exam' ? t('copied') : t('copy')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="print-card-content p-6">
          <div className="space-y-4">
            <div
              className="prose-styles max-w-none rounded-md border bg-muted/30 p-4"
              dangerouslySetInnerHTML={{ __html: editedExamContent }}
            />
            <div className="no-print">
              <ExamEditor
                initialContent={exam.examContent.replace(/<[^>]*>/g, '')} // Strip HTML
                onSave={(newContent) => setEditedExamContent(newContent.replace(/\n/g, '<br />'))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="print-card shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('evaluationCriteria')}</CardTitle>
              <CardDescription>{t('evaluationCriteriaGeneratedDesc')}</CardDescription>
            </div>
            <Button onClick={() => handleCopy(exam.evaluationCriteria, 'criteria')} variant="outline" size="sm">
              {copied === 'criteria' ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied === 'criteria' ? t('copied') : t('copy')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="print-card-content p-6">
          <div
            className="prose-styles max-w-none rounded-md border bg-muted/30 p-4"
            dangerouslySetInnerHTML={{ __html: exam.evaluationCriteria }}
          />
        </CardContent>
        <div className="p-6 pt-0 no-print space-y-4">
          <Separator />
          {user && (
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Save these criteria for later use</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a name for these criteria..."
                  value={criteriaName}
                  onChange={(e) => setCriteriaName(e.target.value)}
                />
                <Button onClick={handleSave} disabled={!criteriaName.trim()}>
                  <Save className="mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
          <Separator />
          <Button onClick={() => onUseCriteria(exam.evaluationCriteria)} size="lg" className="w-full">
            <Wand2 className="mr-2" />
            {t('useTheseCriteria')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
