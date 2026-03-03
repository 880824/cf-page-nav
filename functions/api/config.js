/**
 * ==========================================
 * Cloudflare Pages Functions 后端 API 处理
 * 路由: /api/config
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

  // 设置通用的 JSON 响应头
  const headers = { "Content-Type": "application/json;charset=UTF-8", "Cache-Control": "no-store" };

  try {
    // 1. 处理恢复默认配置 (DELETE 方法)
    if (request.method === "DELETE") {
      const auth = request.headers.get("Authorization");
      if (auth !== env.TOKEN) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      
      const resetData = { ...defaultData, lastUpdated: formatCNTime(new Date()) };
      await env.page_nav.put("config", JSON.stringify(resetData)); 
      return new Response(JSON.stringify({ success: true, message: "已重置为默认配置" }), { headers });
    }

    // 2. 处理保存数据 (POST 方法)
    if (request.method === "POST") {
      const auth = request.headers.get("Authorization");
      if (auth !== env.TOKEN) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      
      const newData = await request.json();
      newData.lastUpdated = formatCNTime(new Date()); 
      await env.page_nav.put("config", JSON.stringify(newData)); 
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // 3. 处理获取数据 (GET 方法)
    if (request.method === "GET") {
      let dataStr = await env.page_nav.get("config");
      let dataObj = JSON.parse(dataStr || JSON.stringify(defaultData));

      // 验证身份
      const auth = request.headers.get("Authorization") || url.searchParams.get("token");
      const isAdmin = (auth === env.TOKEN);

      // 如果未验证身份，则过滤掉隐藏的分类和书签
      if (!isAdmin) {
        dataObj.categories = dataObj.categories.filter(c => !c.hidden);
        dataObj.items = dataObj.items.filter(i => !i.hidden);
      }

      // 获取必应壁纸 (加入超时和容错)
      let bgUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920";
      try {
        const bingRes = await fetch(CONFIG.bingApi, { cf: { cacheTtl: 3600 } });
        if (bingRes.ok) {
          const bingData = await bingRes.json();
          bgUrl = "https://www.bing.com" + bingData.images[0].url;
        }
      } catch (e) {
        console.log("Bing 壁纸获取失败，使用默认壁纸");
      }

      return new Response(JSON.stringify({ ...dataObj, bgUrl, isAdmin }), { headers });
    }

    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers });

  } catch (err) {
    // 捕获所有后端异常并返回给前端
    return new Response(JSON.stringify({ error: "SERVER_ERROR", message: err.toString() }), { status: 500, headers });
  }
}
