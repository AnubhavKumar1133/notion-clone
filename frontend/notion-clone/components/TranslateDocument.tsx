'use client'
import React, { FormEvent, useState, useTransition } from 'react';
import * as Y from "yjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from './ui/button';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { BotIcon, LanguagesIcon } from 'lucide-react';
import { toast } from 'sonner';
import Markdown from "react-markdown";

type Language =
    | "english"
    | "Spanish"
    | "portuguese"
    | "french"
    | "german"
    | "chinese"
    | "arabic"
    | "hindi"
    | "russian"
    | "japanese";
const languages: Language[] = [
    "english",
    "Spanish",
    "portuguese",
    "french",
    "german",
    "chinese",
    "arabic",
    "hindi",
    "russian",
    "japanese",
];

function extractTextFromXml(xmlString: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
    const paragraphs = xmlDoc.getElementsByTagName("paragraph");
  
    let textContent = "";
  
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
  
      const paraText = para.textContent?.trim();
  
      if (paraText) {
        textContent += paraText + " ";
      }
    }  
    return textContent.trim();
  }
  

function TranslateDocument({doc}:{doc:Y.Doc}) {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState<string>("");
    const [summary, setSummary] = useState("");
    const [question, setQuestion] = useState("");
    const [isPending, startTransition] = useTransition();


    const handleAskQuestion = (e:FormEvent) => {
        e.preventDefault();
        
        startTransition(async () => {
            const fragment = doc.getXmlFragment("document-user");
            const rawXml = fragment.toString();

            const extractedText = extractTextFromXml(rawXml);
            const documentData=extractedText
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    documentData,
                    targetLanguage: language
                }),
            });

            if (res.ok) {
            const { translated_text } = await res.json();
            setSummary(translated_text);
            toast.success("Translated Summary successfully!");
            } else {
            toast.error("Translation failed. Server returned " + res.status);
            }
        });
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <Button asChild variant="outline">
        <DialogTrigger>
            <LanguagesIcon/>
            Translate
        </DialogTrigger>
    </Button>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Translate the Document</DialogTitle>
        <DialogDescription>
            Select a language and AI will translate a summary of the document in the language selected.
        </DialogDescription>
        <hr className='mt-5'/>
        {question && <p className='mt-5 text-gray-500'>Q: {question}</p>}

        </DialogHeader>
        {
            summary && (
                <div className='flex flex-col items-start max-h-96 overflow-y-scroll gap-2 bg-gray-100'>
                    <div className='flex'>
                        <BotIcon className='w-10 flex-shrink-0'/>
                        <p className='font-bold'>
                            GPT {isPending ? "is thinking...": "Says:"}
                        </p>
                    </div>
                    
                        {isPending?"Thinking...": <Markdown>{summary}</Markdown>}  
                    
                </div>
            )
        }
        <form className="flex gap-2" onSubmit={handleAskQuestion}>
        <Select value={language} onValueChange={(value) => setLanguage(value)}>
            <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
            {languages.map((language) => (
                <SelectItem key={language} value={language}>
                {language.charAt(0).toUpperCase() + language.slice(1)}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>

        <Button type="submit" disabled={!language || isPending}>
            {isPending ? "Translating..." : "Translate"}
        </Button>
        </form>

    </DialogContent>
    </Dialog>
  )

}

export default TranslateDocument