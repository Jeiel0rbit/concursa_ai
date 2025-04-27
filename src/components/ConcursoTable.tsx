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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ConcursoData } from '@/types/concursos'; // Ensure this path is correct
import Link from 'next/link';

interface ConcursoTableProps {
  data: ConcursoData;
}

const ConcursoTable: React.FC<ConcursoTableProps> = ({ data }) => {
  // Check specifically if there are rows to display
  if (!data || !data.rows || data.rows.length === 0) {
    // If predicted contests exist, don't show this message, otherwise inform the user.
    if (!data?.predicted) {
       return (
         <Card className="mt-8 shadow-lg bg-card">
           <CardHeader>
             <CardTitle>Nenhum Concurso Ativo Encontrado</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">Não foram encontrados concursos ativos para o estado selecionado no momento. Verifique a seção de previstos, se disponível.</p>
           </CardContent>
         </Card>
       );
    }
    // If there are predicted contests but no active ones, render nothing here.
    return null;
  }

   // Check if headers are present. If not, don't render the table header.
  const hasHeaders = data.headers && data.headers.length > 0 && data.headers.some(h => h !== '');

  return (
    <Card className="mt-8 shadow-lg overflow-hidden bg-card">
       <CardHeader>
        <CardTitle>Concursos Abertos e em Andamento</CardTitle>
         {/* Optional: Add a description if needed */}
        {/* <CardDescription>Lista de concursos atualmente disponíveis.</CardDescription> */}
      </CardHeader>
      <CardContent className="p-0">
          <Table>
             {/* Only render TableHeader if headers were successfully extracted */}
             {hasHeaders && (
                <TableHeader className="bg-muted">
                <TableRow>
                    {data.headers.map((header, index) => (
                    // Adjust width heuristic if needed, e.g., based on typical content
                    <TableHead key={index} className={index === 0 ? "w-[50%] md:w-[60%]" : ""}>{header}</TableHead>
                    ))}
                </TableRow>
                </TableHeader>
             )}
            <TableBody>
              {data.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50">
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="p-3 align-top"> {/* Adjust padding */}
                      {cell.link ? (
                        <Link href={cell.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded">
                          {cell.text || "Link"} {/* Provide fallback text for link */}
                        </Link>
                      ) : (
                        <span className="text-foreground">{cell.text}</span> // Ensure default text color
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
