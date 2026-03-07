import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, X } from "lucide-react";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface OrderItem {
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  description: string;
}

interface CreateOrderData {
  customerId: number;
  paymentType: string;
  pickupAddress: string;
  deliveryAddress: string;
  notes: string;
  riskLevel: string;
  buyerIntent: string;
  items: OrderItem[];
}

const CreateOrder = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<CreateOrderData>({
    customerId: 0,
    paymentType: "COD",
    pickupAddress: "",
    deliveryAddress: "",
    notes: "",
    riskLevel: "LOW",
    buyerIntent: "",
    items: []
  });
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    productName: "",
    sku: "",
    unitPrice: 0,
    quantity: 1,
    totalPrice: 0,
    description: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data.content || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const calculateTotal = () => {
    return orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const addItem = () => {
    if (currentItem.productName && currentItem.unitPrice > 0 && currentItem.quantity > 0) {
      const newItem = {
        ...currentItem,
        totalPrice: currentItem.unitPrice * currentItem.quantity
      };
      setOrderData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      setCurrentItem({
        productName: "",
        sku: "",
        unitPrice: 0,
        quantity: 1,
        totalPrice: 0,
        description: ""
      });
    }
  };

  const removeItem = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderData.customerId || orderData.items.length === 0) {
      alert("Please select a customer and add at least one item");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...orderData,
        totalAmount: calculateTotal(),
        status: "STORE_ORDER",
        paymentStatus: "PENDING"
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Order created successfully!");
        // Reset form
        setOrderData({
          customerId: 0,
          paymentType: "COD",
          pickupAddress: "",
          deliveryAddress: "",
          notes: "",
          riskLevel: "LOW",
          buyerIntent: "",
          items: []
        });
      } else {
        alert("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === orderData.customerId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="mt-2 text-gray-600">Fill in the details below to create a new order</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Select Customer</Label>
                <Select 
                  value={orderData.customerId.toString()} 
                  onValueChange={(value) => setOrderData(prev => ({ ...prev, customerId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.firstName} {customer.lastName} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                    <div><strong>Email:</strong> {selectedCustomer.email}</div>
                    <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
                    <div><strong>Address:</strong> {selectedCustomer.address}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select 
                    value={orderData.paymentType} 
                    onValueChange={(value) => setOrderData(prev => ({ ...prev, paymentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                      <SelectItem value="CASHFREE">Cashfree Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="riskLevel">Risk Level</Label>
                  <Select 
                    value={orderData.riskLevel} 
                    onValueChange={(value) => setOrderData(prev => ({ ...prev, riskLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="buyerIntent">Buyer Intent</Label>
                <Input
                  id="buyerIntent"
                  value={orderData.buyerIntent}
                  onChange={(e) => setOrderData(prev => ({ ...prev, buyerIntent: e.target.value }))}
                  placeholder="e.g., Regular customer, First time buyer, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <Textarea
                    id="pickupAddress"
                    value={orderData.pickupAddress}
                    onChange={(e) => setOrderData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                    placeholder="Enter pickup address"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={orderData.deliveryAddress}
                    onChange={(e) => setOrderData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    placeholder="Enter delivery address"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={orderData.notes}
                  onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for this order"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Item Form */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-4">Add New Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={currentItem.productName}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={currentItem.sku}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="SKU"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                  />
                </div>
                <Button type="button" onClick={addItem} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Items List */}
              {orderData.items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-4">Order Items ({orderData.items.length})</h4>
                  <div className="space-y-2">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">
                            {item.sku && `SKU: ${item.sku} • `}
                            Qty: {item.quantity} • 
                            Price: ₹{item.unitPrice} • 
                            Total: ₹{item.totalPrice}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              {orderData.items.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Order Total</h4>
                      <p className="text-sm text-gray-500">{orderData.items.length} items</p>
                    </div>
                    <div className="text-2xl font-bold">
                      ₹{calculateTotal().toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading || orderData.items.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
