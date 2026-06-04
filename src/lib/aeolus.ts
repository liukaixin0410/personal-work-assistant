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

// Mock 数据 - 在没有真实 API 之前使用
const mockData: Record<AeolusDashboardType, AeolusMetric[]> = {
  today: [
    { id: "1", name: "今日需求数", value: 8, delta: "+3", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.today.url },
    { id: "2", name: "今日完成任务", value: 12, delta: "+5", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.today.url },
    { id: "3", name: "今日进行中", value: 6, delta: "-1", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.today.url },
    { id: "4", name: "今日风险项", value: 2, delta: "0", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.today.url },
  ],
  week: [
    { id: "1", name: "本周需求数", value: 25, delta: "+12%", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.week.url },
    { id: "2", name: "本周完成任务", value: 42, delta: "+18%", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.week.url },
    { id: "3", name: "本周进行中", value: 15, delta: "+3", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.week.url },
    { id: "4", name: "本周风险项", value: 5, delta: "-2", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.week.url },
  ],
  realtime: [
    { id: "1", name: "实时活跃用户", value: "12,453", delta: "+2.3%", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.realtime.url },
    { id: "2", name: "实时点击量", value: "89,234", delta: "+5.1%", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.realtime.url },
    { id: "3", name: "实时转化率", value: "3.45%", delta: "+0.2%", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.realtime.url },
    { id: "4", name: "实时异常数", value: 2, delta: "-1", updatedAt: new Date().toISOString(), detailUrl: DASHBOARD_CONFIGS.realtime.url },
  ],
};

// 获取风神数据
export async function fetchAeolusData(type: AeolusDashboardType): Promise<AeolusMetric[]> {
  // TODO: 当用户提供真实的 API 接口时，替换这里
  // 真实实现应该调用 Next.js API route，然后 API route 调用风神 API
  // 例如：
  // const res = await fetch(`/api/aeolus?type=${type}`);
  // if (!res.ok) throw new Error("获取风神数据失败");
  // const data = await res.json();
  // return data.metrics;

  // 目前返回模拟数据
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockData[type];
}
