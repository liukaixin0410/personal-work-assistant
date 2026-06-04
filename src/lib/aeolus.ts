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

// 主要数据获取函数 - 通过 Next.js 服务端 API 路由调用风神
export async function fetchAeolusData(type: AeolusDashboardType): Promise<AeolusMetric[]> {
  const res = await fetch(`/api/aeolus?type=${type}`, {
    method: "GET",
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    // 构建详细错误信息
    let errorMsg = json.message || "获取数据失败";
    if (json._debug) {
      errorMsg += "\n\n调试信息：";
      if (json._debug.attempts) {
        json._debug.attempts.forEach((a: any, i: number) => {
          errorMsg += `\n  [${i + 1}] ${a.description}: ${a.status}`;
          if (a.error) errorMsg += ` - ${a.error.slice(0, 80)}`;
        });
      }
      if (json._debug.instruction) {
        errorMsg += "\n\n" + json._debug.instruction.join("\n");
      }
    }
    throw new Error(errorMsg);
  }

  return json.data || [];
}
