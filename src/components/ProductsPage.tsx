import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import axios from 'axios';

interface Product {
  productid: string;
  name: string;
  foxy_category: string;
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
