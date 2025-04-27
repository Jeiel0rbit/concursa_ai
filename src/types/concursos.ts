export interface ConcursoCell {
  text: string;
  link: string | null;
}

export interface ConcursoRow {
  cells: ConcursoCell[];
}

// Updated structure to hold separate arrays for open and predicted contests
export interface ConcursoData {
  headers: string[];
  openRows: ConcursoRow[];
  predictedRows: ConcursoRow[];
}