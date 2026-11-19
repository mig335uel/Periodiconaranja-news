import { RegionData } from '@/Types/Elecciones';

export type Camara = 'congreso' | 'senado';
export type AmbitoTerritorial = 'comunidades' | 'provincias';

export interface TerritorialEntry {
  key: string;
  codigo: string;
  region: RegionData;
}

export interface ParsedGeneralesDataset {
  espana: RegionData | null;
  comunidades: TerritorialEntry[];
  provincias: TerritorialEntry[];
}

export const EMPTY_DATASET: ParsedGeneralesDataset = {
  espana: null,
  comunidades: [],
  provincias: [],
};
