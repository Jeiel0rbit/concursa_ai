'use client';

import type { NextPage } from 'next';
import { useState } from 'react';
import { scrapeConcursos } from './actions';
import StateSelector from '@/components/StateSelector';
import ConcursoTable from '@/components/ConcursoTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { ConcursoData } from '@/types/concursos'; // Ensure this path is correct

const Home: NextPage = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [concursos, setConcursos] = useState<ConcursoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setConcursos(null); // Reset concursos when state changes
    setError(null);
  };

  const handleSearch = async () => {
    if (!selectedState) {
      setError('Por favor, selecione um estado.');
      return;
    }
    setLoading(true);
    setError(null);
    setConcursos(null);
    try {
      const data = await scrapeConcursos(selectedState);
      setConcursos(data);
      if (!data.predicted && data.rows.length === 0) {
        console.log("No regular or predicted contests found.");
        // Optionally set a specific message if needed, though the table component handles empty rows.
      }
    } catch (err) {
      console.error('Scraping failed:', err);
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Falha ao buscar os dados: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">ConcursoScraper</h1>
        <p className="text-lg text-muted-foreground">Encontre concursos públicos por estado.</p>
      </header>

      <Card className="w-full max-w-4xl shadow-lg bg-card">
        <CardHeader>
          <CardTitle>Selecione o Estado</CardTitle>
          <CardDescription>Escolha um estado para buscar os concursos disponíveis.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <StateSelector selectedState={selectedState} onStateChange={handleStateChange} />
          <Button onClick={handleSearch} disabled={loading || !selectedState} className="w-full sm:w-auto">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Buscando...' : 'Buscar Concursos'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mt-8 w-full max-w-4xl shadow-lg bg-destructive text-destructive-foreground">
           <CardHeader>
             <CardTitle>Erro</CardTitle>
           </CardHeader>
           <CardContent>
             <p>{error}</p>
           </CardContent>
        </Card>
      )}

      {loading && (
        <div className="mt-8 w-full max-w-4xl flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </div>
      )}

      {/* Display Regular Concursos Table */}
      {concursos && !loading && (
        <div className="mt-8 w-full max-w-4xl">
           <ConcursoTable data={concursos} />
        </div>
      )}

      {/* Display Predicted Concursos if available */}
      {concursos?.predicted && !loading && (
        <Card className="mt-8 w-full max-w-4xl shadow-lg bg-card">
          <CardHeader>
            <CardTitle>Concursos Previstos</CardTitle>
            <CardDescription>Informações sobre concursos previstos para este estado.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Render the scraped HTML content using dangerouslySetInnerHTML.
                Be cautious with this if the source website is not trusted.
                For concursosnobrasil, it should be relatively safe as it renders the contest details. */}
            <div dangerouslySetInnerHTML={{ __html: concursos.predicted }} />
          </CardContent>
        </Card>
      )}


      <footer className="w-full max-w-4xl mt-10 pt-5 border-t text-center text-muted-foreground">
        <p>Desenvolvido com Next.js e ShadCN UI</p>
      </footer>
    </div>
  );
};

export default Home;
