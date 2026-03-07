import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/bestsellers", async (req, res) => {
    try {
      const products = await storage.getBestsellerProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bestseller products" });
    }
  });

  app.get("/api/products/new-launches", async (req, res) => {
    try {
      const products = await storage.getNewLaunchProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch new launch products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/filters", async (req, res) => {
    try {
      // Proxy to Spring Boot backend
      const backendUrl = process.env.OLI_API_BASE_URL || "http://localhost:8085 ";
      const response = await fetch(`${backendUrl}/api/products/filters`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch filter options" });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching filters:", error);
      res.status(500).json({ error: "Failed to fetch filter options" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Shipping API - Proxy to Java backend
  app.get("/api/shipping/ithink/serviceability", async (req, res) => {
    try {
      const { deliveryPincode, weight, cod, productMrp } = req.query;
      const backendUrl = `http://localhost:8080/api/shipping/ithink/serviceability?deliveryPincode=${deliveryPincode}&weight=${weight}&cod=${cod}&productMrp=${productMrp}`;
      
      const response = await fetch(backendUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Serviceability check failed" });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error checking serviceability:", error);
      res.status(500).json({ error: "Failed to check serviceability" });
    }
  });

  app.post("/api/shipping/validate-pincode", async (req, res) => {
    try {
      const backendUrl = "http://localhost:8080/api/shipping/validate-pincode";
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Pincode validation failed" });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error validating pincode:", error);
      res.status(500).json({ error: "Failed to validate pincode" });
    }
  });

  // Order endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const backendUrl = "http://localhost:8080/api/orders";

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Order creation failed" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const backendUrl = "http://localhost:8080/api/orders";

      const response = await fetch(backendUrl);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch orders" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders/payment", async (req, res) => {
    try {
      const backendUrl = "http://localhost:8080/api/orders/payment";

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Payment processing failed" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
