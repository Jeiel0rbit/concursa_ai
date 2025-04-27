'use client';

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { scrapeConcursos } from './actions';
import StateSelector from '@/components/StateSelector';
import ConcursoTable from '@/components/ConcursoTable';
import InfoDialog from '@/components/InfoDialog'; // Import the new InfoDialog component
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react'; // Import Info icon
import type { ConcursoData } from '@/types/concursos';

const LOCAL_STORAGE_KEY = 'concursoScraperSelectedState';

const Home: NextPage = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [concursos, setConcursos] = useState<ConcursoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false); // State for InfoDialog

  // Load selected state from localStorage on initial render
  useEffect(() => {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedState) {
      setSelectedState(storedState);
      // Optionally, trigger search automatically if a state was stored
      // handleSearch(storedState);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setConcursos(null); // Reset concursos when state changes
    setError(null);
    // Save selected state to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, state);
  };

  const handleSearch = async (stateToSearch?: string) => {
    const state = stateToSearch || selectedState; // Use provided state or component state
    if (!state) {
      setError('Por favor, selecione um estado.');
      return;
    }
    setLoading(true);
    setError(null);
    setConcursos(null); // Clear previous results before fetching new ones
    try {
      const data = await scrapeConcursos(state);
      setConcursos(data);
      // console.log("Scraped data:", data);
    } catch (err) {
      console.error('Scraping failed:', err);
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Falha ao buscar os dados: ${errorMessage}`);
      setConcursos({ headers: [], openRows: [], predictedRows: [] });
    } finally {
      setLoading(false);
    }
  };

  const hasResults = concursos && (concursos.openRows.length > 0 || concursos.predictedRows.length > 0);
  const showNoResultsMessage = !loading && !error && concursos !== null && !hasResults;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-5xl mb-8 text-center relative">
        <h1 className="text-5xl font-bold text-primary mb-3">ConcursoScraper</h1>
        <p className="text-xl text-muted-foreground">Seu portal de concursos públicos.</p>
         {/* Info Button */}
         <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 mt-2 mr-2 text-accent hover:text-accent-foreground/80" // Use accent color
            onClick={() => setIsInfoDialogOpen(true)}
            aria-label="Informações do Projeto"
          >
            <Info className="h-6 w-6" />
          </Button>
      </header>

      <Card className="w-full max-w-lg shadow-lg bg-card rounded-xl border-border mb-8"> {/* Reduced max-width, use theme border */}
        <CardHeader>
          <CardTitle className="text-2xl text-primary text-center">Selecione o Estado</CardTitle> {/* Centered title */}
          {/* <CardDescription className="text-muted-foreground text-center">Escolha um estado para visualizar os concursos.</CardDescription> */}
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 p-6"> {/* Use flex-col and items-center */}
          <StateSelector selectedState={selectedState} onStateChange={handleStateChange} />
          <Button
            onClick={() => handleSearch()} // Pass explicitly to ensure current state is used
            disabled={loading || !selectedState}
            // Use primary background for button, remove hover scale
            className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow transition duration-300 ease-in-out"
            size="lg"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? 'Buscando...' : 'Buscar Concursos'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mt-8 w-full max-w-5xl shadow-lg bg-destructive text-destructive-foreground rounded-xl">
           <CardHeader>
             <CardTitle>Erro</CardTitle>
           </CardHeader>
           <CardContent>
             <p>{error}</p>
           </CardContent>
        </Card>
      )}

      {loading && (
        <div className="mt-8 w-full max-w-5xl flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" /> {/* Use primary color for loader */}
        </div>
      )}

      {!loading && !error && concursos && (
        <div className="mt-8 w-full max-w-5xl space-y-8">
          <ConcursoTable
            title="Concursos Abertos e em Andamento"
            headers={concursos.headers}
            rows={concursos.openRows}
          />
          <ConcursoTable
            title="Concursos Previstos"
            headers={concursos.headers}
            rows={concursos.predictedRows}
          />
          {showNoResultsMessage && (
             <Card className="shadow-lg bg-card rounded-xl border border-border"> {/* Use theme border */}
                <CardHeader>
                    <CardTitle className="text-primary">Nenhum Concurso Encontrado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Não foram encontrados concursos (abertos, em andamento ou previstos) para o estado selecionado no momento.</p>
                </CardContent>
            </Card>
          )}
        </div>
      )}

       {/* Info Dialog */}
       <InfoDialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen} />


      <footer className="w-full max-w-5xl mt-12 pt-6 border-t border-border text-center text-muted-foreground"> {/* Use theme border */}
        <p>Desenvolvido com Next.js, ShadCN UI e <span className="text-primary font-semibold">Paixão</span>.</p>
      </footer>
    </div>
  );
};

export default Home;
