var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-3pSL0h/checked-fetch.js
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

// .wrangler/tmp/bundle-3pSL0h/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/api/test.js
async function handleTest(request, env) {
  return new Response(JSON.stringify({
    success: true,
    message: "ZVAKHO Rebuild API is working!",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "2.0.0-dev"
  }), {
    headers: { "Content-Type": "application/json" }
  });
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
  if (!email)
    return { valid: true };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
}
__name(validateEmail, "validateEmail");
function validatePhone(phone) {
  if (!phone)
    return { valid: true };
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

// src/api/brands/create.js
async function createBrand(request, env, user) {
  try {
    console.log("\u{1F4DD} Starting brand creation...");
    console.log("\u{1F464} User:", user);
    const body = await request.json();
    console.log("\u{1F4E6} Request body:", body);
    const { name, email, phone } = body;
    console.log("\u{1F50D} Validating name...");
    const nameCheck = validateBrandName(name);
    if (!nameCheck.valid) {
      console.log("\u274C Name validation failed:", nameCheck.error);
      return new Response(JSON.stringify({ error: nameCheck.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("\u{1F50D} Validating email...");
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      console.log("\u274C Email validation failed:", emailCheck.error);
      return new Response(JSON.stringify({ error: emailCheck.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("\u{1F50D} Validating phone...");
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      console.log("\u274C Phone validation failed:", phoneCheck.error);
      return new Response(JSON.stringify({ error: phoneCheck.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const slug = slugify(name);
    console.log("\u{1F511} Generated slug:", slug);
    console.log("\u{1F50D} Checking if brand exists...");
    try {
      const existing = await queryOne(
        env,
        "SELECT brand_id FROM brands WHERE brand_slug = ? AND deleted_at IS NULL",
        [slug]
      );
      console.log("\u{1F4CA} Existing brand check result:", existing);
      if (existing) {
        console.log("\u274C Brand already exists");
        return new Response(JSON.stringify({
          error: "Brand name already taken"
        }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (dbError) {
      console.log("\u274C Database query failed:", dbError);
      return new Response(JSON.stringify({
        error: "Database error: " + dbError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const brandId = crypto.randomUUID();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    console.log("\u{1F195} Creating brand with ID:", brandId);
    try {
      console.log("\u{1F4DD} Inserting brand...");
      await execute(env, `
                INSERT INTO brands (
                    brand_id, brand_name, brand_slug, brand_email, brand_phone,
                    store_status, subscription_plan, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'draft', 'launch', ?, ?)
            `, [brandId, name, slug, email || null, phone || null, now, now]);
      console.log("\u2705 Brand inserted successfully");
    } catch (dbError) {
      console.log("\u274C Brand insert failed:", dbError);
      return new Response(JSON.stringify({
        error: "Database insert error: " + dbError.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("\u{1F4DD} Updating user...");
    try {
      await execute(env, `
                UPDATE users SET brand_id = ?, role = 'admin' WHERE user_id = ?
            `, [brandId, user.user_id]);
      console.log("\u2705 User updated successfully");
    } catch (dbError) {
      console.log("\u274C User update failed:", dbError);
    }
    console.log("\u{1F4DD} Creating subscription history...");
    try {
      await execute(env, `
                INSERT INTO subscription_history (
                    brand_id, plan, status, fee_percentage, max_products, changed_at
                ) VALUES (?, 'launch', 'active', 12, 5, ?)
            `, [brandId, now]);
      console.log("\u2705 Subscription history created");
    } catch (dbError) {
      console.log("\u274C Subscription history failed:", dbError);
    }
    console.log("\u{1F4DD} Fetching created brand...");
    try {
      const brand = await queryOne(env, `
                SELECT * FROM brands WHERE brand_id = ?
            `, [brandId]);
      console.log("\u2705 Brand created successfully!");
      return new Response(JSON.stringify({
        success: true,
        brand,
        message: "Brand created successfully!"
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (dbError) {
      console.log("\u274C Fetch brand failed:", dbError);
      return new Response(JSON.stringify({
        error: "Brand created but couldn't fetch it"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("\u274C Create brand error:", error);
    console.error("Stack trace:", error.stack);
    return new Response(JSON.stringify({
      error: "Failed to create brand: " + error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(createBrand, "createBrand");

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
      "brand_feeling": (val) => {
        const valid = ["premium", "modern", "streetwear", "minimal", "vintage"];
        return valid.includes(val) ? { valid: true } : { valid: false, error: "Invalid brand feeling" };
      },
      "primary_color": (val) => {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        return hexRegex.test(val) ? { valid: true } : { valid: false, error: "Invalid hex color" };
      },
      "secondary_color": (val) => {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        return hexRegex.test(val) ? { valid: true } : { valid: false, error: "Invalid hex color" };
      },
      "accent_color": (val) => {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        return hexRegex.test(val) ? { valid: true } : { valid: false, error: "Invalid hex color" };
      },
      "font_primary": (val) => {
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
      },
      "font_secondary": (val) => {
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
      },
      "store_status": (val) => {
        const valid = ["draft", "active", "paused", "closed"];
        return valid.includes(val) ? { valid: true } : { valid: false, error: "Invalid store status" };
      },
      "store_hours": (val) => ({ valid: true }),
      "whatsapp_number": validatePhone,
      "logo_url": (val) => ({ valid: true }),
      "custom_domain": (val) => ({ valid: true })
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

// src/api/brands/index.js
async function handleBrands(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/brands", "");
  if (request.method === "GET" && (path === "" || path === "/")) {
    return listBrands(request, env, user);
  }
  if (request.method === "POST" && (path === "" || path === "/")) {
    return createBrand(request, env, user);
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

// src/middleware/auth.js
async function authenticate(request, env) {
  if (env.ENVIRONMENT === "development") {
    return {
      user_id: "test-user-id-" + Date.now(),
      email: "test@zvakho.com",
      full_name: "Test User",
      role: "admin",
      brand_id: null
    };
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader)
    return null;
  try {
    const token = authHeader.split(" ")[1];
    const session = await env.DB.prepare(
      "SELECT * FROM sessions WHERE token = ? AND is_active = 1"
    ).bind(token).first();
    if (!session)
      return null;
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
        headers: { "Content-Type": "application/json" }
      });
    }
    if (path.startsWith("/api/brands")) {
      const user = await requireAuth(request, env);
      if (user instanceof Response)
        return user;
      return handleBrands(request, env, user);
    }
    return new Response(JSON.stringify({
      error: "Not found - ZVAKHO v2 endpoint",
      available: [
        "/api/v2/test",
        "/api/test",
        "/health",
        "/api/brands (POST, GET)",
        "/api/brands/:id (GET, PUT)"
      ]
    }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
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

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-3pSL0h/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
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

// .wrangler/tmp/bundle-3pSL0h/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
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
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
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
