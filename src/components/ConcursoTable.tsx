'use client';

import * as React from "react";
import {
  Table,
  TableBody,
  TableCaption,
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
  if (!data || !data.headers || data.rows.length === 0) {
    return (
       <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Nenhum Concurso Encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não foram encontrados concursos para o estado selecionado ou houve um problema ao buscar os dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg overflow-hidden">
       <CardHeader>
        <CardTitle>Concursos Encontrados</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                {data.headers.map((header, index) => (
                  <TableHead key={index} className={index === 0 ? "w-[60%]" : ""}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {cell.link ? (
                        <Link href={cell.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                          {cell.text}
                        </Link>
                      ) : (
                        cell.text
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
