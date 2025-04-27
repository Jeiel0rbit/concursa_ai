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
import type { ConcursoData } from '@/types/concursos'; // Ensure this path is correct
import Link from 'next/link';

interface ConcursoTableProps {
  data: ConcursoData;
}

const ConcursoTable: React.FC<ConcursoTableProps> = ({ data }) => {
  // Only render this table if there are regular rows to display
  if (!data || !data.rows || data.rows.length === 0) {
    // Don't show a message here if rows are empty, the main page handles the overall "no results" state.
    return null;
  }

   // Check if headers are present. If not, don't render the table header.
  const hasHeaders = data.headers && data.headers.length > 0 && data.headers.some(h => h !== '');

  return (
    <Card className="shadow-lg overflow-hidden bg-card"> {/* Removed mt-8, handled by parent */}
       <CardHeader>
        <CardTitle>Concursos Abertos e em Andamento</CardTitle>
         {/* Removed description, kept it simple */}
      </CardHeader>
      <CardContent className="p-0">
          <Table>
             {/* Only render TableHeader if headers were successfully extracted */}
             {hasHeaders && (
                <TableHeader className="bg-muted">
                <TableRow>
                    {data.headers.map((header, index) => (
                    // Basic width heuristic for the first column
                    <TableHead key={index} className={index === 0 ? "w-[50%] md:w-[60%]" : "text-left"}>{header}</TableHead>
                    ))}
                </TableRow>
                </TableHeader>
             )}
            <TableBody>
              {data.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50">
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="p-3 align-top text-sm"> {/* Consistent padding & align */}
                      {cell.link ? (
                        <Link href={cell.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded break-words">
                          {cell.text || "Link"} {/* Provide fallback text for link */}
                        </Link>
                      ) : (
                        <span className="text-foreground break-words">{cell.text}</span> // Ensure default text color
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
