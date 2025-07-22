import productsData from './products.json';
import { Product } from '../types';

export const products: Product[] = productsData.map(product => ({
  ...product,
  price: parseFloat(product.price.replace(/\./g, ''))
}));
