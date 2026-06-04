// 风神看板数据类型定义
export interface AeolusMetric {
  id: string;
  name: string;
  value: string | number;
  delta?: string | number;
  updatedAt?: string;
  detailUrl?: string;
}

export type AeolusDashboardType = "today" | "week" | "realtime";

export interface AeolusDashboardConfig {
  type: AeolusDashboardType;
  name: string;
  dashboardId: string;
  appId: string;
  sheetId: string;
  snapshotId?: string;
  url: string;
}

// 三个风神看板配置
// 从用户提供的链接中提取的 ID 信息：
// 近一日: https://data.bytedance.net/aeolus/pages/dashboard/1510451?appId=1128&sheetId=2112164&snapshotId=1188208
// 近一周: https://data.bytedance.net/aeolus/pages/dashboard/1627430?appId=1128&sheetId=2320850
// 实时:   https://data.bytedance.net/aeolus/pages/dashboard/1557333?appId=1002633&isDefault=1&sheetId=2196108&snapshotId=1188209
export const DASHBOARD_CONFIGS: Record<AeolusDashboardType, AeolusDashboardConfig> = {
  today: {
    type: "today",
    name: "近一日数据",
    dashboardId: "1510451",
    appId: "1128",
    sheetId: "2112164",
    snapshotId: "1188208",
    url: "https://data.bytedance.net/aeolus/pages/dashboard/1510451?appId=1128&sheetId=2112164&snapshotId=1188208",
  },
  week: {
    type: "week",
    name: "近一周数据",
    dashboardId: "1627430",
    appId: "1128",
    sheetId: "2320850",
    url: "https://data.bytedance.net/aeolus/pages/dashboard/1627430?appId=1128&sheetId=2320850",
  },
  realtime: {
    type: "realtime",
    name: "实时数据",
    dashboardId: "1557333",
    appId: "1002633",
    sheetId: "2196108",
    snapshotId: "1188209",
    url: "https://data.bytedance.net/aeolus/pages/dashboard/1557333?appId=1002633&isDefault=1&sheetId=2196108&snapshotId=1188209",
  },
};

// ============================================================
// 核心函数：调用风神 API 获取数据
// 方式：通过 Next.js 的 rewrites 代理同源访问
// 浏览器自动携带 data.bytedance.net 登录后的 cookie
// ============================================================

// 尝试多种可能的风神 API 路径
const AEOLUS_API_CANDIDATES = [
  // 可能的 API 路径 1: 通过 dashboardId 获取数据
  (config: AeolusDashboardConfig) =>
    `/aeolus-api/aeolus/dashboard/${config.dashboardId}/data?appId=${config.appId}&sheetId=${config.sheetId}${config.snapshotId ? "&snapshotId=" + config.snapshotId : ""}`,
  // 可能的 API 路径 2: 通过 sheetId 获取数据
  (config: AeolusDashboardConfig) =>
    `/aeolus-api/aeolus/sheet/${config.sheetId}/data?appId=${config.appId}&dashboardId=${config.dashboardId}${config.snapshotId ? "&snapshotId=" + config.snapshotId : ""}`,
  // 可能的 API 路径 3: 快照数据接口
  (config: AeolusDashboardConfig) =>
    config.snapshotId
      ? `/aeolus-api/aeolus/snapshot/${config.snapshotId}/data?appId=${config.appId}`
      : null,
  // 可能的 API 路径 4: 开放数据接口
  (config: AeolusDashboardConfig) =>
    `/aeolus-api/aeolus/open/dashboard/${config.dashboardId}?appId=${config.appId}&sheetId=${config.sheetId}`,
  // 可能的 API 路径 5: 带 api 前缀
  (config: AeolusDashboardConfig) =>
    `/aeolus-api/api/aeolus/dashboard/${config.dashboardId}?appId=${config.appId}&sheetId=${config.sheetId}`,
];

