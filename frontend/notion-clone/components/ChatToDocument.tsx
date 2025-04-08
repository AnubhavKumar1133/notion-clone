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
import { BotIcon, LanguagesIcon, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import Markdown from "react-markdown";
import { Input } from './ui/input';

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
  

function ChatToDocument({doc}:{doc:Y.Doc}) {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState<string>("");
    const [summary, setSummary] = useState("");
    const [question, setQuestion] = useState("");
    const [isPending, startTransition] = useTransition();
    const [input, setInput] = useState('')

    const handleAskQuestion = (e:FormEvent) => {
        e.preventDefault();
        setQuestion(input)
        startTransition(async () => {
            const fragment = doc.getXmlFragment("document-user");
            const rawXml = fragment.toString();
            const extractedText = extractTextFromXml(rawXml);
            const documentData=extractedText
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    documentData,
                    question: input
                }),
            });

            if (res.ok) {
            const { message } = await res.json();
            setInput("");
            setSummary(message)
            toast.success("Question Summary successfully!");
            } else {
                setInput("");
                setSummary("ChatGPT is down currently, try again later!")
            }
        });
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <Button asChild variant="outline">
        <DialogTrigger>
            <MessageCircle/>
            Chat to Document
        </DialogTrigger>
    </Button>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>Chat to the Document!</DialogTitle>
        <DialogDescription>
            Ask a question and chat to the document with AI.
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
            <Input 
                type='text'
                placeholder='i.e. what is this about?'
                className='w-full'
                value={input}
                onChange={(e)=>setInput(e.target.value)}
            />
        <Button type="submit" disabled={!input || isPending}>
            {isPending ? "Asking..." : "Ask"}
        </Button>    
        </form>
    </DialogContent>
    </Dialog>
  )

}

export default ChatToDocument