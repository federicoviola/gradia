'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Pencil, Trash2, Plus, Save, X, GripVertical } from 'lucide-react';

interface Question {
    id: string;
    text: string;
}

interface ExamEditorProps {
    initialContent: string;
    onSave: (content: string) => void;
}

export function ExamEditor({ initialContent, onSave }: ExamEditorProps) {
    const [questions, setQuestions] = useState<Question[]>(
        parseQuestionsFromContent(initialContent)
    );
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleEdit = (id: string) => {
        setEditingId(id);
    };

    const handleSaveQuestion = (id: string, newText: string) => {
        setQuestions(prev =>
            prev.map(q => (q.id === id ? { ...q, text: newText } : q))
        );
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleAdd = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: '',
        };
        setQuestions(prev => [...prev, newQuestion]);
        setEditingId(newQuestion.id);
    };

    const handleSave = () => {
        const newContent = questions
            .filter(q => q.text.trim()) // Remove empty questions
            .map((q, i) => `${i + 1}. ${q.text}`)
            .join('\n\n');
        onSave(newContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset to initial content
        setQuestions(parseQuestionsFromContent(initialContent));
        setEditingId(null);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Editar Examen
            </Button>
        );
    }

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Editando Examen</h3>
                <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {questions.map((question, index) => (
                    <QuestionEditor
                        key={question.id}
                        question={question}
                        index={index}
                        isEditing={editingId === question.id}
                        onEdit={() => handleEdit(question.id)}
                        onSave={(text) => handleSaveQuestion(question.id, text)}
                        onDelete={() => handleDelete(question.id)}
                    />
                ))}
            </div>

            <Button onClick={handleAdd} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Pregunta
            </Button>
        </Card>
    );
}

interface QuestionEditorProps {
    question: Question;
    index: number;
    isEditing: boolean;
    onEdit: () => void;
    onSave: (text: string) => void;
    onDelete: () => void;
}

function QuestionEditor({ question, index, isEditing, onEdit, onSave, onDelete }: QuestionEditorProps) {
    const [editText, setEditText] = useState(question.text);

    if (isEditing) {
        return (
            <Card className="p-3 bg-muted/50">
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <span className="font-semibold text-sm mt-2">{index + 1}.</span>
                        <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 min-h-[80px]"
                            placeholder="Escribe tu pregunta..."
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            onClick={() => {
                                onSave(editText);
                            }}
                            size="sm"
                            variant="default"
                        >
                            Guardar
                        </Button>
                        <Button
                            onClick={() => {
                                setEditText(question.text);
                                onEdit();
                            }}
                            size="sm"
                            variant="outline"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm">
                        <span className="font-semibold">{index + 1}.</span> {question.text || <span className="text-muted-foreground italic">Pregunta vacía</span>}
                    </p>
                </div>
                <div className="flex gap-1">
                    <Button
                        onClick={onEdit}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={onDelete}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

function parseQuestionsFromContent(content: string): Question[] {
    // Split by double newlines or numbered questions
    const lines = content.split(/\n\n+/);

    return lines
        .map((line, i) => {
            // Remove leading numbers like "1. ", "2. ", etc.
            const cleaned = line.trim().replace(/^\d+\.\s*/, '');
            return {
                id: i.toString(),
                text: cleaned,
            };
        })
        .filter(q => q.text); // Remove empty questions
}
