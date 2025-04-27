'use client';

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import type { ConcursoRow, ConcursoCell } from '@/types/concursos'; // Adjusted imports
import Link from 'next/link';
import { ExternalLink } from "lucide-react"; // Icon for external links

interface ConcursoTableProps {
  title: string;
  headers: string[];
  rows: ConcursoRow[];
}

const ConcursoTable: React.FC<ConcursoTableProps> = ({ title, headers, rows }) => {
  if (!rows || rows.length === 0) {
    return null;
  }

  const hasHeaders = headers && headers.length > 0 && headers.some(h => h !== '');

  return (
    <Card className="shadow-lg overflow-hidden bg-card rounded-xl border border-secondary transform transition duration-300 hover:shadow-xl">
       <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
        {/* Optional: Add a description if needed */}
        {/* <CardDescription className="text-muted-foreground">Detalhes dos concursos encontrados.</CardDescription> */}
      </CardHeader>
      <CardContent className="p-0">
          <Table>
             {hasHeaders && (
                <TableHeader className="bg-gold-pale/50"> {/* Use a pale gold for header bg */}
                <TableRow>
                    {headers.map((header, index) => (
                    <TableHead key={index} className={`p-4 font-bold text-gold-dark ${index === 0 ? "w-[40%] sm:w-[50%] md:w-[60%]" : "text-left"}`}>{header}</TableHead>
                    ))}
                </TableRow>
                </TableHeader>
             )}
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gold-bg border-b border-gold-pale last:border-b-0 transition-colors duration-200">
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="p-4 align-top text-sm text-foreground"> {/* Consistent padding & align */}
                      {cell.link ? (
                        <Link
                          href={cell.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded inline-flex items-center gap-1 group break-words"
                        >
                          {cell.text || "Abrir Link"} {/* Provide fallback text */}
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      ) : (
                        // Use dangerouslySetInnerHTML for cells containing 'previsto' div or other specific HTML
                        // Ensure the HTML is sanitized if it comes from untrusted sources.
                        // Here we assume the 'previsto' div is safe.
                        <span className="break-words" dangerouslySetInnerHTML={{ __html: cell.text.replace('<div class="label-previsto">previsto</div>', '<span class="text-xs font-semibold bg-secondary text-secondary-foreground py-0.5 px-1.5 rounded-md ml-1 align-middle">PREVISTO</span>') }}></span>

                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
};

export default ConcursoTable;
