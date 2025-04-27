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
import type { ConcursoRow, ConcursoCell } from '@/types/concursos';
import Link from 'next/link';
import { ExternalLink } from "lucide-react";

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
    <Card className="shadow-lg overflow-hidden bg-card rounded-xl border border-border transform transition duration-300 hover:shadow-xl">
        <CardHeader>
         <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
       </CardHeader>
       <CardContent className="p-0">
           <div className="overflow-x-auto">
               <Table>
                 {hasHeaders ? (
                     <TableHeader className="bg-muted/50">
                       <TableRow>
                         {headers.map((header, index) => (
                           <TableHead
                             key={index}
                             className={`p-4 font-bold text-muted-foreground whitespace-nowrap ${index === 0 ? "w-[40%] sm:w-[50%]" : index === 1 ? "w-[15%] sm:w-[10%] text-center" : index === 2 ? "w-[25%] sm:w-[20%]" : "w-auto"
                             }`}
                            >
                               {header}
                             </TableHead>
                         ))}
                       </TableRow>
                     </TableHeader>
                   ) : null}
                 <TableBody>
                   {rows.map((row, rowIndex) => (
                     <TableRow key={rowIndex} className="hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors duration-200">
                       {row.cells.map((cell, cellIndex) => (
                         <TableCell
                             key={cellIndex}
                             className={`p-4 align-top text-sm text-foreground ${
                                 cellIndex === 1 ? "text-center"
                                 : ""
                             }`}
                         >
                           {cell.link ? (
                             <Link
                               href={cell.link}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-accent hover:text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded inline-flex items-center gap-1 group break-words"
                             >
                               {cell.text || "Abrir Link"}
                               <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                             </Link>
                           ) : (
                             <span
                               className="break-words"
                               dangerouslySetInnerHTML={{
                                   __html: cell.text.replace(/<div class="label-previsto">previsto<\/div>/gi,'<span class="inline-block text-xs font-semibold bg-secondary text-secondary-foreground py-0.5 px-1.5 rounded-md ml-1 align-middle whitespace-nowrap">PREVISTO</span>')
                               }}
                             ></span>
                           )}
                         </TableCell>
                       ))}
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
           </div>
       </CardContent>
    </Card>
  );
};

export default ConcursoTable;