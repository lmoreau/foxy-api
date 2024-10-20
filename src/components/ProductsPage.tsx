import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Select, Form } from 'antd';
import axios from 'axios';
import { getCategoryLabel } from '../utils/categoryMapper';

const { Option } = Select;

interface Product {
  productid: string;
  name: string;
  foxy_category: number;
  foxy_subcategory: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log('Product added:', values);
      setIsModalVisible(false);
      form.resetFields();
    }).catch(info => {
      console.log('Validation failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'foxy_category',
      key: 'foxy_category',
      render: (value: number) => getCategoryLabel(value),
    },
    {
      title: 'Subcategory',
      dataIndex: 'foxy_subcategory',
      key: 'foxy_subcategory',
      render: (value: number) => getCategoryLabel(value),
    },
  ];

  return (
    <div>
      <h1>Products</h1>
      <Button type="primary" onClick={showModal} style={{ marginBottom: '16px' }}>
        Add Product
      </Button>
      <Table 
        dataSource={products} 
        columns={columns} 
        rowKey="productid" 
        size="small" 
        style={{ marginTop: '1rem' }} 
      />
      <Modal title="Add Product" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical" name="add_product_form">
          <Form.Item name="productName" label="Product Name" rules={[{ required: true, message: 'Please enter the product name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select placeholder="Select a category">
              <Option value={612100000}>Fibre Based</Option>
              <Option value={612100001}>Cable Based</Option>
              <Option value={612100002}>Data Centre</Option>
              <Option value={612100003}>Microsoft 365</Option>
              <Option value={612100004}>Wireless</Option>
              <Option value={612100006}>IoT</Option>
              <Option value={612100007}>Unison</Option>
              <Option value={612100008}>Fixed Wireless</Option>
              <Option value={612100009}>Managed Wifi</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
