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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConcursoRow, ConcursoCell } from '@/types/concursos'; // Adjusted imports
import Link from 'next/link';

interface ConcursoTableProps {
  title: string; // Title for the card (e.g., "Concursos Abertos", "Concursos Previstos")
  headers: string[];
  rows: ConcursoRow[];
}

const ConcursoTable: React.FC<ConcursoTableProps> = ({ title, headers, rows }) => {
  // Only render if there are rows to display
  if (!rows || rows.length === 0) {
    return null; // Let the parent component handle the "no results overall" message
  }

   // Check if headers are present and meaningful.
  const hasHeaders = headers && headers.length > 0 && headers.some(h => h !== '');

  return (
    <Card className="shadow-lg overflow-hidden bg-card">
       <CardHeader>
        <CardTitle>{title}</CardTitle> {/* Use the passed title */}
      </CardHeader>
      <CardContent className="p-0">
          <Table>
             {/* Only render TableHeader if headers were successfully extracted */}
             {hasHeaders && (
                <TableHeader className="bg-muted">
                <TableRow>
                    {headers.map((header, index) => (
                    // Basic width heuristic for the first column
                    <TableHead key={index} className={index === 0 ? "w-[40%] sm:w-[50%] md:w-[60%]" : "text-left"}>{header}</TableHead>
                    ))}
                </TableRow>
                </TableHeader>
             )}
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50">
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="p-3 align-top text-sm"> {/* Consistent padding & align */}
                      {cell.link ? (
                        <Link href={cell.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded break-words">
                          {cell.text || "Link"} {/* Provide fallback text for link */}
                        </Link>
                      ) : (
                        // Render potentially complex HTML within the cell if needed, or just text
                        // Using dangerouslySetInnerHTML for the 'previsto' div case, but sanitize if needed.
                        // For simple text, just use the span.
                        <span className="text-foreground break-words" dangerouslySetInnerHTML={{ __html: cell.text }}></span>
                        // <span className="text-foreground break-words">{cell.text}</span>
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
