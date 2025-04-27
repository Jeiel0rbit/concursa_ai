export interface ConcursoCell {
  text: string;
  link: string | null;
}

export interface ConcursoRow {
  cells: ConcursoCell[];
}

export interface ConcursoData {
  headers: string[];
  rows: ConcursoRow[];
}
