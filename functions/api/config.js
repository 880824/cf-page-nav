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
    { id: "c2", name: "A I", icon: "🔧", hidden: false },
    { id: "c3", name: "直播", icon: "📺", hidden: false },
    { id: "c4", name: "代理", icon: "🔒", hidden: false }, 
    { id: "c5", name: "学习", icon: "📖", hidden: false }
],
  items: [
    { id: "a01", catId: "c1", title: "iStoreOS", url: "http://192.168.31.2/cgi-bin/luci/admin/quickstart/",  icon: "https://istore.istoreos.com/static-icon/openwrt-app-meta/app-meta-istoredup/logo.png", hidden: false },
    { id: "a02", catId: "c1", title: "Clash 面板", url: "http://192.168.31.2:9090/ui/zashboard/#/connections",  icon: "https://favicon.im/www.clash-github.com", hidden: false },
    { id: "a03", catId: "c1", title: "GitHub", url: "https://github.com/880824/TV",  icon: "https://favicon.im/github.com", hidden: false },
    { id: "a04", catId: "c1", title: "Cloudflare", url: "https://dash.cloudflare.com/3f45c2cd57f6c5aa594b776a0e7406c9/workers-and-pages",  icon: "https://favicon.im/cloudflare.com", hidden: false },
    { id: "a05", catId: "c1", title: "金山文档", url: "https://www.kdocs.cn/latest?from=docs",  icon: "https://favicon.im/wps.cn", hidden: false },
    { id: "a06", catId: "c1", title: "TV输入法", url: "http://192.168.31.248:9970/",  icon: "📖", hidden: false },
    { id: "a07", catId: "c1", title: "YouTube", url: "https://www.youtube.com/",  icon: "https://icons.duckduckgo.com/ip3/www.youtube.com.ico", hidden: false },
    { id: "a08", catId: "c1", title: "哔哩哔哩", url: "https://www.bilibili.com/",  icon: "https://favicon.im/www.bilibili.com", hidden: false },
    { id: "a09", catId: "c1", title: "什么值得买", url: "https://www.smzdm.com/",  icon: "https://favicon.im/www.smzdm.com", hidden: false },
    { id: "a10", catId: "c1", title: "打喷嚏", url: "https://www.dapenti.com/blog/blog.asp?subjectid=70&name=xilei",  icon: "💡", hidden: false },
    { id: "a11", catId: "c1", title: "煎蛋无聊图", url: "https://jandan.net/pic",  icon: "https://icons.duckduckgo.com/ip3/jandan.net.ico", hidden: false },
    { id: "a12", catId: "c1", title: "视频在线下载", url: "https://tubedown.cn/youtube",  icon: "https://favicon.im/tubedown.cn", hidden: false },
    { id: "a13", catId: "c1", title: "老王导航", url: "https://nav.eooce.com/",  icon: "https://favicon.im/nav.eooce.com", hidden: false },
    { id: "a14", catId: "c1", title: "爱达杂货铺", url: "https://adzhp.cc/",  icon: "https://favicon.im/adzhp.cc", hidden: false },
    { id: "a15", catId: "c1", title: "最右", url: "https://www.izuiyou.com/",  icon: "https://favicon.im/www.izuiyou.com", hidden: false },
    { id: "a16", catId: "c1", title: "吾爱破解", url: "https://www.52pojie.cn/",  icon: "https://favicon.im/www.52pojie.cn", hidden: false },
    { id: "a17", catId: "c1", title: "博海拾贝", url: "https://www.bohaishibei.com/",  icon: "https://favicon.im/bohaishibei.com", hidden: false },
    { id: "a18", catId: "c1", title: "海康云盘", url: "https://drive.ticklink.com/disk/fileDownload?link=JISlFI8R",  icon: "https://favicon.im/drive.ticklink.com", hidden: false }, 
    { id: "a19", catId: "c1", title: "零度博客", url: "https://www.freedidi.com/",  icon: "https://icons.duckduckgo.com/ip3/www.freedidi.com.ico", hidden: false }, 
  
    { id: "b01", catId: "c2", title: "Gemini", url: "https://gemini.google.com/",  icon: "https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg", hidden: false },
    { id: "b02", catId: "c2", title: "ChatGPT", url: "https://chat.openai.com/",  icon: "https://img.icons8.com/ios/100/FFFFFF/chatgpt.png", hidden: false },
    { id: "b03", catId: "c2", title: "DeepSeek", url: "https://chat.deepseek.com/",  icon: "https://favicon.im/chat.deepseek.com", hidden: false },
    { id: "b04", catId: "c2", title: "阿里千问", url: "https://chat.qwen.ai/",  icon: "https://favicon.im/chat.qwen.ai", hidden: false },
    { id: "b05", catId: "c2", title: "豆包", url: "https://www.doubao.com/chat/",  icon: "https://favicon.im/www.doubao.com", hidden: false },
    { id: "b06", catId: "c2", title: "Kimi", url: "https://www.kimi.com/",  icon: "https://favicon.im/www.kimi.com", hidden: false },
    { id: "b07", catId: "c2", title: "Perplexity", url: "https://www.perplexity.ai/",  icon: "🌟", hidden: false },
    { id: "b08", catId: "c2", title: "Grok", url: "https://grok.com/",  icon: "https://favicon.im/grok.com", hidden: false },
 
    { id: "c01", catId: "c3", title: "自用直播管理", url: "https://tv.880824.xyz/config",  icon: "📑", hidden: false },
    { id: "c02", catId: "c3", title: "直播收集", url: "https://github-link.880824.xyz/TV.json?token=880824",  icon: "🎥", hidden: false }, 
    { id: "c03", catId: "c3", title: "点播收集", url: "https://github-link.880824.xyz/ck.json?token=880824",  icon: "📺", hidden: false }, 
    { id: "c04", catId: "c3", title: "直播工具箱", url: "http://nn.7x9d.cn/",  icon: "🛠️", hidden: false },
    { id: "c05", catId: "c3", title: "PHP管理", url: "http://192.168.31.2:5090/",  icon: "https://favicon.im/php.net", hidden: false },
    { id: "c06", catId: "c3", title: "Yan-G直播", url: "https://yang-1989.eu.org/",  icon: "🌐", hidden: false },
    { id: "c07", catId: "c3", title: "医工IPTV找源", url: "https://iptv.cqshushu.com",  icon: "🔍", hidden: false },
    { id: "c08", catId: "c3", title: "FOFA", url: "https://fofa.info/result?qbase64=Ym9keT0icG9ydDogNzg5MCIgJiYgYm9keT0ic29ja3MtcG9ydDogNzg5MSIgJiYgYm9keT0iYWxsb3ctbGFuOiB0cnVlIg%3D%3D",  icon: "https://icons.duckduckgo.com/ip3/fofa.info.ico", hidden: false },
    { id: "c09", catId: "c3", title: "医工直播接口", url: "http://iptv.cqshushu.com/jiekou.php",  icon: "🍄", hidden: false },
    { id: "c10", catId: "c3", title: "恩山论坛", url: "https://www.right.com.cn/FORUM/forum.php",  icon: "https://favicon.im/www.right.com.cn", hidden: false }, 
    { id: "c11", catId: "c3", title: "Emoji表情", url: "https://www.iamwawa.cn/emoji.html",  icon: "https://favicon.im/www.iamwawa.cn", hidden: false },
    { id: "c12", catId: "c3", title: "老张的EPG", url: "https://epg.51zmt.top:8001/",  icon: "https://favicon.im/epg.51zmt.top:8001", hidden: false },

    { id: "d01", catId: "c4", title: "代理订阅", url: "https://sub.880824.xyz/880824",  icon: "🌍", hidden: false },
    { id: "d02", catId: "c4", title: "小草", url: "https://t66y.com/thread0806.php?fid=7",  icon: "https://favicon.im/t66y.com", hidden: false },
    { id: "d03", catId: "c4", title: "小黄", url: "https://cn.pornhub.com/language/chinese",  icon: "https://favicon.im/pornhub.com", hidden: false },
    { id: "d04", catId: "c4", title: "小红", url: "https://www.91porn.com/index.php",  icon: "https://icons.duckduckgo.com/ip3/www.91porn.com.ico", hidden: false },
    { id: "d05", catId: "c4", title: "xhamster", url: "https://zh.xhamster.com/",  icon: "https://favicon.im/xhamster.com", hidden: false },
    { id: "d06", catId: "c4", title: "CF优选IP", url: "https://cf.090227.xyz/",  icon: "https://favicon.im/cf.090227.xyz", hidden: false },
    { id: "d07", catId: "c4", title: "优选反代 IP", url: "https://ipdb.api.030101.xyz/",  icon: "🐱", hidden: false },
    { id: "d08", catId: "c4", title: "ClashParty", url: "https://clashparty.org/",  icon: "https://favicon.im/clashparty.org", hidden: false }, 
    { id: "d09", catId: "c4", title: "V2rayN", url: "https://v2rayn.2dust.link/",  icon: "https://favicon.im/v2rayn.info", hidden: false }, 
    { id: "d10", catId: "c4", title: "ClashBox", url: "https://github.com/xiaobaigroup/ClashBox",  icon: "https://clash.top/wp-content/uploads/2024/01/Clash.png", hidden: false },
    { id: "d11", catId: "c4", title: "v2rayse", url: "https://v2rayse.com/",  icon: "https://favicon.im/v2rayse.com", hidden: false }, 
    { id: "d12", catId: "c4", title: "谷歌主机", url: "http://35.212.242.35:30621/70e1830547",  icon: "https://favicon.im/https://cloud.google.com/", hidden: false },
    { id: "d13", catId: "c4", title: "Twitter", url: "https://x.com/home",  icon: "https://favicon.im/x.com", hidden: false },
    { id: "d14", catId: "c4", title: "DNS泄露", url: "https://ipleak.net/",  icon: "https://favicon.im/ipleak.net", hidden: false },
    { id: "d15", catId: "c4", title: "悟空百科", url: "https://didiboy0702.gitbook.io/wukongdaily/",  icon: "https://icons.duckduckgo.com/ip3/didiboy0702.gitbook.io.ico", hidden: false },
    { id: "d16", catId: "c4", title: "小鱼儿系统", url: "https://www.yrxitong.com/",  icon: "https://icons.duckduckgo.com/ip3/www.yrxitong.com.ico", hidden: false },
    { id: "d17", catId: "c4", title: "肥羊订阅转换", url: "https://suburl.v1.mk/",  icon: "https://icons.duckduckgo.com/ip3/suburl.v1.mk.ico", hidden: false },

    { id: "e01", catId: "c5", title: "野火论坛", url: "https://www.proewildfire.cn/index.php",  icon: "https://favicon.im/www.proewildfire.cn", hidden: false },
    { id: "e02", catId: "c5", title: "Solidworker论坛", url: "https://www.swbbsc.com/",  icon: "https://favicon.im/www.swbbsc.com", hidden: false },
    { id: "e03", catId: "c5", title: "Solidworker台湾论坛", url: "https://www.solidworks.org.tw/forum.php",  icon: "https://icons.duckduckgo.com/ip3/www.solidworks.org.tw.ico", hidden: false },
    { id: "e04", catId: "c5", title: "我要自学网", url: "https://www.51zxw.net/list.aspx?cid=37",  icon: "https://icons.duckduckgo.com/ip3/www.51zxw.net.ico", hidden: false },
    { id: "e05", catId: "c5", title: "3D下载", url: "https://camst.partcommunity.com/3d-cad-models/",  icon: "https://icons.duckduckgo.com/ip3/camst.partcommunity.com.ico", hidden: false },
    { id: "e06", catId: "c5", title: "3D零件库", url: "https://www.traceparts.com/zh",  icon: "https://icons.duckduckgo.com/ip3/www.traceparts.com.ico", hidden: false },
    { id: "e07", catId: "c5", title: "三维CAD库", url: "https://www.3dfindit.cn/zh-CN/cad-bim-library/manufacturer?path=%2F&portal=china",  icon: "https://icons.duckduckgo.com/ip3/www.3dfindit.cn.ico", hidden: false },
    { id: "e08", catId: "c5", title: "专利业务办理", url: "https://cponline.cnipa.gov.cn/",  icon: "https://icons.duckduckgo.com/ip3/cponline.cnipa.gov.cn.ico", hidden: false },
    { id: "e09", catId: "c5", title: "沐风网", url: "https://www.mfcad.com/",  icon: "https://icons.duckduckgo.com/ip3/www.mfcad.com.ico", hidden: false },
    { id: "e10", catId: "c5", title: "地图知识", url: "https://ageeye.app.ditushu.com/",  icon: "https://icons.duckduckgo.com/ip3/ageeye.app.ditushu.com.ico", hidden: false },
    { id: "e11", catId: "c5", title: "魔方小站", url: "http://www.rubik.com.cn/",  icon: "https://icons.duckduckgo.com/ip3/www.rubik.com.cn.ico", hidden: false },
    { id: "e12", catId: "c5", title: "机器人在线", url: "https://www.imrobotic.com/",  icon: "https://icons.duckduckgo.com/ip3/www.imrobotic.com.ico", hidden: false },
    { id: "e13", catId: "c5", title: "元素周期表", url: "https://elements.wlonk.com/ElementsTable.html",  icon: "https://icons.duckduckgo.com/ip3/elements.wlonk.com.ico", hidden: false },

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


