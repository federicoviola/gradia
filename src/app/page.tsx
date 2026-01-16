'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { gradeStudentExams, generateExamAction, saveCriteria, getSavedCriteria } from '@/app/actions';
import { GradingForm } from '@/components/grading-form';
import { ResultsDisplay } from '@/components/results-display';
import type { GradingResult, gradingFormSchema, examGeneratorFormSchema, GeneratedExam, SavedCriteria } from '@/lib/types';
import type { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/context/language-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExamGeneratorForm } from '@/components/exam-generator-form';
import { ExamDisplay } from '@/components/exam-display';
import { FileSignature, BookCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isUserLoading = status === 'loading';
  const user = session?.user;

  const [isLoadingGrading, setIsLoadingGrading] = useState(false);
  const [isLoadingGenerating, setIsLoadingGenerating] = useState(false);
  const [results, setResults] = useState<GradingResult[]>([]);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);
  const [activeTab, setActiveTab] = useState('grading');
  const [criteriaToPass, setCriteriaToPass] = useState<string | undefined>(undefined);
  const [savedCriteria, setSavedCriteria] = useState<SavedCriteria[]>([]);

  const { toast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchCriteria = async () => {
        const criteriaList = await getSavedCriteria();
        if (criteriaList) {
          setSavedCriteria(criteriaList);
        }
      };
      fetchCriteria();
    }
  }, [user]);

  const handleGradeExams = async (data: z.infer<typeof gradingFormSchema>) => {
    setIsLoadingGrading(true);
    setResults([]);

    const response = await gradeStudentExams(data);

    setIsLoadingGrading(false);

    if (response.success && response.data) {
      setResults(response.data);
      toast({
        title: t('gradingCompleteTitle'),
        description: t('gradingCompleteDesc', { count: response.data.length }),
      });
    } else {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: response.error || t('errorDesc'),
      });
    }
  };

  const handleGenerateExam = async (data: z.infer<typeof examGeneratorFormSchema>) => {
    setIsLoadingGenerating(true);
    setGeneratedExam(null);

    const response = await generateExamAction(data);

    setIsLoadingGenerating(false);

    if (response.success && response.data) {
      setGeneratedExam(response.data);
      toast({
        title: t('examGeneratedTitle'),
        description: t('examGeneratedDesc'),
      });
    } else {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: response.error || t('errorGeneratingDesc'),
      });
    }
  };

  const handleSaveCriteria = async (name: string, criteria: string) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save criteria." });
      return;
    }
    const response = await saveCriteria({ name, criteria });
    if (response.success) {
      toast({
        title: "Criteria Saved",
        description: `The criteria "${name}" has been saved.`
      });
      const newSavedCriteria = await getSavedCriteria();
      if (newSavedCriteria) {
        setSavedCriteria(newSavedCriteria);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error
      });
    }
  };

  const handleUseCriteria = (criteria: string) => {
    setCriteriaToPass(criteria);
    setActiveTab('grading');
  }

  const showResults = !isLoadingGrading && results.length > 0;
  const showGeneratedExam = !isLoadingGenerating && generatedExam;

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
      <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto no-print">
        <TabsTrigger value="grading">
          <BookCheck className="mr-2" />
          {t('examGrading')}
        </TabsTrigger>
        <TabsTrigger value="generator">
          <FileSignature className="mr-2" />
          {t('examGenerator')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="grading">
        <div className="space-y-8">
          <div className={showResults ? 'no-print' : ''}>
            <GradingForm onGrade={handleGradeExams} isLoading={isLoadingGrading} initialCriteria={criteriaToPass} savedCriteria={savedCriteria} onSelectCriteria={setCriteriaToPass} />
          </div>

          {showResults && <ResultsDisplay results={results} />}

          {!showResults && !isLoadingGrading && (
            <Card className="mt-8 border-dashed">
              <CardHeader>
                <CardTitle>{t('welcomeTitle')}</CardTitle>
                <CardDescription>
                  {t('welcomeDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('welcomeContent')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
      <TabsContent value="generator">
        <div className="space-y-8">
          <div className={showGeneratedExam ? 'no-print' : ''}>
            <ExamGeneratorForm onGenerate={handleGenerateExam} isLoading={isLoadingGenerating} />
          </div>

          {showGeneratedExam && <ExamDisplay exam={generatedExam} onUseCriteria={handleUseCriteria} onSaveCriteria={handleSaveCriteria} />}

          {!showGeneratedExam && !isLoadingGenerating && (
            <Card className="mt-8 border-dashed">
              <CardHeader>
                <CardTitle>{t('examGeneratorWelcomeTitle')}</CardTitle>
                <CardDescription>
                  {t('examGeneratorWelcomeDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t('examGeneratorWelcomeContent')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}