import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import axios from 'axios';
import { getCategoryLabel, getSubcategoryLabel } from '../utils/categoryMapper';

interface Product {
  productid: string;
  name: string;
  foxy_category: number;
  foxy_subcategory: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:7071/api/listProductByRow');
        setProducts(response.data.value || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Foxy Category',
      dataIndex: 'foxy_category',
      key: 'foxy_category',
      render: (value: number) => getCategoryLabel(value),
    },
    {
      title: 'Foxy Subcategory',
      dataIndex: 'foxy_subcategory',
      key: 'foxy_subcategory',
      render: (value: number) => getSubcategoryLabel(value),
    },
  ];

  return (
    <div>
      <h1>Products</h1>
      <Table dataSource={products} columns={columns} rowKey="productid" />
    </div>
  );
};

export default ProductsPage;
