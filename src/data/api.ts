import axios from 'axios';
import { Product } from '../types';

// Nota: Por ahora se usan las credenciales directamente. Más adelante pásalas a variables de entorno (.env).
const API_URL = 'https://api.jsonbin.io/v3/b/67aa7453acd3cb34a8dd211e'; // Reemplaza con tu URL de JSONBin
const API_KEY = '$2a$10$NX0Yf/TcCBMfxZyucoKoB.2IKTOWiCwjk.c0NL/o/nf78rg/UQ.ny'; // Solo si es privado

// ----------------------------
// Helper: Convertir File a Base64
// ----------------------------
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// ----------------------------
// Funciones de Productos
// ----------------------------

export const fetchProducts = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });

    // Determina la fuente correcta de datos
    const productsData =
      response.data.record?.record || response.data.record || response.data || [];

    // Asegura que productsData sea un array
    const productsList = Array.isArray(productsData) ? productsData : [productsData];

    // Transforma los datos para que coincidan con el tipo Product
    const transformedProducts = productsList.map((product: any) => ({
      ...product,
      id: product.id?.toString() || crypto.randomUUID(),
      price:
        typeof product.price === 'string'
          ? parseFloat(product.price.replace(/\./g, ''))
          : product.price,
      active: product.active ?? true,
      offer: product.offer ?? false,
    }));

    return transformedProducts;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return [];
  }
};

export const updateProductPrice = async (productId: string, newPrice: number) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });
    const productsData =
      response.data.record?.record || response.data.record || response.data || [];
    const productsList = Array.isArray(productsData) ? productsData : [productsData];

    const updatedProducts = productsList.map((product: Product) =>
      product.id === productId ? { ...product, price: newPrice } : product
    );

    await axios.put(API_URL, { record: updatedProducts }, {
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return updatedProducts;
  } catch (error) {
    console.error('Error updating product price:', error);
    throw error;
  }
};

export const toggleProductStatus = async (productId: string) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });
    const productsData =
      response.data.record?.record || response.data.record || response.data || [];
    const productsList = Array.isArray(productsData) ? productsData : [productsData];

    const updatedProducts = productsList.map((product: Product) =>
      product.id === productId ? { ...product, active: !product.active } : product
    );

    await axios.put(API_URL, { record: updatedProducts }, {
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return updatedProducts;
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
};

export const toggleProductOffer = async (productId: string) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });
    const productsData =
      response.data.record?.record || response.data.record || response.data || [];
    const currentProducts = Array.isArray(productsData) ? productsData : [productsData];

    const updatedProducts = currentProducts.map((product: Product) => {
      if (product.id === productId) {
        const currentOfferStatus = product.offer ?? false;
        return { ...product, offer: !currentOfferStatus };
      }
      return product;
    });

    await axios.put(API_URL, { record: updatedProducts }, {
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return updatedProducts;
  } catch (error) {
    console.error('Error toggling product offer status:', error);
    throw error;
  }
};

export const updateProductName = async (productId: string, newName: string) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });
    const productsData =
      response.data.record?.record || response.data.record || response.data || [];
    const productsList = Array.isArray(productsData) ? productsData : [productsData];

    const updatedProducts = productsList.map((product: Product) =>
      product.id === productId ? { ...product, name: newName } : product
    );

    await axios.put(API_URL, { record: updatedProducts }, {
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return updatedProducts;
  } catch (error) {
    console.error('Error updating product name:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });

    const currentProducts = 
      response.data.record?.record || 
      response.data.record || 
      response.data || 
      [];

    const updatedProducts = currentProducts.map(product => 
      product.id === productId ? { ...product, ...updates } : product
    );

    await axios.put(API_URL, { record: updatedProducts }, {
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return updatedProducts;
  } catch (error) {
    console.error('Error updating product:', error);
    return [];
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    // Fetch current products
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });

    // Determine the current products
    const currentProducts = response.data.record?.record || response.data.record || response.data || [];

    // Remove the product with the specified ID
    const updatedProducts = currentProducts.filter((product: Product) => product.id !== productId);

    // Update the entire product list
    const updateResponse = await axios.put(API_URL, { record: updatedProducts }, {
      headers: { 
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json'
      },
    });

    return updatedProducts;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// ----------------------------
// Función para subir imagenes a ImgBB
// ----------------------------
export const uploadImageToImageKit = async (file: File): Promise<string> => {
  try {
    // Convertir el archivo a cadena base64
    const base64Image = await convertFileToBase64(file);
    // Remover el prefijo "data:image/*;base64," si existe
    const base64Data = base64Image.split(',')[1];
    const formData = new FormData();
    formData.append("image", base64Data);
    formData.append("key", "9a2d7bbb99f1b945a192fcbbcf11c4af");

    const response = await axios.post("https://api.imgbb.com/1/upload", formData);
    return response.data.data.url || '';
  } catch (error) {
    console.error('Error uploading image to ImgBB:', JSON.stringify(error, null, 2));
    return '';
  }
};

export const addNewProduct = async (
  product: Omit<Product, 'id' | 'active' | 'offer'> & { image: File }
): Promise<Product | null> => {
  try {
    // Primero, sube la imagen a ImgBB (usando la función actualizada)
    const imageUrl = await uploadImageToImageKit(product.image);
    
    // Prepara los datos del producto
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: product.name,
      price: typeof product.price === 'string'
        ? parseFloat(product.price.replace(/\./g, ''))
        : product.price,
      category: product.category,
      image: imageUrl,
      active: true,
      offer: product.offer ?? false,  // Use the passed offer status or default to false
    };

    // Obtén los productos actuales
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });
    const currentProducts = response.data.record?.record || response.data.record || response.data || [];
    
    // Agrega el nuevo producto a la lista existente
    const updatedProducts = [...currentProducts, newProduct];

    // Actualiza la lista completa de productos usando la estructura correcta para JSONBin
    await axios.put(API_URL, { record: updatedProducts }, {
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return newProduct;
  } catch (error) {
    console.error('Error adding new product:', error);
    return null;
  }
};

export const updateProductImage = async (productId: string, newImageFile: File): Promise<Product[]> => {
  try {
    // First, upload the new image to ImageKit
    const newImageUrl = await uploadImageToImageKit(newImageFile);

    // Fetch current products
    const response = await axios.get(API_URL, {
      headers: { 'X-Master-Key': API_KEY },
    });

    const currentProducts = 
      response.data.record?.record || 
      response.data.record || 
      response.data || 
      [];

    // Update the product with the new image URL
    const updatedProducts = currentProducts.map(product => 
      product.id === productId ? { ...product, image: newImageUrl } : product
    );

    // Update the entire products list
    await axios.put(API_URL, { record: updatedProducts }, {
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return updatedProducts;
  } catch (error) {
    console.error('Error updating product image:', error);
    return [];
  }
};

export default fetchProducts;