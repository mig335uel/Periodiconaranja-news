export interface AemetObservation {
  idema: string;
  ubi: string;
  fint: string;     // Fecha hora
  ta: number;       // Temp actual
  tamax: number;
  tamin: number;
  prec: number;     // Lluvia
  hr: number;       // Humedad
  vv: number;       // Viento
  icon?: string;    // Este lo calcularemos nosotros
}