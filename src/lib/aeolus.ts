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

// API 响应类型
interface ApiResponse {
  success: boolean;
  data?: AeolusMetric[];
  message?: string;
  hint?: string;
}

// 获取风神数据 - 通过服务端 API 路由调用
export async function fetchAeolusData(type: AeolusDashboardType): Promise<AeolusMetric[]> {
  try {
    const res = await fetch(`/api/aeolus?type=${type}`, {
      method: "GET",
      // 不缓存，每次都获取最新数据
      cache: "no-store",
    });

    if (!res.ok) {
      let errorMsg = `获取风神数据失败 (${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData.message) {
          errorMsg += `: ${errorData.message}`;
        }
        if (errorData.hint) {
          errorMsg += `\n提示: ${errorData.hint}`;
        }
      } catch {
        // 如果无法解析 JSON，使用状态文本
        errorMsg += `: ${res.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data: ApiResponse = await res.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "风神 API 返回数据为空");
    }

    return data.data;
  } catch (error) {
    console.error("fetchAeolusData 失败:", error);
    throw error;
  }
}
