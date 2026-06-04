import { NextResponse } from "next/server";
import { DASHBOARD_CONFIGS, type AeolusDashboardType, type AeolusMetric } from "@/lib/aeolus";

// ========== 风神 API 调用 ==========
// 服务端路由调用，不受浏览器 CORS 限制
// 需要在公司网络环境运行（localhost 开发时，只要电脑在公司网络即可）

// 尝试多种可能的风神 API 路径
function buildApiUrls(config: { dashboardId: string; appId: string; sheetId: string; snapshotId?: string }) {
  const base = "https://data.bytedance.net";
  const urls: { url: string; description: string }[] = [];

  // 常见风神 API 模式
  urls.push({
    url: `${base}/aeolus/pages/dashboard/${config.dashboardId}/data?appId=${config.appId}&sheetId=${config.sheetId}${config.snapshotId ? "&snapshotId=" + config.snapshotId : ""}`,
    description: "dashboard 数据接口",
  });

  urls.push({
    url: `${base}/aeolus/api/v1/dashboard/${config.dashboardId}?appId=${config.appId}`,
    description: "v1 API dashboard",
  });

  urls.push({
    url: `${base}/aeolus/api/dashboard/${config.dashboardId}/data?appId=${config.appId}&sheetId=${config.sheetId}`,
    description: "API dashboard data",
  });

  urls.push({
    url: `${base}/aeolus/api/sheet/${config.sheetId}/data?appId=${config.appId}&dashboardId=${config.dashboardId}`,
    description: "API sheet data",
  });

  if (config.snapshotId) {
    urls.push({
      url: `${base}/aeolus/api/snapshot/${config.snapshotId}?appId=${config.appId}`,
      description: "snapshot API",
    });
  }

  // 尝试开放 API 接口
  urls.push({
    url: `${base}/api/aeolus/dashboard/${config.dashboardId}?appId=${config.appId}&sheetId=${config.sheetId}`,
    description: "/api 前缀路径",
  });

  urls.push({
    url: `${base}/aeolus/dashboard/${config.dashboardId}/widgets?appId=${config.appId}`,
    description: "dashboard widgets",
  });

  return urls;
}

// 尝试从风神返回的任意 JSON 中提取指标
function extractMetrics(data: any, config: AeolusDashboardConfig): AeolusMetric[] {
  const metrics: AeolusMetric[] = [];

  if (!data) return [];

  // 递归搜索数字、指标类的数据
  const searchForMetrics = (obj: any, path: string = ""): void => {
    if (!obj || typeof obj !== "object") return;

    // 如果是数组，遍历每一项
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => searchForMetrics(item, `${path}[${idx}]`));
      return;
    }

    // 检查是否是指标格式：{name, value} 模式
    const keys = Object.keys(obj);

    // 检测 { name: "...", value: 123, delta?: "+5%" } 这种格式
    if (
      (obj.name || obj.label || obj.title || obj.metricName) &&
      (obj.value !== undefined || obj.num !== undefined || obj.data !== undefined)
    ) {
      metrics.push({
        id: `${config.sheetId}-${metrics.length}`,
        name: obj.name || obj.label || obj.title || obj.metricName || `指标 ${metrics.length + 1}`,
        value: obj.value ?? obj.num ?? obj.data ?? obj.val ?? 0,
        delta: obj.delta ?? obj.diff ?? obj.change ?? obj.trend ?? undefined,
        updatedAt: obj.updatedAt || obj.time || new Date().toISOString(),
        detailUrl: config.url,
      });
      return;
    }

    // 继续递归搜索
    keys.forEach((key) => {
      searchForMetrics(obj[key], `${path}.${key}`);
    });
  };

  searchForMetrics(data);
  return metrics;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "today") as AeolusDashboardType;

  const config = DASHBOARD_CONFIGS[type];
  if (!config) {
    return NextResponse.json({ success: false, message: `无效的 type 参数: ${type}` }, { status: 400 });
  }

  const urls = buildApiUrls(config);
  const attempts: { url: string; description: string; status: string; data?: any; error?: string }[] = [];

  for (const { url, description } of urls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        attempts.push({ url, description, status: `${response.status} ${response.statusText}` });
        continue;
      }

      // 尝试解析 JSON
      let jsonData: any;
      try {
        const text = await response.text();
        jsonData = JSON.parse(text);
      } catch (parseErr) {
        attempts.push({ url, description, status: "不是 JSON 格式", error: String(parseErr) });
        continue;
      }

      // 尝试提取指标
      const metrics = extractMetrics(jsonData, config);
      if (metrics.length > 0) {
        attempts.push({ url, description, status: `成功！提取到 ${metrics.length} 个指标`, data: jsonData });
        return NextResponse.json({
          success: true,
          data: metrics,
          config: { type: config.type, name: config.name, url: config.url },
          _debug: { successfulUrl: url, description, attempts },
        });
      }

      attempts.push({ url, description, status: "200 但未解析到指标", data: jsonData });
    } catch (err: any) {
      attempts.push({ url, description, status: "请求失败", error: err.message });
    }
  }

  // 所有路径都失败了
  return NextResponse.json({
    success: false,
    message: "无法自动找到风神 API。请按下方说明操作：",
    _debug: {
      attempts,
      instruction: [
        "1. 在风神看板页面按 F12 打开开发者工具",
        "2. 切换到 Network（网络）标签",
        "3. 刷新页面，找到返回 JSON 数据的请求",
        "4. 复制那个请求的完整 URL 和返回的 JSON",
        "5. 把信息发给我，我来配置正确的 API 路径",
      ],
    },
  });
}
