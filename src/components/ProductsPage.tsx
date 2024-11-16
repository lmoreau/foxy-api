import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Select, Form, Tabs, message } from 'antd';
import axios from 'axios';
import { getCategoryLabel, getSubcategoryLabel, categoryMap, subcategoryMap } from '../utils/categoryMapper';
import { getDynamicsAccessToken } from '../auth/authService';

const { Option } = Select;
const { TabPane } = Tabs;

interface Product {
  productid: string;
  name: string;
  foxy_category: number;
  foxy_subcategory: number;
  description: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = await getDynamicsAccessToken();
        const response = await axios.get('http://localhost:7071/api/listProductByRow', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProducts(response.data.value || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        message.error('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const showModal = (product: Product | null) => {
    setSelectedProduct(product);
    form.setFieldsValue(product || {});
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log('Product updated:', values);
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
      render: (value: number) => getSubcategoryLabel(value),
    },
  ];

  const wirelessColumns = [
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
  ];

  const wirelineProducts = products.filter(product => getCategoryLabel(product.foxy_category) !== 'Wireless');
  const wirelessProducts = products.filter(product => getCategoryLabel(product.foxy_category) === 'Wireless');

  return (
    <div>
      <h1>Products</h1>
      <div style={{ marginBottom: '16px' }}>
        <Button type="primary" onClick={() => showModal(null)} style={{ marginRight: '8px' }}>
          Add Product
        </Button>
        <Button 
          onClick={() => selectedProduct && showModal(selectedProduct)} 
          disabled={!selectedProduct}
        >
          Edit Product
        </Button>
      </div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Wireline Products" key="1">
          <Table 
            loading={loading}
            dataSource={wirelineProducts} 
            columns={columns} 
            rowKey="productid" 
            size="small" 
            pagination={{ pageSize: 20 }}
            style={{ marginTop: '1rem' }} 
            rowSelection={{
              type: 'radio',
              onChange: (_, [selected]) => setSelectedProduct(selected as Product),
            }}
          />
        </TabPane>
        <TabPane tab="Wireless Products" key="2">
          <Table 
            loading={loading}
            dataSource={wirelessProducts} 
            columns={wirelessColumns} 
            rowKey="productid" 
            size="small" 
            pagination={{ pageSize: 20 }}
            style={{ marginTop: '1rem' }} 
            rowSelection={{
              type: 'radio',
              onChange: (_, [selected]) => setSelectedProduct(selected as Product),
            }}
          />
        </TabPane>
      </Tabs>
      <Modal title={selectedProduct ? "Edit Product" : "Add Product"} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical" name="edit_product_form">
          <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Please enter the product name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="foxy_category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select placeholder="Select a category">
              {(Object.entries(categoryMap) as [string, string][]).map(([value, label]) => (
                <Option key={value} value={parseInt(value)}>{label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="foxy_subcategory" label="Subcategory" rules={[{ required: true, message: 'Please select a subcategory' }]}>
            <Select placeholder="Select a subcategory">
              {(Object.entries(subcategoryMap) as [string, string][]).map(([value, label]) => (
                <Option key={value} value={parseInt(value)}>{label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
