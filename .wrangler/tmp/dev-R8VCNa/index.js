var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-qyRyQL/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/api/test.js
async function handleTest(request, env) {
  try {
    const result = await env.DB.prepare("SELECT 1 as test").first();
    return new Response(JSON.stringify({
      success: true,
      message: "ZVAKHO Rebuild API is working!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "2.0.0-dev",
      dbConnected: !!result,
      dbTest: result
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: "Database connection failed"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(handleTest, "handleTest");

// src/lib/validators.js
function validateBrandName(name) {
  if (!name || name.length < 2) {
    return { valid: false, error: "Brand name must be at least 2 characters" };
  }
  if (name.length > 100) {
    return { valid: false, error: "Brand name must be less than 100 characters" };
  }
  return { valid: true };
}
__name(validateBrandName, "validateBrandName");
function validateEmail(email) {
  if (!email) return { valid: true };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
}
__name(validateEmail, "validateEmail");
function validatePhone(phone) {
  if (!phone) return { valid: true };
  const phoneRegex = /^\+?[\d\s-]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: "Invalid phone number" };
  }
  return { valid: true };
}
__name(validatePhone, "validatePhone");
function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}
__name(slugify, "slugify");

// src/lib/db.js
async function query(env, sql, params = []) {
  try {
    const result = await env.DB.prepare(sql).bind(...params).all();
    return result.results || [];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
__name(query, "query");
async function queryOne(env, sql, params = []) {
  try {
    const result = await env.DB.prepare(sql).bind(...params).first();
    return result || null;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
__name(queryOne, "queryOne");
async function execute(env, sql, params = []) {
  try {
    const result = await env.DB.prepare(sql).bind(...params).run();
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
__name(execute, "execute");

// src/api/brands/get.js
async function getBrand(request, env, user, brandId) {
  try {
    if (user.brand_id !== brandId && user.role !== "admin") {
      return new Response(JSON.stringify({
        error: "Unauthorized"
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const brand = await queryOne(env, `
            SELECT * FROM brands 
            WHERE brand_id = ? AND deleted_at IS NULL
        `, [brandId]);
    if (!brand) {
      return new Response(JSON.stringify({
        error: "Brand not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      brand
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get brand error:", error);
    return new Response(JSON.stringify({
      error: "Failed to get brand"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(getBrand, "getBrand");

// src/api/brands/list.js
async function listBrands(request, env, user) {
  try {
    if (user.role !== "admin") {
      if (user.brand_id) {
        const brand = await query(env, `
                    SELECT * FROM brands 
                    WHERE brand_id = ? AND deleted_at IS NULL
                `, [user.brand_id]);
        return new Response(JSON.stringify({
          success: true,
          brands: brand
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        brands: []
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const brands = await query(env, `
            SELECT * FROM brands 
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
        `);
    return new Response(JSON.stringify({
      success: true,
      brands
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("List brands error:", error);
    return new Response(JSON.stringify({
      error: "Failed to list brands"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(listBrands, "listBrands");

// src/api/brands/update.js
async function updateBrand(request, env, user, brandId) {
  try {
    if (user.brand_id !== brandId) {
      return new Response(JSON.stringify({
        error: "Unauthorized"
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const updates = [];
    const values = [];
    const allowedFields = {
      "brand_name": validateBrandName,
      "brand_email": validateEmail,
      "brand_phone": validatePhone,
      "brand_feeling": /* @__PURE__ */ __name((val) => {
        const valid = ["premium", "modern", "streetwear", "minimal", "vintage"];
        return valid.includes(val) ? { valid: true } : { valid: false, error: "Invalid brand feeling" };
      }, "brand_feeling"),
      "primary_color": /* @__PURE__ */ __name((val) => {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        return hexRegex.test(val) ? { valid: true } : { valid: false, error: "Invalid hex color" };
      }, "primary_color"),
      "secondary_color": /* @__PURE__ */ __name((val) => {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        return hexRegex.test(val) ? { valid: true } : { valid: false, error: "Invalid hex color" };
      }, "secondary_color"),
      "accent_color": /* @__PURE__ */ __name((val) => {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        return hexRegex.test(val) ? { valid: true } : { valid: false, error: "Invalid hex color" };
      }, "accent_color"),
      "font_primary": /* @__PURE__ */ __name((val) => {
        const fonts = [
          "Inter",
          "Roboto",
          "Open Sans",
          "Lato",
          "Montserrat",
          "Playfair Display",
          "Bebas Neue",
          "Cormorant Garamond",
          "Raleway"
        ];
        return fonts.includes(val) ? { valid: true } : { valid: false, error: "Invalid font" };
      }, "font_primary"),
      "font_secondary": /* @__PURE__ */ __name((val) => {
        const fonts = [
          "Inter",
          "Roboto",
          "Open Sans",
          "Lato",
          "Montserrat",
          "Playfair Display",
          "Bebas Neue",
          "Cormorant Garamond",
          "Raleway"
        ];
        return fonts.includes(val) ? { valid: true } : { valid: false, error: "Invalid font" };
      }, "font_secondary"),
      "store_status": /* @__PURE__ */ __name((val) => {
        const valid = ["draft", "active", "paused", "closed"];
        return valid.includes(val) ? { valid: true } : { valid: false, error: "Invalid store status" };
      }, "store_status"),
      "store_hours": /* @__PURE__ */ __name((val) => ({ valid: true }), "store_hours"),
      "whatsapp_number": validatePhone,
      "logo_url": /* @__PURE__ */ __name((val) => ({ valid: true }), "logo_url"),
      "custom_domain": /* @__PURE__ */ __name((val) => ({ valid: true }), "custom_domain")
    };
    for (const [field, validator] of Object.entries(allowedFields)) {
      if (body[field] !== void 0) {
        const validation = validator(body[field]);
        if (!validation.valid) {
          return new Response(JSON.stringify({
            error: validation.error
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({
        error: "No fields to update"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (body.brand_name) {
      const newSlug = slugify(body.brand_name);
      const existing = await queryOne(env, `
                SELECT brand_id FROM brands 
                WHERE brand_slug = ? AND brand_id != ? AND deleted_at IS NULL
            `, [newSlug, brandId]);
      if (existing) {
        return new Response(JSON.stringify({
          error: "Brand name already taken"
        }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
      updates.push("brand_slug = ?");
      values.push(newSlug);
    }
    values.push((/* @__PURE__ */ new Date()).toISOString(), brandId);
    await execute(env, `
            UPDATE brands 
            SET ${updates.join(", ")}, updated_at = ?
            WHERE brand_id = ?
        `, values);
    const brand = await queryOne(env, `
            SELECT * FROM brands WHERE brand_id = ?
        `, [brandId]);
    return new Response(JSON.stringify({
      success: true,
      brand,
      message: "Brand updated successfully!"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Update brand error:", error);
    return new Response(JSON.stringify({
      error: "Failed to update brand"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(updateBrand, "updateBrand");

// src/api/brands/simple.js
async function simpleCreateBrand(request, env, user) {
  console.log("\u{1F680} SIMPLE VERSION STARTED");
  console.log("\u{1F464} User:", user);
  try {
    const body = await request.json();
    console.log("\u{1F4E6} Body:", body);
    const { name, email, phone } = body;
    if (!name || name.length < 2) {
      return new Response(JSON.stringify({
        error: "Name too short"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    console.log("\u{1F511} Slug:", slug);
    const brandId = crypto.randomUUID();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    console.log("\u{1F194} Brand ID:", brandId);
    console.log("\u{1F4BE} Attempting direct insert...");
    await env.DB.prepare(`
            INSERT INTO brands (
                brand_id, brand_name, brand_slug, brand_email, brand_phone,
                store_status, subscription_plan, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'draft', 'launch', ?, ?)
        `).bind(
      brandId,
      name,
      slug,
      email || null,
      phone || null,
      now,
      now
    ).run();
    console.log("\u2705 Insert successful");
    if (user && user.user_id) {
      console.log("\u{1F517} Linking user to brand...");
      await env.DB.prepare(`
                UPDATE users 
                SET brand_id = ?, role = 'admin' 
                WHERE user_id = ?
            `).bind(brandId, user.user_id).run();
      console.log("\u2705 User linked");
    }
    console.log("\u{1F50D} Fetching created brand...");
    const brand = await env.DB.prepare(
      "SELECT * FROM brands WHERE brand_id = ?"
    ).bind(brandId).first();
    console.log("\u2705 Brand found:", brand);
    return new Response(JSON.stringify({
      success: true,
      brand,
      message: "Brand created successfully!"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C ERROR:", error);
    console.error("\u274C STACK:", error.stack);
    return new Response(JSON.stringify({
      error: "Failed: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(simpleCreateBrand, "simpleCreateBrand");

// src/api/brands/index.js
async function handleBrands(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/brands", "");
  if (request.method === "GET" && (path === "" || path === "/")) {
    return listBrands(request, env, user);
  }
  if (request.method === "POST" && (path === "" || path === "/")) {
    return simpleCreateBrand(request, env, user);
  }
  if (request.method === "GET" && path.startsWith("/")) {
    const id = path.slice(1);
    return getBrand(request, env, user, id);
  }
  if (request.method === "PUT" && path.startsWith("/")) {
    const id = path.slice(1);
    return updateBrand(request, env, user, id);
  }
  return new Response(JSON.stringify({
    error: "Not found"
  }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
__name(handleBrands, "handleBrands");

// src/api/products/create.js
async function createProduct(request, env, user) {
  try {
    if (!user.brand_id) {
      return new Response(JSON.stringify({
        error: "You must have a brand to create products"
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    console.log("\u{1F4E6} Creating product:", body);
    const {
      product_name,
      product_type,
      price,
      description,
      currency = "USD",
      stock = 0,
      main_image_url,
      limited_release = 0,
      preorder_enabled = 0
    } = body;
    if (!product_name || product_name.length < 2) {
      return new Response(JSON.stringify({
        error: "Product name must be at least 2 characters"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const validTypes = ["t-shirt", "hoodie", "cap", "tote-bag", "mug", "poster"];
    if (!validTypes.includes(product_type)) {
      return new Response(JSON.stringify({
        error: "Invalid product type. Allowed: " + validTypes.join(", ")
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!price || price <= 0) {
      return new Response(JSON.stringify({
        error: "Price must be greater than 0"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sku = `${product_type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const productId = crypto.randomUUID();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(`
            INSERT INTO products (
                product_id, brand_id, product_type, product_name, 
                price, currency, stock, description, 
                main_image_url, sku, status, 
                limited_release, preorder_enabled, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)
        `).bind(
      productId,
      user.brand_id,
      product_type,
      product_name,
      price,
      currency,
      stock || 0,
      description || null,
      main_image_url || null,
      sku,
      limited_release ? 1 : 0,
      preorder_enabled ? 1 : 0,
      now,
      now
    ).run();
    const product = await env.DB.prepare(
      "SELECT * FROM products WHERE product_id = ?"
    ).bind(productId).first();
    return new Response(JSON.stringify({
      success: true,
      product,
      message: "Product created successfully!"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Create product error:", error);
    return new Response(JSON.stringify({
      error: "Failed to create product: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(createProduct, "createProduct");

// src/api/products/list.js
async function listProducts(request, env, user) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const offset = parseInt(url.searchParams.get("offset")) || 0;
    let query2 = `
            SELECT * FROM products 
            WHERE brand_id = ?
        `;
    const params = [user.brand_id];
    if (status !== "all") {
      query2 += ` AND status = ?`;
      params.push(status);
    }
    query2 += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const products = await env.DB.prepare(query2).bind(...params).all();
    let countQuery = `
            SELECT COUNT(*) as total FROM products 
            WHERE brand_id = ?
        `;
    const countParams = [user.brand_id];
    if (status !== "all") {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    const total = await env.DB.prepare(countQuery).bind(...countParams).first();
    return new Response(JSON.stringify({
      success: true,
      products: products.results,
      pagination: {
        total: total?.total || 0,
        limit,
        offset
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C List products error:", error);
    return new Response(JSON.stringify({
      error: "Failed to list products"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(listProducts, "listProducts");

// src/api/products/get.js
async function getProduct(request, env, user, productId) {
  try {
    console.log("\u{1F50D} Getting product:", productId);
    console.log("\u{1F464} User:", user);
    console.log("\u{1F3F7}\uFE0F Brand ID:", user.brand_id);
    const allProducts = await env.DB.prepare(`
            SELECT * FROM products WHERE product_id = ?
        `).bind(productId).first();
    console.log("\u{1F4E6} Product in DB:", allProducts);
    if (!allProducts) {
      return new Response(JSON.stringify({
        error: "Product not found in database"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const product = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ?
        `).bind(productId, user.brand_id).first();
    if (!product) {
      console.log("\u274C Product exists but brand_id mismatch");
      console.log("Product brand_id:", allProducts.brand_id);
      console.log("User brand_id:", user.brand_id);
      return new Response(JSON.stringify({
        error: "Product not found for your brand",
        debug: {
          productBrandId: allProducts.brand_id,
          userBrandId: user.brand_id
        }
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const variants = await env.DB.prepare(`
            SELECT * FROM product_variants 
            WHERE product_id = ?
            ORDER BY color_name, size
        `).bind(productId).all();
    return new Response(JSON.stringify({
      success: true,
      product,
      variants: variants.results || []
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Get product error:", error);
    return new Response(JSON.stringify({
      error: "Failed to get product: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(getProduct, "getProduct");

// src/api/products/update.js
async function updateProduct(request, env, user, productId) {
  try {
    const existing = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ?
        `).bind(productId, user.brand_id).first();
    if (!existing) {
      return new Response(JSON.stringify({
        error: "Product not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const updates = [];
    const values = [];
    const allowedFields = [
      "product_name",
      "product_type",
      "price",
      "currency",
      "stock",
      "description",
      "main_image_url",
      "status",
      "limited_release",
      "preorder_enabled",
      "preorder_close_date"
    ];
    for (const field of allowedFields) {
      if (body[field] !== void 0) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({
        error: "No fields to update"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    values.push((/* @__PURE__ */ new Date()).toISOString(), productId);
    await env.DB.prepare(`
            UPDATE products 
            SET ${updates.join(", ")}, updated_at = ?
            WHERE product_id = ?
        `).bind(...values).run();
    const product = await env.DB.prepare(
      "SELECT * FROM products WHERE product_id = ?"
    ).bind(productId).first();
    return new Response(JSON.stringify({
      success: true,
      product,
      message: "Product updated successfully!"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Update product error:", error);
    return new Response(JSON.stringify({
      error: "Failed to update product"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(updateProduct, "updateProduct");

// src/api/products/delete.js
async function deleteProduct(request, env, user, productId) {
  try {
    const existing = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ?
        `).bind(productId, user.brand_id).first();
    if (!existing) {
      return new Response(JSON.stringify({
        error: "Product not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
            UPDATE products 
            SET status = 'archived', updated_at = ?
            WHERE product_id = ?
        `).bind((/* @__PURE__ */ new Date()).toISOString(), productId).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Product archived successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Delete product error:", error);
    return new Response(JSON.stringify({
      error: "Failed to delete product"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(deleteProduct, "deleteProduct");

// src/api/products/variants.js
async function addVariant(request, env, user, productId) {
  try {
    const product = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ?
        `).bind(productId, user.brand_id).first();
    if (!product) {
      return new Response(JSON.stringify({
        error: "Product not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const {
      color_name,
      color_hex,
      size,
      price_adjustment = 0,
      stock_quantity = 0,
      mockup_url = null
    } = body;
    if (!color_name) {
      return new Response(JSON.stringify({
        error: "Color name is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const variantId = crypto.randomUUID();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(`
            INSERT INTO product_variants (
                variant_id, product_id, color_name, color_hex, 
                size, price_adjustment, stock_quantity, mockup_url,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      variantId,
      productId,
      color_name,
      color_hex || null,
      size || null,
      price_adjustment,
      stock_quantity,
      mockup_url,
      now,
      now
    ).run();
    const variant = await env.DB.prepare(
      "SELECT * FROM product_variants WHERE variant_id = ?"
    ).bind(variantId).first();
    return new Response(JSON.stringify({
      success: true,
      variant,
      message: "Variant added successfully!"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Add variant error:", error);
    return new Response(JSON.stringify({
      error: "Failed to add variant"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(addVariant, "addVariant");
async function updateVariant(request, env, user, productId, variantId) {
  try {
    const existing = await env.DB.prepare(`
            SELECT * FROM product_variants 
            WHERE variant_id = ? AND product_id = ?
        `).bind(variantId, productId).first();
    if (!existing) {
      return new Response(JSON.stringify({
        error: "Variant not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const updates = [];
    const values = [];
    const allowedFields = [
      "color_name",
      "color_hex",
      "size",
      "price_adjustment",
      "stock_quantity",
      "mockup_url"
    ];
    for (const field of allowedFields) {
      if (body[field] !== void 0) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({
        error: "No fields to update"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    values.push((/* @__PURE__ */ new Date()).toISOString(), variantId);
    await env.DB.prepare(`
            UPDATE product_variants 
            SET ${updates.join(", ")}, updated_at = ?
            WHERE variant_id = ?
        `).bind(...values).run();
    const variant = await env.DB.prepare(
      "SELECT * FROM product_variants WHERE variant_id = ?"
    ).bind(variantId).first();
    return new Response(JSON.stringify({
      success: true,
      variant,
      message: "Variant updated successfully!"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Update variant error:", error);
    return new Response(JSON.stringify({
      error: "Failed to update variant"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(updateVariant, "updateVariant");
async function deleteVariant(request, env, user, productId, variantId) {
  try {
    const result = await env.DB.prepare(`
            DELETE FROM product_variants 
            WHERE variant_id = ? AND product_id = ?
        `).bind(variantId, productId).run();
    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({
        error: "Variant not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Variant deleted successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Delete variant error:", error);
    return new Response(JSON.stringify({
      error: "Failed to delete variant"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(deleteVariant, "deleteVariant");

// src/api/products/index.js
async function handleProducts(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/products", "");
  if (request.method === "GET" && (path === "" || path === "/")) {
    return listProducts(request, env, user);
  }
  if (request.method === "POST" && (path === "" || path === "/")) {
    return createProduct(request, env, user);
  }
  if (request.method === "GET" && path.startsWith("/")) {
    const id = path.slice(1);
    return getProduct(request, env, user, id);
  }
  if (request.method === "PUT" && path.startsWith("/")) {
    const id = path.slice(1);
    return updateProduct(request, env, user, id);
  }
  if (request.method === "DELETE" && path.startsWith("/")) {
    const id = path.slice(1);
    return deleteProduct(request, env, user, id);
  }
  if (request.method === "POST" && path.includes("/variants")) {
    const id = path.split("/")[1];
    return addVariant(request, env, user, id);
  }
  if (request.method === "PUT" && path.includes("/variants/")) {
    const parts = path.split("/");
    const productId = parts[1];
    const variantId = parts[3];
    return updateVariant(request, env, user, productId, variantId);
  }
  if (request.method === "DELETE" && path.includes("/variants/")) {
    const parts = path.split("/");
    const productId = parts[1];
    const variantId = parts[3];
    return deleteVariant(request, env, user, productId, variantId);
  }
  return new Response(JSON.stringify({
    error: "Not found"
  }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
__name(handleProducts, "handleProducts");

// src/api/dashboard/index.js
async function handleDashboard(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/dashboard", "");
  if (request.method === "GET" && (path === "" || path === "/")) {
    return getDashboardStats(request, env, user);
  }
  if (request.method === "GET" && path === "/products") {
    return getProductStats(request, env, user);
  }
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
__name(handleDashboard, "handleDashboard");
async function getDashboardStats(request, env, user) {
  try {
    console.log("\u{1F4CA} Getting dashboard stats for:", user.brand_id);
    const brandId = user.brand_id;
    if (!brandId) {
      return new Response(JSON.stringify({
        error: "Brand not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("\u{1F4CA} Getting product stats...");
    let products = { total: 0, published: 0, draft: 0 };
    try {
      const result = await env.DB.prepare(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
                FROM products WHERE brand_id = ?
            `).bind(brandId).first();
      products = result || { total: 0, published: 0, draft: 0 };
    } catch (err) {
      console.log("\u26A0\uFE0F Products query error:", err.message);
    }
    console.log("\u{1F4CA} Getting variant stats...");
    let variants = { total: 0 };
    try {
      const result = await env.DB.prepare(`
                SELECT COUNT(*) as total
                FROM product_variants pv
                JOIN products p ON pv.product_id = p.product_id
                WHERE p.brand_id = ?
            `).bind(brandId).first();
      variants = result || { total: 0 };
    } catch (err) {
      console.log("\u26A0\uFE0F Variants query error:", err.message);
    }
    console.log("\u{1F4CA} Getting order stats...");
    let orders = { total: 0 };
    try {
      const result = await env.DB.prepare(`
                SELECT COUNT(*) as total
                FROM orders WHERE brand_id = ?
            `).bind(brandId).first();
      orders = result || { total: 0 };
    } catch (err) {
      console.log("\u26A0\uFE0F Orders table might not exist:", err.message);
      orders = { total: 0 };
    }
    const stats = {
      products: {
        total: products.total || 0,
        published: products.published || 0,
        draft: products.draft || 0
      },
      variants: {
        total: variants.total || 0
      },
      orders: {
        total: orders.total || 0
      }
    };
    console.log("\u{1F4CA} Stats:", stats);
    return new Response(JSON.stringify({
      success: true,
      stats
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Dashboard error:", error);
    return new Response(JSON.stringify({
      error: "Failed to get dashboard stats: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(getDashboardStats, "getDashboardStats");
async function getProductStats(request, env, user) {
  try {
    const brandId = user.brand_id;
    const stats = await env.DB.prepare(`
            SELECT 
                product_type,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published
            FROM products 
            WHERE brand_id = ?
            GROUP BY product_type
        `).bind(brandId).all();
    return new Response(JSON.stringify({
      success: true,
      stats: stats.results || []
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Product stats error:", error);
    return new Response(JSON.stringify({
      error: "Failed to get product stats"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(getProductStats, "getProductStats");

// src/api/subscriptions/plans.js
async function getPlans(request, env, user) {
  const plans = [
    {
      id: "launch",
      name: "Launch",
      price: 0,
      currency: "USD",
      price_label: "Free",
      fee_percentage: 12,
      max_products: 5,
      features: [
        "5 products",
        "12% transaction fee",
        "Basic storefront",
        "WhatsApp integration",
        "Paynow payments"
      ],
      limits: {
        products: 5,
        variants_per_product: 10,
        storage_mb: 50
      },
      is_free: true,
      popular: false
    },
    {
      id: "grow",
      name: "Grow",
      price: 5,
      currency: "USD",
      price_label: "$5/mo",
      fee_percentage: 6,
      max_products: 100,
      features: [
        "100 products",
        "6% transaction fee",
        "Custom storefront",
        "WhatsApp integration",
        "Paynow payments",
        "Advanced analytics",
        "Email support"
      ],
      limits: {
        products: 100,
        variants_per_product: 20,
        storage_mb: 500
      },
      is_free: false,
      popular: true
    },
    {
      id: "business",
      name: "Business",
      price: 15,
      currency: "USD",
      price_label: "$15/mo",
      fee_percentage: 3,
      max_products: -1,
      // Unlimited
      features: [
        "Unlimited products",
        "3% transaction fee",
        "Custom storefront",
        "Custom domain support",
        "WhatsApp integration",
        "Paynow payments",
        "Advanced analytics",
        "Priority support",
        "API access"
      ],
      limits: {
        products: -1,
        variants_per_product: 50,
        storage_mb: 2e3
      },
      is_free: false,
      popular: false
    },
    {
      id: "pro",
      name: "Pro",
      price: 39,
      currency: "USD",
      price_label: "$39/mo",
      fee_percentage: 1,
      max_products: -1,
      // Unlimited
      features: [
        "Unlimited products",
        "1% transaction fee",
        "White label storefront",
        "Custom domain support",
        "AI design generation",
        "WhatsApp integration",
        "Paynow payments",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Team accounts"
      ],
      limits: {
        products: -1,
        variants_per_product: 100,
        storage_mb: 1e4
      },
      is_free: false,
      popular: false
    }
  ];
  return new Response(JSON.stringify({
    success: true,
    plans
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
__name(getPlans, "getPlans");

// src/api/subscriptions/current.js
async function getCurrentSubscription(request, env, user) {
  try {
    const brandId = user.brand_id;
    if (!brandId) {
      return new Response(JSON.stringify({
        error: "Brand not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const subscription = await env.DB.prepare(`
            SELECT * FROM subscription_history 
            WHERE brand_id = ? 
            ORDER BY changed_at DESC 
            LIMIT 1
        `).bind(brandId).first();
    if (!subscription) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await env.DB.prepare(`
                INSERT INTO subscription_history (
                    brand_id, plan, status, fee_percentage, max_products, changed_at
                ) VALUES (?, 'launch', 'active', 12, 5, ?)
            `).bind(brandId, now).run();
      return new Response(JSON.stringify({
        success: true,
        subscription: {
          plan: "launch",
          status: "active",
          fee_percentage: 12,
          max_products: 5,
          is_free: true
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const planDetails = {
      "launch": { name: "Launch", is_free: true },
      "grow": { name: "Grow", is_free: false },
      "business": { name: "Business", is_free: false },
      "pro": { name: "Pro", is_free: false }
    };
    return new Response(JSON.stringify({
      success: true,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        fee_percentage: subscription.fee_percentage,
        max_products: subscription.max_products,
        is_free: planDetails[subscription.plan]?.is_free || true,
        plan_name: planDetails[subscription.plan]?.name || subscription.plan,
        changed_at: subscription.changed_at
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return new Response(JSON.stringify({
      error: "Failed to get subscription"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(getCurrentSubscription, "getCurrentSubscription");

// src/api/subscriptions/create.js
async function createSubscription(request, env, user) {
  try {
    const brandId = user.brand_id;
    if (!brandId) {
      return new Response(JSON.stringify({
        error: "Brand not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { plan } = body;
    const validPlans = ["launch", "grow", "business", "pro"];
    if (!validPlans.includes(plan)) {
      return new Response(JSON.stringify({
        error: "Invalid plan. Must be one of: " + validPlans.join(", ")
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const planDetails = {
      "launch": { fee: 12, max_products: 5, price: 0 },
      "grow": { fee: 6, max_products: 100, price: 5 },
      "business": { fee: 3, max_products: -1, price: 15 },
      "pro": { fee: 1, max_products: -1, price: 39 }
    };
    const current = await env.DB.prepare(`
            SELECT plan FROM subscription_history 
            WHERE brand_id = ? 
            ORDER BY changed_at DESC 
            LIMIT 1
        `).bind(brandId).first();
    if (current?.plan === plan) {
      return new Response(JSON.stringify({
        success: true,
        message: "Already on this plan",
        subscription: {
          plan,
          status: "active"
        }
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const details = planDetails[plan];
    if (details.price > 0) {
      return new Response(JSON.stringify({
        success: false,
        requires_payment: true,
        plan,
        amount: details.price,
        currency: "USD",
        message: "Payment required to upgrade",
        payment_url: `/api/checkout/subscription?plan=${plan}`
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(`
            INSERT INTO subscription_history (
                brand_id, plan, status, fee_percentage, max_products, changed_at
            ) VALUES (?, ?, 'active', ?, ?, ?)
        `).bind(brandId, plan, details.fee, details.max_products, now).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Subscription updated successfully",
      subscription: {
        plan,
        status: "active",
        fee_percentage: details.fee,
        max_products: details.max_products
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return new Response(JSON.stringify({
      error: "Failed to create subscription"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(createSubscription, "createSubscription");

// src/api/subscriptions/cancel.js
async function cancelSubscription(request, env, user) {
  try {
    const brandId = user.brand_id;
    if (!brandId) {
      return new Response(JSON.stringify({
        error: "Brand not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { reason } = body;
    const current = await env.DB.prepare(`
            SELECT * FROM subscription_history 
            WHERE brand_id = ? 
            ORDER BY changed_at DESC 
            LIMIT 1
        `).bind(brandId).first();
    if (!current) {
      return new Response(JSON.stringify({
        error: "No subscription found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (current.plan === "launch") {
      return new Response(JSON.stringify({
        error: "Cannot cancel free plan"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
            UPDATE subscription_history 
            SET status = 'cancelled'
            WHERE brand_id = ? AND plan = ? AND status = 'active'
        `).bind(brandId, current.plan).run();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(`
            INSERT INTO subscription_history (
                brand_id, plan, status, fee_percentage, max_products, changed_at
            ) VALUES (?, 'launch', 'active', 12, 5, ?)
        `).bind(brandId, now).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Subscription cancelled. Downgraded to Launch plan.",
      new_plan: "launch"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return new Response(JSON.stringify({
      error: "Failed to cancel subscription"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(cancelSubscription, "cancelSubscription");

// src/api/subscriptions/index.js
async function handleSubscriptions(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/subscriptions", "");
  if (request.method === "GET" && path === "/plans") {
    return getPlans(request, env, user);
  }
  if (request.method === "GET" && path === "/current") {
    return getCurrentSubscription(request, env, user);
  }
  if (request.method === "POST" && path === "/create") {
    return createSubscription(request, env, user);
  }
  if (request.method === "POST" && path === "/cancel") {
    return cancelSubscription(request, env, user);
  }
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
__name(handleSubscriptions, "handleSubscriptions");

// src/api/checkout/create.js
async function createCheckout(request, env, user) {
  try {
    const brandId = user.brand_id;
    if (!brandId) {
      return new Response(JSON.stringify({
        error: "Brand not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const {
      product_id,
      variant_id,
      quantity = 1,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address
    } = body;
    if (!product_id) {
      return new Response(JSON.stringify({
        error: "Product ID required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const product = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ? AND status != 'archived'
        `).bind(product_id, brandId).first();
    if (!product) {
      return new Response(JSON.stringify({
        error: "Product not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    let unit_price = product.price;
    let variant = null;
    if (variant_id) {
      variant = await env.DB.prepare(`
                SELECT * FROM product_variants 
                WHERE variant_id = ? AND product_id = ?
            `).bind(variant_id, product_id).first();
      if (variant) {
        unit_price += variant.price_adjustment || 0;
      }
    }
    const total_amount = unit_price * quantity;
    const orderId = "ORD-" + Date.now().toString(36).toUpperCase();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await env.DB.prepare(`
            INSERT INTO orders (
                order_id, brand_id, order_number, customer_name, customer_email,
                customer_phone, shipping_address, amount, currency,
                status, payment_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)
        `).bind(
      orderId,
      brandId,
      orderId,
      customer_name || null,
      customer_email || null,
      customer_phone || null,
      shipping_address || null,
      total_amount,
      product.currency || "USD",
      now,
      now
    ).run();
    await env.DB.prepare(`
            INSERT INTO order_items (
                item_id, order_id, product_id, artist_id, 
                product_name, product_type, quantity, 
                unit_price, line_total, brand_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      crypto.randomUUID(),
      orderId,
      product_id,
      brandId,
      // artist_id (use brand_id)
      product.product_name,
      product.product_type,
      quantity,
      unit_price,
      total_amount,
      // line_total
      brandId,
      now
    ).run();
    return new Response(JSON.stringify({
      success: true,
      order: {
        order_id: orderId,
        total_amount,
        currency: product.currency || "USD",
        items: [
          {
            product_id,
            product_name: product.product_name,
            quantity,
            unit_price,
            total: total_amount,
            variant
          }
        ]
      },
      payment_url: `/api/payments/create?order_id=${orderId}`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Create checkout error:", error);
    return new Response(JSON.stringify({
      error: "Failed to create checkout: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(createCheckout, "createCheckout");

// src/api/checkout/confirm.js
async function confirmCheckout(request, env, user) {
  try {
    const body = await request.json();
    const { order_id, payment_reference, payment_status } = body;
    if (!order_id) {
      return new Response(JSON.stringify({
        error: "Order ID required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
            UPDATE orders 
            SET payment_status = ?,
                payment_reference = ?,
                updated_at = ?
            WHERE order_id = ? AND brand_id = ?
        `).bind(
      payment_status || "paid",
      payment_reference || null,
      (/* @__PURE__ */ new Date()).toISOString(),
      order_id,
      user.brand_id
    ).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Order confirmed",
      order_id
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Confirm checkout error:", error);
    return new Response(JSON.stringify({
      error: "Failed to confirm checkout"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(confirmCheckout, "confirmCheckout");

// src/api/checkout/index.js
async function handleCheckout(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/checkout", "");
  if (request.method === "POST" && path === "/create") {
    return createCheckout(request, env, user);
  }
  if (request.method === "POST" && path === "/confirm") {
    return confirmCheckout(request, env, user);
  }
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
__name(handleCheckout, "handleCheckout");

// src/api/payments/create.js
async function createPayment(request, env, user) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("order_id");
    if (!orderId) {
      return new Response(JSON.stringify({
        error: "Order ID required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND brand_id = ?
        `).bind(orderId, user.brand_id).first();
    if (!order) {
      return new Response(JSON.stringify({
        error: "Order not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (order.payment_status === "paid") {
      return new Response(JSON.stringify({
        success: true,
        message: "Order already paid"
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const items = await env.DB.prepare(`
            SELECT * FROM order_items 
            WHERE order_id = ?
        `).bind(orderId).all();
    const firstItem = items.results?.[0];
    const productName = firstItem?.product_name || "Product";
    const artistId = firstItem?.artist_id || user.brand_id || "GENERAL";
    const safeArtistId = sanitizeId(artistId);
    const reference = `ZVAKHO_${safeArtistId}_${Date.now()}`;
    const baseUrl = env.BASE_URL || "https://zvakho-payments-v2.yasibomedia.workers.dev";
    const integrationId = env.PAYNOW_INTEGRATION_ID;
    const integrationKey = env.PAYNOW_INTEGRATION_KEY;
    if (!integrationId || !integrationKey) {
      return new Response(JSON.stringify({
        error: "Payment system not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const phone = formatZimPhone(order.customer_phone || "");
    const fields = {
      resulturl: `${baseUrl}/api/payments/webhook`,
      returnurl: `${baseUrl}/api/payments/status?order_id=${orderId}`,
      reference,
      amount: order.amount.toFixed(2),
      id: integrationId,
      additionalinfo: `${productName} - Order ${orderId}`,
      authemail: order.customer_email || "",
      phone,
      method: "ecocash",
      status: "Message"
    };
    const hash = await generateHash(fields, integrationKey);
    const paynowResponse = await fetch("https://www.paynow.co.zw/interface/remotetransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        ...fields,
        hash
      })
    });
    const responseText = await paynowResponse.text();
    const parsed = parsePaynowResponse(responseText);
    console.log("\u{1F4E8} Paynow Response:", parsed);
    const pollUrl = parsed.pollurl || "";
    const browserUrl = parsed.browserurl || "";
    const paynowStatus = parsed.status || "";
    const paynowError = parsed.error || "";
    if (!pollUrl) {
      return new Response(JSON.stringify({
        status: "error",
        reference,
        payment_status: "failed",
        paynow_status: paynowStatus,
        paynow_error: paynowError || "Paynow did not return poll_url",
        raw_response: responseText
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
            UPDATE orders 
            SET payment_reference = ?,
                poll_url = ?,
                browser_url = ?,
                paynow_status = ?,
                paynow_error = ?,
                updated_at = ?
            WHERE order_id = ?
        `).bind(
      reference,
      pollUrl,
      browserUrl,
      paynowStatus,
      paynowError,
      (/* @__PURE__ */ new Date()).toISOString(),
      orderId
    ).run();
    await env.DB.prepare(`
            UPDATE order_items 
            SET payment_reference = ?
            WHERE order_id = ?
        `).bind(reference, orderId).run();
    return new Response(JSON.stringify({
      status: "success",
      reference,
      transaction_reference: reference,
      payment_url: browserUrl || "",
      poll_url: pollUrl,
      poll_url_received: true,
      payment_status: "pending",
      paynow_status: paynowStatus,
      paynow_error: paynowError
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Create payment error:", error);
    return new Response(JSON.stringify({
      error: "Failed to create payment: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(createPayment, "createPayment");
function formatZimPhone(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("263")) {
    cleaned = "0" + cleaned.slice(3);
  }
  return cleaned;
}
__name(formatZimPhone, "formatZimPhone");
function sanitizeId(value) {
  return String(value || "GENERAL").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
__name(sanitizeId, "sanitizeId");
function parsePaynowResponse(text) {
  const result = {};
  if (!text) return result;
  text.split("&").forEach((pair) => {
    const [k, v] = pair.split("=");
    if (!k) return;
    result[decodeURIComponent(k).toLowerCase()] = decodeURIComponent(v || "");
  });
  return result;
}
__name(parsePaynowResponse, "parsePaynowResponse");
async function generateHash(fields, key) {
  let str = "";
  Object.keys(fields).forEach((k) => {
    if (k !== "hash") {
      str += fields[k];
    }
  });
  str += key;
  const buf = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(str)
  );
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
__name(generateHash, "generateHash");

// src/api/payments/webhook.js
async function handleWebhook(request, env) {
  try {
    const body = await request.formData();
    const data = Object.fromEntries(body);
    console.log("\u{1F4E5} Webhook received:", data);
    const reference = data.reference || data.payment_reference || "";
    const status = data.status || data.payment_status || "";
    const paynowReference = data.paynowreference || data.transaction_reference || "";
    if (!reference) {
      return new Response("Missing reference", { status: 400 });
    }
    const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE payment_reference = ?
        `).bind(reference).first();
    if (!order) {
      console.log("\u274C Order not found for reference:", reference);
      return new Response("Order not found", { status: 404 });
    }
    if (order.payment_status === "paid") {
      return new Response("Already paid", { status: 200 });
    }
    const isPaid = status.toLowerCase() === "paid" || status.toLowerCase() === "awaiting delivery";
    if (isPaid) {
      await env.DB.prepare(`
                UPDATE orders 
                SET payment_status = 'paid',
                    paynow_reference = ?,
                    paynow_status = ?,
                    paid_at = ?,
                    updated_at = ?
                WHERE order_id = ?
            `).bind(
        paynowReference,
        status,
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString(),
        order.order_id
      ).run();
      console.log("\u2705 Payment confirmed for order:", order.order_id);
      await env.DB.prepare(`
                UPDATE order_items 
                SET fulfilment_status = 'processing',
                    updated_at = ?
                WHERE order_id = ?
            `).bind((/* @__PURE__ */ new Date()).toISOString(), order.order_id).run();
    } else {
      await env.DB.prepare(`
                UPDATE orders 
                SET paynow_status = ?,
                    updated_at = ?
                WHERE order_id = ?
            `).bind(status, (/* @__PURE__ */ new Date()).toISOString(), order.order_id).run();
    }
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("\u274C Webhook error:", error);
    return new Response("Error: " + error.message, { status: 500 });
  }
}
__name(handleWebhook, "handleWebhook");

// src/api/payments/status.js
async function getPaymentStatus(request, env, user) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("order_id");
    const reference = url.searchParams.get("reference");
    if (!orderId && !reference) {
      return new Response(JSON.stringify({
        error: "Order ID or reference required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let order;
    if (orderId) {
      order = await env.DB.prepare(`
                SELECT * FROM orders 
                WHERE order_id = ? AND brand_id = ?
            `).bind(orderId, user.brand_id).first();
    } else {
      order = await env.DB.prepare(`
                SELECT * FROM orders 
                WHERE payment_reference = ? AND brand_id = ?
            `).bind(reference, user.brand_id).first();
    }
    if (!order) {
      return new Response(JSON.stringify({
        error: "Order not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (order.payment_status === "paid") {
      return new Response(JSON.stringify({
        success: true,
        order_id: order.order_id,
        payment_status: "paid",
        paid_at: order.paid_at
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (order.poll_url) {
      try {
        const pollRes = await fetch(order.poll_url);
        const pollText = await pollRes.text();
        const parsed = parsePaynowResponse2(pollText);
        if (parsed.status?.toLowerCase() === "paid" || parsed.status?.toLowerCase() === "awaiting delivery") {
          await env.DB.prepare(`
                        UPDATE orders 
                        SET payment_status = 'paid',
                            paynow_reference = ?,
                            paynow_status = ?,
                            paid_at = ?,
                            updated_at = ?
                        WHERE order_id = ?
                    `).bind(
            parsed.paynowreference || parsed.reference || "",
            parsed.status || "Paid",
            (/* @__PURE__ */ new Date()).toISOString(),
            (/* @__PURE__ */ new Date()).toISOString(),
            order.order_id
          ).run();
          return new Response(JSON.stringify({
            success: true,
            order_id: order.order_id,
            payment_status: "paid",
            paynow_status: parsed.status
          }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        console.log("Poll error:", err.message);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      order_id: order.order_id,
      payment_status: "pending",
      paynow_status: order.paynow_status || "pending"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Status check error:", error);
    return new Response(JSON.stringify({
      error: "Failed to check status"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(getPaymentStatus, "getPaymentStatus");
function parsePaynowResponse2(text) {
  const result = {};
  if (!text) return result;
  text.split("&").forEach((pair) => {
    const [k, v] = pair.split("=");
    if (!k) return;
    result[decodeURIComponent(k).toLowerCase()] = decodeURIComponent(v || "");
  });
  return result;
}
__name(parsePaynowResponse2, "parsePaynowResponse");

// src/api/payments/confirm.js
async function confirmPayment(request, env, user) {
  try {
    const body = await request.json();
    const { order_id } = body;
    if (!order_id) {
      return new Response(JSON.stringify({
        error: "Order ID required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND brand_id = ?
        `).bind(order_id, user.brand_id).first();
    if (!order) {
      return new Response(JSON.stringify({
        error: "Order not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (order.payment_status === "paid") {
      return new Response(JSON.stringify({
        success: true,
        message: "Already paid"
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
            UPDATE orders 
            SET payment_status = 'paid',
                paid_at = ?,
                updated_at = ?
            WHERE order_id = ?
        `).bind(
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString(),
      order_id
    ).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Payment confirmed manually",
      order_id
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Confirm payment error:", error);
    return new Response(JSON.stringify({
      error: "Failed to confirm payment"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(confirmPayment, "confirmPayment");

// src/api/payments/index.js
async function handlePayments(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/payments", "");
  if (request.method === "POST" && path === "/create") {
    return createPayment(request, env, user);
  }
  if (request.method === "POST" && path === "/webhook") {
    return handleWebhook(request, env);
  }
  if (request.method === "GET" && path === "/status") {
    return getPaymentStatus(request, env, user);
  }
  if (request.method === "POST" && path === "/confirm") {
    return confirmPayment(request, env, user);
  }
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
__name(handlePayments, "handlePayments");

// src/middleware/auth.js
async function authenticate(request, env) {
  if (env.ENVIRONMENT === "development") {
    const user = await env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind("junzatv@gmail.com").first();
    if (user) {
      console.log("\u2705 Found real user:", user.email);
      return {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name || "Test User",
        role: user.role || "admin",
        brand_id: user.brand_id || null
      };
    }
    return {
      user_id: "USER_OWNER_001",
      email: "junzatv@gmail.com",
      full_name: "Test User",
      role: "admin",
      brand_id: "b627eebb-3182-41bd-8dc2-3b4cf37c6928"
    };
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;
  try {
    const token = authHeader.split(" ")[1];
    const session = await env.DB.prepare(
      "SELECT * FROM sessions WHERE token = ? AND is_active = 1"
    ).bind(token).first();
    if (!session) return null;
    const user = await env.DB.prepare(`
            SELECT u.*, b.brand_id, b.brand_slug, b.brand_name
            FROM users u
            LEFT JOIN brands b ON u.brand_id = b.brand_id
            WHERE u.user_id = ?
        `).bind(session.user_id).first();
    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
__name(authenticate, "authenticate");
async function requireAuth(request, env) {
  const user = await authenticate(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  return user;
}
__name(requireAuth, "requireAuth");

// src/index.js
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/api/v2/test" || path === "/api/test") {
      return handleTest(request, env);
    }
    if (path === "/health" || path === "/api/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: "development"
      }), {
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    if (path.startsWith("/api/dashboard")) {
      const user = await requireAuth(request, env);
      if (user instanceof Response) return user;
      return handleDashboard(request, env, user);
    }
    if (path.startsWith("/api/brands")) {
      const user = await requireAuth(request, env);
      if (user instanceof Response) return user;
      return handleBrands(request, env, user);
    }
    if (path.startsWith("/api/products")) {
      const user = await requireAuth(request, env);
      if (user instanceof Response) return user;
      return handleProducts(request, env, user);
    }
    if (path.startsWith("/api/subscriptions")) {
      const user = await requireAuth(request, env);
      if (user instanceof Response) return user;
      return handleSubscriptions(request, env, user);
    }
    if (path.startsWith("/api/checkout")) {
      const user = await requireAuth(request, env);
      if (user instanceof Response) return user;
      return handleCheckout(request, env, user);
    }
    if (path.startsWith("/api/payments")) {
      if (path === "/api/payments/webhook") {
        return handlePayments(request, env, null);
      }
      const user = await requireAuth(request, env);
      if (user instanceof Response) return user;
      return handlePayments(request, env, user);
    }
    return new Response(JSON.stringify({
      error: "Not found - ZVAKHO v2 endpoint",
      available: [
        "/api/v2/test",
        "/api/test",
        "/health",
        "/api/dashboard",
        "/api/brands (POST, GET)",
        "/api/brands/:id (GET, PUT)",
        "/api/products (POST, GET)",
        "/api/products/:id (GET, PUT, DELETE)",
        "/api/subscriptions",
        "/api/checkout",
        "/api/payments",
        "/api/payments/webhook"
      ]
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

// ../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// .wrangler/tmp/bundle-qyRyQL/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default
];
var middleware_insertion_facade_default = src_default;

// ../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-qyRyQL/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
