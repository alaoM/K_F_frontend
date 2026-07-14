'use client';

import AddProduct from '@/app/components/AdminComponents/AddProduct';
import ProductList from '@/app/components/AdminComponents/ProductsList';
import React, { useState } from 'react';

const Page = () => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  return (
    <>
      {isAddingProduct ? (
        <AddProduct
          onBack={() => {
            setIsAddingProduct(false);
            setEditingProduct(null);
          }}
          initialData={editingProduct}   // ✅ PASS DATA HERE
        />
      ) : (
        <ProductList
          onAddProduct={() => {
            setEditingProduct(null);
            setIsAddingProduct(true);
          }}
          onEditProduct={(product) => {   // ✅ RECEIVE FROM LIST
            setEditingProduct(product);
            setIsAddingProduct(true);
          }}
        />
      )}
    </>
  );
};

export default Page;