// 将风神返回的原始数据转换为我们需要的格式
function transformAeolusData(rawData: any, config: AeolusDashboardConfig): AeolusMetric[] {
  const metrics: AeolusMetric[] = [];

  // 尝试多种常见的返回数据格式
  // 格式 1: { success: true, data: { metrics: [...] } }
  if (rawData && rawData.success && rawData.data && rawData.data.metrics) {
    rawData.data.metrics.forEach((m: any, index: number) => {
      metrics.push({
        id: `${config.sheetId}-${index}`,
        name: m.name || m.label || m.title || `指标 ${index + 1}`,
        value: m.value ?? m.num ?? m.count ?? m.data ?? 0,
        delta: m.delta ?? m.diff ?? m.trend ?? m.change ?? undefined,
        updatedAt: m.updatedAt || m.time || new Date().toISOString(),
        detailUrl: config.url,
      });
    });
    return metrics;
  }

  // 格式 2: { code: 0, data: { cells: [...] } }
  if (rawData && rawData.data && rawData.data.cells) {
    rawData.data.cells.forEach((cell: any, index: number) => {
      metrics.push({
        id: `${config.sheetId}-cell-${index}`,
        name: cell.name || cell.label || cell.title || cell.metricName || `指标 ${index + 1}`,
        value: cell.value ?? cell.num ?? cell.data ?? cell.val ?? 0,
        delta: cell.delta ?? cell.diff ?? cell.change ?? cell.trend ?? undefined,
        updatedAt: cell.updatedAt || cell.time || new Date().toISOString(),
        detailUrl: config.url,
      });
    });
    return metrics;
  }

  // 格式 3: { code: 0, data: [...] } 直接是指标数组
  if (rawData && rawData.data && Array.isArray(rawData.data)) {
    rawData.data.forEach((item: any, index: number) => {
      metrics.push({
        id: `${config.sheetId}-item-${index}`,
        name: item.name || item.label || item.title || `指标 ${index + 1}`,
        value: item.value ?? item.num ?? item.data ?? 0,
        delta: item.delta ?? item.diff ?? undefined,
        updatedAt: item.updatedAt || item.time || new Date().toISOString(),
        detailUrl: config.url,
      });
    });
    return metrics;
  }

  // 格式 4: 直接是数组
  if (rawData && Array.isArray(rawData)) {
    rawData.forEach((item: any, index: number) => {
      metrics.push({
        id: `${config.sheetId}-arr-${index}`,
        name: item.name || item.label || item.title || `指标 ${index + 1}`,
        value: item.value ?? item.num ?? 0,
        delta: item.delta ?? item.diff ?? undefined,
        updatedAt: item.updatedAt || new Date().toISOString(),
        detailUrl: config.url,
      });
    });
    return metrics;
  }

  // 格式 5: { result: [...] } 或 { data: { result: [...] } }
  const result = rawData?.result || rawData?.data?.result;
  if (result && Array.isArray(result)) {
    result.forEach((item: any, index: number) => {
      metrics.push({
        id: `${config.sheetId}-result-${index}`,
        name: item.name || item.label || item.metric || `指标 ${index + 1}`,
        value: item.value ?? item.num ?? item.count ?? 0,
        delta: item.delta ?? item.diff ?? undefined,
        updatedAt: item.updatedAt || item.time || new Date().toISOString(),
        detailUrl: config.url,
      });
    });
    return metrics;
  }

  // 如果都不匹配，记录原始数据用于调试
  console.log("无法解析的风神返回格式，原始数据:", rawData);
  return [];
}

// 主要数据获取函数
export async function fetchAeolusData(type: AeolusDashboardType): Promise<AeolusMetric[]> {
  const config = DASHBOARD_CONFIGS[type];
  if (!config) {
    throw new Error(`无效的看板类型: ${type}`);
  }

  // 逐个尝试不同的 API 路径
  let lastError: Error | null = null;

  for (const getUrl of AEOLUS_API_CANDIDATES) {
    const apiUrl = getUrl(config);
    if (!apiUrl) continue;

    console.log(`[风神API] 尝试请求: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        // 同源请求，自动携带 cookie（通过 rewrites 代理）
        // credentials: "include" 对于同源请求默认就是开启的
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log(`[风神API] 响应状态: ${response.status} ${response.statusText}`);

      if (response.ok) {
        try {
          const rawData = await response.json();
          const metrics = transformAeolusData(rawData, config);

          if (metrics.length > 0) {
            console.log(`[风神API] 成功获取 ${metrics.length} 个指标，使用路径: ${apiUrl}`);
            return metrics;
          } else {
            console.log(`[风神API] 路径 ${apiUrl} 返回数据但无法解析，尝试下一个路径`);
            lastError = new Error(
              "API 返回的数据格式无法解析，原始数据:\n" + JSON.stringify(rawData, null, 2).slice(0, 500)
            );
          }
        } catch (parseError) {
          console.log(`[风神API] 路径 ${apiUrl} 响应不是 JSON，尝试下一个路径`);
          lastError = parseError as Error;
        }
      } else {
        // 404 = 接口不存在，继续尝试下一个
        // 401/403 = 未登录或没有权限，提示用户先在风神登录
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "风神 API 返回 401/403，说明未登录或没有权限。\n\n请先在新标签页打开：\nhttps://data.bytedance.net/aeolus/pages/dashboard/" +
              config.dashboardId +
              "\n\n确保你在风神平台已登录并有权限访问该看板，然后刷新本页面。"
          );
        }
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.log(`[风神API] 请求失败: ${err.message}`);
      if (err.message.includes("风神 API 返回 401") || err.message.includes("风神 API 返回 403")) {
        throw err; // 401/403 直接抛出，不再尝试
      }
      lastError = err;
    }
  }

  // 所有路径都失败了
  throw new Error(
    "无法获取风神数据。\n\n可能的原因：\n" +
      "1. 你当前不在公司网络（请连接到字节内网/VPN）\n" +
      "2. 还没有在风神平台登录（请先在浏览器访问 https://data.bytedance.net 登录）\n" +
      "3. 风神 API 接口路径可能变化（需要用 F12 开发者工具查看真实接口）\n\n" +
      "最后一次错误信息: " +
      (lastError?.message || "未知错误")
  );
}
