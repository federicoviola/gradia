'use client';

import { useForm, useWatch } from 'react-hook-form';
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
import { LoaderCircle, Upload, FileText, X } from 'lucide-react';
import { examGeneratorFormSchema } from '@/lib/types';
import { useLocale } from '@/context/language-context';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';

type ExamGeneratorFormProps = {
  onGenerate: (data: z.infer<typeof examGeneratorFormSchema>) => Promise<void>;
  isLoading: boolean;
};

export function ExamGeneratorForm({ onGenerate, isLoading }: ExamGeneratorFormProps) {
  const { t } = useLocale();
  const [sourceFile, setSourceFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof examGeneratorFormSchema>>({
    resolver: zodResolver(examGeneratorFormSchema),
    defaultValues: {
      examTopic: '',
      examType: 'multiple-choice',
      sourceFile: undefined,
      instructions: '',
    },
  });

  const examType = useWatch({
    control: form.control,
    name: 'examType',
  });

  useEffect(() => {
    form.setValue('sourceFile', sourceFile?.name, { shouldValidate: true });
  }, [sourceFile, form]);

  const onSubmit = async (data: z.infer<typeof examGeneratorFormSchema>) => {
    if (examType === 'practical-work-from-document' && sourceFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = (e.target?.result as string).split(',')[1];
            await onGenerate({
              ...data,
              sourceFile: base64
            });
        };
        reader.readAsDataURL(sourceFile);
    } else {
       await onGenerate(data);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSourceFile(file);
    }
  };

  const removeFile = () => {
    setSourceFile(null);
    form.setValue('sourceFile', undefined, { shouldValidate: true });
  }

  const isPracticalWork = examType === 'practical-work-from-document';

  return (
    <Card className="shadow-lg transition-all duration-300 animate-in fade-in-0 zoom-in-95">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('generateExam')}</CardTitle>
        <CardDescription>{t('generateExamDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">{t('examType')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an exam type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="multiple-choice">{t('examTypeMultipleChoice')}</SelectItem>
                      <SelectItem value="open-questions">{t('examTypeOpenQuestions')}</SelectItem>
                      <SelectItem value="essay">{t('examTypeEssay')}</SelectItem>
                      <SelectItem value="practical-work-from-document">{t('examTypePracticalWork')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="examTopic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">{t('examTopic')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('examTopicPlaceholder')}
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('examTopicDesc')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isPracticalWork && (
              <>
                <FormField
                  control={form.control}
                  name="sourceFile"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">{t('sourceDocument')} <span className="text-sm text-muted-foreground">(Optional)</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="file-upload-generator"
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                          <label
                            htmlFor="file-upload-generator"
                            className="flex justify-center items-center w-full min-h-[150px] border-2 border-dashed rounded-md cursor-pointer border-primary/50 bg-primary/10 hover:bg-primary/20"
                          >
                              <div className="text-center text-muted-foreground">
                                <Upload className="mx-auto h-10 w-10" />
                                <p className="mt-2 font-semibold text-primary">{t('uploadPdfSource')}</p>
                                 <p className="text-xs">{t('uploadPdfSourceDesc')}</p>
                              </div>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {sourceFile && (
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('selectedFile')}</h4>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-5 w-5 shrink-0 text-primary" />
                        <span className="truncate text-sm font-medium">{sourceFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">{t('instructions')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('instructionsPlaceholder')}
                          className="min-h-[100px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('instructionsDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  {t('generating')}...
                </>
              ) : (
                t('generateExamWithAI')
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
