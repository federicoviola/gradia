'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, FileText, Upload, X } from 'lucide-react';
import { gradingFormSchema, type SavedCriteria } from '@/lib/types';
import { useLocale } from '@/context/language-context';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { PDFPreview } from '@/components/pdf-preview';

type GradingFormProps = {
  onGrade: (data: z.infer<typeof gradingFormSchema>) => Promise<void>;
  isLoading: boolean;
  initialCriteria?: string;
  savedCriteria: SavedCriteria[];
  onSelectCriteria: (criteria: string) => void;
};

export function GradingForm({ onGrade, isLoading, initialCriteria, savedCriteria, onSelectCriteria }: GradingFormProps) {
  const { t } = useLocale();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof gradingFormSchema>>({
    resolver: zodResolver(gradingFormSchema),
    defaultValues: {
      evaluationCriteria: initialCriteria || '',
      examFiles: [],
    },
  });

  useEffect(() => {
    if (initialCriteria) {
      form.setValue('evaluationCriteria', initialCriteria);
    }
  }, [initialCriteria, form]);

  useEffect(() => {
    form.setValue('examFiles', selectedFiles.map(f => f.name), { shouldValidate: true });
  }, [selectedFiles, form]);

  const onSubmit = async (data: z.infer<typeof gradingFormSchema>) => {
    const filePromises = selectedFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = (e.target?.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Files = await Promise.all(filePromises);
      await onGrade({
        ...data,
        examFiles: base64Files
      });
    } catch (error) {
      console.error("Error reading files:", error);
    }
  };


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];

    if (newFiles.length === 0) return;

    // Check if adding these files would exceed the limit
    const totalFiles = selectedFiles.length + newFiles.length;
    if (totalFiles > 50) {
      toast({
        variant: 'destructive',
        title: 'Demasiados archivos',
        description: `Se permiten máximo 50 archivos. Actualmente tienes ${selectedFiles.length} y estás intentando agregar ${newFiles.length}.`,
      });
      event.target.value = ''; // Reset input
      return;
    }

    // Validate all new files
    const { validateFiles } = await import('@/lib/file-validation');
    const errors = await validateFiles(newFiles);

    if (errors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Archivos inválidos',
        description: errors[0].error,
      });
      event.target.value = ''; // Reset input
      return;
    }

    // All files are valid, add them
    setSelectedFiles(prev => [...prev, ...newFiles]);
    event.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  const handleCriteriaSelect = (criteriaId: string) => {
    const selected = savedCriteria.find(c => c.id === criteriaId);
    if (selected) {
      form.setValue('evaluationCriteria', selected.criteria);
      onSelectCriteria(selected.criteria);
    }
  };

  return (
    <Card className="shadow-lg transition-all duration-300 animate-in fade-in-0 zoom-in-95">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('startGrading')}</CardTitle>
        <CardDescription>{t('startGradingDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {savedCriteria.length > 0 && (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Load Saved Criteria</FormLabel>
                <Select onValueChange={handleCriteriaSelect}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a saved criteria to load" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {savedCriteria.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="evaluationCriteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">{t('evaluationCriteria')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('evaluationCriteriaPlaceholder')}
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('evaluationCriteriaDesc')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="examFiles"
              render={() => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">{t('studentExams')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex justify-center items-center w-full min-h-[150px] border-2 border-dashed rounded-md cursor-pointer border-primary/50 bg-primary/10 hover:bg-primary/20"
                      >
                        <div className="text-center text-muted-foreground">
                          <Upload className="mx-auto h-10 w-10" />
                          <p className="mt-2 font-semibold text-primary">{t('uploadPdf')}</p>
                          <p className="text-xs">{t('uploadPdfDesc')}</p>
                        </div>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">{t('selectedFiles')} ({selectedFiles.length})</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <PDFPreview
                      key={`${file.name}-${index}`}
                      file={file}
                      onRemove={() => removeFile(index)}
                    />
                  ))}
                </div>
              </div>
            )}


            <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading || selectedFiles.length === 0}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  {t('grading')}...
                </>
              ) : (
                t('gradeExamsWithAI')
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
