'use client'

import React, { useTransition } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation';
import { createNewDocument } from '@/actions/actions';

const NewDocumentButton = () => {
    const[isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCreateDocument = () => {
      startTransition(async() => {
        const {docId} = await createNewDocument();
        router.push(`/doc/${docId}`)
      })
    }
  return (
    <div>
        <Button className='cursor-pointer' onClick={handleCreateDocument} disabled={isPending}>
            {isPending? "Creating..." : "New Document"}
        </Button>
    </div>
  )
}

export default NewDocumentButton