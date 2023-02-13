export interface Article {
  articleNumber: number;
  articleName: string;
  articlePrice: number;
  articleType: number;
}

export interface SelectableOption {
  label: string;
  value: number;
}

export enum ArticleCategory {
  POWER = 0,
  COLOR = 1,
  WHEELS = 2,
  MISC = 3,
}
