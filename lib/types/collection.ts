export interface Collection {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  products: string[] | any[];
  isActive: boolean;
  position: number;
}