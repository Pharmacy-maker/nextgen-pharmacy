import { apiFetch, mockDelay } from "../client";
import { supabase } from "../../supabase";
import { ENDPOINTS, USE_MOCK_API } from "../config";
import { mockOrders } from "../mock/db";
import { products } from "../../products";
import type { CreateOrderInput, ID, Order, OrderStatus } from "../../../types/models";

let orders: Order[] = [...mockOrders];

export const orderService = {
  async list(params: { status?: OrderStatus } = {}): Promise<Order[]> {
    console.log("ORDER LIST CALLED");
  console.log("USE_MOCK_API", USE_MOCK_API);

  if (!USE_MOCK_API) {
    let query = supabase
      .from("orders")
      .select("*")
      .order("placed_at", { ascending: false });

    if (params.status) {
      query = query.eq("status", params.status);
    }
    console.log("QUERY STATUS FILTER", params.status);
    const { data, error } = await query;
    console.log("SUPABASE ORDERS RAW", data);
    console.log("SUPABASE ORDERS ERROR", error); 
    if (error) {
      throw new Error(error.message);
    }

    return await Promise.all(
  (data ?? []).map(async (row) => {
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", row.id);

    if (itemsError) {
      console.error("ORDER ITEMS FETCH ERROR:", itemsError);
    }

    return {
      id: row.id,
      reference: row.reference,
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      subtotal: Number(row.subtotal ?? 0),
      discount: Number(row.discount ?? 0),
      deliveryFee: Number(row.delivery_fee ?? 0),
      total: Number(row.total ?? 0),
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      shippingAddress: row.shipping_address,
      placedAt: row.placed_at,
      deliveredAt: row.delivered_at,

      items: (orderItems ?? []).map((item) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unit_price ?? 0),
        total: Number(item.total ?? 0),
      })),
    };
  })
);
  }

  return mockDelay(
    params.status
      ? orders.filter((o) => o.status === params.status)
      : orders
  );
},
  async listMine(userId: ID): Promise<Order[]> {
    console.log("LIST MINE CALLED", userId);
    console.log("LIST MINE USER", userId);
    console.log("MATCHING ORDERS", orders.filter((o) => o.userId === userId));
  if (!USE_MOCK_API) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("placed_at", { ascending: false });
      console.log("SUPABASE ORDERS", data);

    if (error) {
      throw new Error(error.message);
    }
    

   return await Promise.all(
  (data ?? []).map(async (row) => {
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", row.id);

    if (itemsError) {
      console.error("MY ORDER ITEMS FETCH ERROR:", itemsError);
    }

    return {
      id: row.id,
      reference: row.reference,
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      subtotal: Number(row.subtotal ?? 0),
      discount: Number(row.discount ?? 0),
      deliveryFee: Number(row.delivery_fee ?? 0),
      total: Number(row.total ?? 0),
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      shippingAddress: row.shipping_address,
      placedAt: row.placed_at,
      deliveredAt: row.delivered_at,

      items: (orderItems ?? []).map((item) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unit_price ?? 0),
        total: Number(item.total ?? 0),
      })),
    };
  })
);
  }

  return mockDelay(orders.filter((o) => o.userId === userId));
},

  async get(id: ID): Promise<Order | null> {
  if (USE_MOCK_API) {
    return mockDelay(
      orders.find((o) => o.id === id) ?? null
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    reference: data.reference,
    userId: data.user_id,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    subtotal: Number(data.subtotal ?? 0),
    discount: Number(data.discount ?? 0),
    deliveryFee: Number(data.delivery_fee ?? 0),
    total: Number(data.total ?? 0),
    status: data.status,
    paymentStatus: data.payment_status,
    paymentMethod: data.payment_method,
    shippingAddress: data.shipping_address,
    placedAt: data.placed_at,
    deliveredAt: data.delivered_at,
    items: [],
  };
},

  async create(input: CreateOrderInput): Promise<Order> {
  if (!USE_MOCK_API) {
    const productIds = input.items.map((it) => it.productId);

const { data: dbProducts, error: productsError } = await supabase
  .from("products")
  .select("id, name, price, discount, stock")
  .in("id", productIds);
  if (productsError) {
  throw new Error(productsError.message);
}
console.log("STOCK CHECK STARTED");
console.log("ORDER ITEMS:", input.items);
console.log("DB PRODUCTS:", dbProducts);
for (const item of input.items) {
  const product = dbProducts?.find(
    (p) => p.id === item.productId
  );

  console.log("CHECKING:", {
    requested: item.quantity,
    stock: product?.stock,
  });

  if (!product) {
    throw new Error(`Product not found: ${item.productId}`);
  }

  if ((product.stock ?? 0) < item.quantity) {
  console.error(
    "INSUFFICIENT STOCK",
    product.stock,
    item.quantity
  );

  throw new Error(
    `${product.name} has only ${product.stock} units available`
  );
}
}
for (const item of input.items) {
  const product = dbProducts?.find(
    p => p.id === item.productId
  );

  if (!product) {
    throw new Error(`Product not found: ${item.productId}`);
  }

  if ((product.stock ?? 0) < item.quantity) {
    throw new Error(
      `${product.name} has only ${product.stock} units available`
    );
  }
}



const subtotal = input.items.reduce((sum, item) => {
  const product = dbProducts?.find(
    (p) => p.id === item.productId
  );

  if (!product) {
    throw new Error(`Product not found: ${item.productId}`);
  }

  const unitPrice =
    Number(product.price ?? 0) *
    (1 - Number(product.discount ?? 0) / 100);

  return sum + unitPrice * item.quantity;
}, 0);

const deliveryFee = subtotal > 499 ? 0 : 40;
    const { data, error } = await supabase
      .from("orders")
      .insert({
        reference: `RP-${Math.floor(10000 + Math.random() * 89999)}`,
        user_id: input.userId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        subtotal,
        discount: 0,
        delivery_fee: deliveryFee,
        total: subtotal + deliveryFee,
        status: "pending",
        payment_status:
          input.paymentMethod === "cod" ? "unpaid" : "paid",
        payment_method: input.paymentMethod,
        shipping_address: input.shippingAddress,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    console.log("SUPABASE ORDER CREATED", data);
    const orderItems = input.items.map((it) => {
  const p = products.find((x) => x.id === it.productId);
  const unitPrice = p
    ? Math.round(p.price * (1 - p.discount / 100))
    : 0;

  return {
    order_id: data.id,
    product_id: it.productId,
    product_name: p?.name ?? it.productId,
    quantity: it.quantity,
    unit_price: unitPrice,
    total: unitPrice * it.quantity,
  };
});

const { error: itemsError } = await supabase
  .from("order_items")
  .insert(orderItems);

if (itemsError) {
  console.error("ORDER ITEMS INSERT ERROR", itemsError);
  throw itemsError;
}

for (const item of input.items) {
  const product = dbProducts?.find(
    p => p.id === item.productId
  );

  if (!product) continue;

  const newStock = Math.max(
    0,
    (product.stock ?? 0) - item.quantity
  );

  const { error: stockError } = await supabase
    .from("products")
    .update({
      stock: newStock
    })
    .eq("id", item.productId);

  if (stockError) {
    console.error("STOCK UPDATE ERROR", stockError);
    throw stockError;
  }
}

    return data as Order;
  }

  const id = `o-${Date.now()}`;
    const items = input.items.map((it, i) => {
      const p = products.find((x) => x.id === it.productId);
      const unitPrice = p ? Math.round(p.price * (1 - p.discount / 100)) : 0;
      return {
        id: `oi-${id}-${i}`,
        orderId: id,
        productId: it.productId,
        productName: p?.name ?? it.productId,
        quantity: it.quantity,
        unitPrice,
        total: unitPrice * it.quantity,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const deliveryFee = subtotal > 499 ? 0 : 40;
    const order: Order = {
      id,
      reference: `RP-${Math.floor(10000 + Math.random() * 89999)}`,
      userId: input.userId,
      customerName: "You",
      customerEmail: "",
      items,
      subtotal,
      discount: 0,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: "pending",
      paymentStatus: input.paymentMethod === "cod" ? "unpaid" : "paid",
      paymentMethod: input.paymentMethod,
      shippingAddress: input.shippingAddress,
      placedAt: new Date().toISOString().slice(0, 10),
    };
    orders = [order, ...orders];
    console.log("ORDER CREATED", order);
console.log("ALL ORDERS", orders);
    return mockDelay(order, 500);
  },

  async updateStatus(id: ID, status: OrderStatus): Promise<Order> {
  if (!USE_MOCK_API) {
    const { data, error } = await supabase
  .from("orders")
  .update({ status })
  .eq("id", id)
  .select()
  .maybeSingle();

    if (error) {
  console.error("ORDER STATUS UPDATE ERROR", error);
  throw new Error(error.message);
}

if (!data) {
  throw new Error("Order was not found or could not be updated.");
}

return {
  id: data.id,
      reference: data.reference,
      userId: data.user_id,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      subtotal: Number(data.subtotal ?? 0),
      discount: Number(data.discount ?? 0),
      deliveryFee: Number(data.delivery_fee ?? 0),
      total: Number(data.total ?? 0),
      status: data.status,
      paymentStatus: data.payment_status,
      paymentMethod: data.payment_method,
      shippingAddress: data.shipping_address,
      placedAt: data.placed_at,
      deliveredAt: data.delivered_at,
      items: [],
    };
  }

  orders = orders.map((o) =>
    o.id === id ? { ...o, status } : o
  );

  return mockDelay(
    orders.find((o) => o.id === id)!,
    300
  );
},

  async recent(limit = 10) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data ?? [];
},
};
