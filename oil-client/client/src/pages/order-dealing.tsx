import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Save, X, CreditCard, Truck, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { paymentService, PaymentRequest } from "@/services/paymentService";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  paymentType: string;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  pickupAddress: string;
  deliveryAddress: string;
  logisticsTrackingNumber: string;
  riskLevel: string;
  buyerIntent: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  description: string;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const OrderDealing = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // New order form state
  const [orderData, setOrderData] = useState({
    customerId: 0,
    paymentType: "COD",
    pickupAddress: "",
    deliveryAddress: "",
    notes: "",
    riskLevel: "LOW",
    buyerIntent: "",
    items: [] as OrderItem[]
  });

  const [currentItem, setCurrentItem] = useState<OrderItem>({
    id: 0,
    productName: "",
    sku: "",
    unitPrice: 0,
    quantity: 1,
    totalPrice: 0,
    description: ""
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, [selectedStatus, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?search=${searchTerm}&status=${selectedStatus}`);
      const data = await response.json();
      setOrders(data.content || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data.content || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handlePayment = async (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentDialog(true);
  };

  const processPayment = async () => {
    if (!selectedOrder) return;

    setProcessingPayment(true);
    try {
      const paymentRequest: PaymentRequest = {
        orderId: selectedOrder.orderNumber,
        orderAmount: selectedOrder.totalAmount,
        customerEmail: selectedOrder.customerEmail,
        customerPhone: selectedOrder.customerPhone,
        customerName: selectedOrder.customerName,
        returnUrl: `${window.location.origin}/payment/success`,
        notifyUrl: `${window.location.origin}/api/payments/webhook`
      };

      if (selectedOrder.paymentType === "CASHFREE") {
        // Create payment link and redirect
        const paymentResponse = await paymentService.createPaymentLink(paymentRequest);
        window.location.href = paymentResponse.paymentLink;
      } else {
        // Handle COD payment
        await updateOrderStatus(selectedOrder.id, "READY_TO_DISPATCH");
        setShowPaymentDialog(false);
        alert("COD order confirmed and ready for dispatch");
        fetchOrders();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status?status=${status}`, {
        method: "PUT"
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const createOrder = async () => {
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
        setShowOrderDialog(false);
        resetOrderForm();
        fetchOrders();
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

  const addItem = () => {
    if (currentItem.productName && currentItem.unitPrice > 0 && currentItem.quantity > 0) {
      const newItem = {
        ...currentItem,
        id: Date.now(),
        totalPrice: currentItem.unitPrice * currentItem.quantity
      };
      setOrderData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      setCurrentItem({
        id: 0,
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

  const calculateTotal = () => {
    return orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const resetOrderForm = () => {
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "DISPATCH": return "bg-blue-100 text-blue-800";
      case "INTRANSIT": return "bg-yellow-100 text-yellow-800";
      case "RTO": return "bg-red-100 text-red-800";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "FAILED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage orders, payments, and logistics</p>
          </div>
          <div className="flex space-x-4">
            <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Order</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Customer Selection */}
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

                  {/* Order Details */}
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

                  {/* Items */}
                  <div>
                    <Label>Order Items</Label>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                          placeholder="Product name"
                          value={currentItem.productName}
                          onChange={(e) => setCurrentItem(prev => ({ ...prev, productName: e.target.value }))}
                        />
                        <Input
                          placeholder="SKU"
                          value={currentItem.sku}
                          onChange={(e) => setCurrentItem(prev => ({ ...prev, sku: e.target.value }))}
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={currentItem.unitPrice}
                          onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                        />
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={currentItem.quantity}
                          onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <Button onClick={addItem} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {orderData.items.length > 0 && (
                      <div className="space-y-2">
                        {orderData.items.map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-gray-500">
                                Qty: {item.quantity} • Price: ₹{item.unitPrice} • Total: ₹{item.totalPrice}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="text-right font-semibold">
                          Total: ₹{calculateTotal()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createOrder} disabled={loading || orderData.items.length === 0}>
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Create Order
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Orders</SelectItem>
                  <SelectItem value="STORE_ORDER">Store Order</SelectItem>
                  <SelectItem value="READY_TO_DISPATCH">Ready to Dispatch</SelectItem>
                  <SelectItem value="DISPATCH">Dispatch</SelectItem>
                  <SelectItem value="INTRANSIT">In Transit</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="RTO">RTO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Order</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Payment</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">₹{order.totalAmount.toLocaleString()}</div>
                          {order.paidAmount > 0 && (
                            <div className="text-sm text-green-600">Paid: ₹{order.paidAmount}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <Badge variant={order.paymentType === "COD" ? "secondary" : "default"}>
                              {order.paymentType}
                            </Badge>
                            <div>
                              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            {order.paymentStatus === "PENDING" && (
                              <Button
                                size="sm"
                                onClick={() => handlePayment(order)}
                                disabled={processingPayment}
                              >
                                {processingPayment ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CreditCard className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {order.status === "READY_TO_DISPATCH" && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, "DISPATCH")}
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status === "DISPATCH" && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, "INTRANSIT")}
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status === "INTRANSIT" && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Order Details</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Order:</strong> {selectedOrder.orderNumber}</div>
                    <div><strong>Customer:</strong> {selectedOrder.customerName}</div>
                    <div><strong>Amount:</strong> ₹{selectedOrder.totalAmount.toLocaleString()}</div>
                    <div><strong>Payment Type:</strong> {selectedOrder.paymentType}</div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={processPayment} disabled={processingPayment}>
                    {processingPayment ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      selectedOrder.paymentType === "CASHFREE" ? (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Online
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm COD
                        </>
                      )
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrderDealing;
