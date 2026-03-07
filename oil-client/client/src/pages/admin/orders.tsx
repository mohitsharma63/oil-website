import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/hooks/use-orders";

const orderStatuses = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          // Parse the data if it's a string
          const parsedOrders = typeof data === 'string' ? JSON.parse(data) : data;
          setOrders(parsedOrders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => {
        const orderStatus = order.status || "Pending";
        return orderStatus.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Apply search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id?.toString().toLowerCase().includes(query) ||
          order.data?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "createdAt":
          aValue = a.createdAt || 0;
          bValue = b.createdAt || 0;
          break;
        case "id":
          aValue = a.id || 0;
          bValue = b.id || 0;
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        default:
          aValue = a.createdAt || 0;
          bValue = b.createdAt || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [orders, debouncedSearch, statusFilter, sortBy, sortOrder]);

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "processing":
        return "secondary";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      case "confirmed":
        return "default";
      default:
        return "outline";
    }
  };

  const extractCustomerInfo = (orderData: string) => {
    try {
      const parsed = JSON.parse(orderData);
      return {
        email: parsed.customerInfo?.email || "N/A",
        name: `${parsed.customerInfo?.firstName || ""} ${parsed.customerInfo?.lastName || ""}`.trim() || "N/A",
        total: parsed.total || 0,
        shipping: parsed.shipping || 0,
        subtotal: parsed.subtotal || 0,
      };
    } catch {
      return {
        email: "N/A",
        name: "N/A",
        total: 0,
        shipping: 0,
        subtotal: 0,
      };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">Manage your orders here.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search by order ID, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="total">Total Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="id">Order ID</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortOrder}
              onValueChange={(value) => {
                setSortOrder(value as "asc" | "desc");
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredAndSortedOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedOrders.map((order) => {
                    const customerInfo = extractCustomerInfo(order.data || "{}");
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{customerInfo.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {customerInfo.email}
                        </TableCell>
                        <TableCell>₹{customerInfo.subtotal.toLocaleString()}</TableCell>
                        <TableCell>₹{customerInfo.shipping.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{customerInfo.total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status || "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
