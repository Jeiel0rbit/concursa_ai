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
    } catch (err) {
      console.error('Scraping failed:', err);
      setError('Falha ao buscar os dados. Tente novamente mais tarde.');
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

      <Card className="w-full max-w-4xl shadow-lg">
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
        <div className="mt-8 w-full max-w-4xl text-center text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-8 w-full max-w-4xl flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </div>
      )}

      {concursos && !loading && (
        <div className="mt-8 w-full max-w-4xl">
           <ConcursoTable data={concursos} />
        </div>
      )}

      <footer className="w-full max-w-4xl mt-10 pt-5 border-t text-center text-muted-foreground">
        <p>Desenvolvido com Next.js e ShadCN UI</p>
      </footer>
    </div>
  );
};

export default Home;
