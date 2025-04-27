'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Code, Database, Palette } from 'lucide-react'; // Import relevant icons

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfoDialog: React.FC<InfoDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-lg bg-card border-border rounded-lg shadow-xl"> {/* Use card bg, theme border, make responsive */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-primary"> {/* Use primary color for title */}
            <Info className="h-6 w-6" />
            Sobre o Concursa Aí
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Informações sobre o projeto e tecnologias utilizadas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-foreground">
          <div className="flex items-start gap-3">
            <Code className="h-5 w-5 mt-1 text-primary flex-shrink-0" /> {/* Use primary color for icon */}
            <div>
              <h4 className="font-semibold">Propósito</h4>
              <p className="text-sm text-muted-foreground">
                Este aplicativo web foi desenvolvido para facilitar a busca por concursos públicos no Brasil, agregando informações por estado a partir do site Concursos no Brasil. O Concursa Aí não tem intenção de prejudicar e difamar a plataforma ou enganar os visitantes do Concursa Aí.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 mt-1 text-primary flex-shrink-0" /> {/* Use primary color for icon */}
            <div>
              <h4 className="font-semibold">Fonte de Dados</h4>
              <p className="text-sm text-muted-foreground">
                Os dados são obtidos através de web scraping do site{' '}
                <a href="https://concursosnobrasil.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline"> {/* Use accent color for link */}
                  concursosnobrasil.com
                </a>.
                A precisão e disponibilidade das informações dependem da fonte original. Não há 100% de garantia de acompanhar os concursos até que plataforma imponha medidas de proteção a ataques cibernéticos. Prejudicando o funcionamento deste projeto.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Palette className="h-5 w-5 mt-1 text-primary flex-shrink-0" /> {/* Use primary color for icon */}
            <div>
              <h4 className="font-semibold">Tecnologias</h4>
              <p className="text-sm text-muted-foreground">
                Desenvolvido com Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI para componentes, Cheerio para scraping e configurado como Progressive Web App (PWA).
              </p>
            </div>
          </div>
           <p className="text-xs text-muted-foreground pt-2">
            Contato: jeiel.lima.miranda@gmail.com (chave pix para quaisquer valor, não sendo orbigatório). SPAM ou Flood serão rejeitados, talvez haja sucesso para você, mas não irá me incomodar com segurança imposta.
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground" // Use primary background for button
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
