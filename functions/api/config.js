/**
 * ==========================================
 * Cloudflare Pages Functions 后端 API 处理
 * 路由: /api/config
 * 第一阶段优化：加入了 Bing 壁纸的 KV 缓存逻辑
 * ==========================================
 */

const CONFIG = {
  bingApi: "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1"
};

function formatCNTime(date) {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const defaultData = {
  settings: { cardWidth: 150 }, 
  categories: [
    { id: "c1", name: "常用", icon: "💚", hidden: false },
    { id: "c2", name: "A I", icon: "🔧", hidden: false }
  ],
  items: [
    { id: "a01", catId: "c1", title: "GitHub", url: "https://github.com",  icon: "https://favicon.im/github.com", hidden: false },
    { id: "b01", catId: "c2", title: "ChatGPT", url: "https://chat.openai.com/",  icon: "https://img.icons8.com/ios/100/FFFFFF/chatgpt.png", hidden: false }
  ],
  lastUpdated: formatCNTime(new Date()) 
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 0. 核心防崩检查：确保 KV 已经绑定
  if (!env.page_nav) {
    return new Response(JSON.stringify({ 
      error: "KV_BINDING_MISSING", 
      message: "后端错误：未检测到名为 'page_nav' 的 KV 数据库绑定。请在 Cloudflare Pages 设置中添加绑定并重新部署。" 
    }), { status: 500, headers: { "Content-Type": "application/json;charset=UTF-8" } });
  }

  const headers = { "Content-Type": "application/json;charset=UTF-8", "Cache-Control": "no-store" };

  try {
    // 1. 处理恢复默认配置 (DELETE)
    if (request.method === "DELETE") {
      const auth = request.headers.get("Authorization");
      if (auth !== env.TOKEN) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      
      const resetData = { ...defaultData, lastUpdated: formatCNTime(new Date()) };
      await env.page_nav.put("config", JSON.stringify(resetData)); 
      return new Response(JSON.stringify({ success: true, message: "已重置为默认配置" }), { headers });
    }

    // 2. 处理保存数据 (POST)
    if (request.method === "POST") {
      const auth = request.headers.get("Authorization");
      if (auth !== env.TOKEN) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      
      const newData = await request.json();
      newData.lastUpdated = formatCNTime(new Date()); 
      await env.page_nav.put("config", JSON.stringify(newData)); 
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // 3. 处理获取数据 (GET)
    if (request.method === "GET") {
      let dataStr = await env.page_nav.get("config");
      let dataObj = JSON.parse(dataStr || JSON.stringify(defaultData));

      const auth = request.headers.get("Authorization") || url.searchParams.get("token");
      const isAdmin = (auth === env.TOKEN);

      if (!isAdmin) {
        dataObj.categories = dataObj.categories.filter(c => !c.hidden);
        dataObj.items = dataObj.items.filter(i => !i.hidden);
      }

      // 【优化】Bing 壁纸的 KV 缓存机制 (12小时有效期)
      let bgUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920"; // 默认后备壁纸
      try {
        const cachedBingStr = await env.page_nav.get("bing_cache");
        const now = Date.now();
        let useCache = false;

        if (cachedBingStr) {
          const cachedBing = JSON.parse(cachedBingStr);
          // 如果缓存存在且未过期（12小时 = 43200000 毫秒）
          if (cachedBing.url && cachedBing.expiresAt > now) {
            bgUrl = cachedBing.url;
            useCache = true;
          }
        }

        // 如果没有缓存或已过期，则发起真实请求
        if (!useCache) {
          const bingRes = await fetch(CONFIG.bingApi, { cf: { cacheTtl: 3600 } });
          if (bingRes.ok) {
            const bingData = await bingRes.json();
            bgUrl = "https://www.bing.com" + bingData.images[0].url;
            // 将新获取的 URL 写入 KV 缓存
            await env.page_nav.put("bing_cache", JSON.stringify({ url: bgUrl, expiresAt: now + 43200000 }));
          }
        }
      } catch (e) {
        console.log("Bing 壁纸获取或缓存写入失败", e);
      }

      return new Response(JSON.stringify({ ...dataObj, bgUrl, isAdmin }), { headers });
    }

    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: "SERVER_ERROR", message: err.toString() }), { status: 500, headers });
  }
}
