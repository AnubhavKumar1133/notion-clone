'use client'

import React from "react";
import { use } from "react";
import Document from "@/components/Document";

const DocumentPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  return <Document id={id} />;
};

export default DocumentPage;
