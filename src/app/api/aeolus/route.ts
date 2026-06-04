import { NextResponse } from "next/server";
import { DASHBOARD_CONFIGS, type AeolusDashboardType, type AeolusMetric } from "@/lib/aeolus";

// 定义风神 API 的返回结构
interface AeolusApiResponse {
  success: boolean;
  data?: AeolusMetric[];
  message?: string;
}

// 从风神 API 获取数据的核心函数
async function fetchFromAeolus(
  dashboardId: string,
  appId: string,
  sheetId: string,
  snapshotId?: string
): Promise<AeolusMetric[]> {
  // 注意：这里是风神 API 的调用示例
  // 实际使用时需要根据风神开放平台的文档配置正确的请求方式
  // 常见的风神 API 调用方式：
  //
  // 方式 1: 通过 dashboardId 获取快照数据
  // GET https://data.bytedance.net/aeolus/api/dashboard/{dashboardId}/data
  //
  // 方式 2: 通过 sheetId 获取图表数据
  // GET https://data.bytedance.net/aeolus/api/sheet/{sheetId}/data?appId={appId}
  //
  // 方式 3: 通过 snapshotId 获取历史快照
  // GET https://data.bytedance.net/aeolus/api/snapshot/{snapshotId}/data

  const baseUrl = "https://data.bytedance.net/aeolus/api";

  // 构建 API 地址（根据实际风神 API 文档调整）
  let apiUrl = `${baseUrl}/sheet/${sheetId}/data?appId=${appId}&dashboardId=${dashboardId}`;
  if (snapshotId) {
    apiUrl += `&snapshotId=${snapshotId}`;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 如果需要鉴权，在这里添加 token
        // "Authorization": `Bearer ${process.env.AEOLUS_API_TOKEN || ""}`,
      },
      // 重要：确保不缓存数据
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`风神 API 请求失败: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();

    // 将风神返回的数据格式转换为我们需要的 AeolusMetric 格式
    // 这里需要根据实际返回的数据结构来调整
    return transformAeolusData(rawData, { dashboardId, sheetId, snapshotId });
  } catch (error) {
    console.error("调用风神 API 失败:", error);
    throw error;
  }
}

// 将风神返回的原始数据转换为我们的指标格式
function transformAeolusData(
  rawData: any,
  context: { dashboardId: string; sheetId: string; snapshotId?: string }
): AeolusMetric[] {
  // 注意：这里需要根据风神 API 实际返回的数据格式来调整
  // 常见的返回格式可能是：
  // {
  //   code: 0,
  //   data: {
  //     metrics: [{ name: "xxx", value: 123, delta: "+5%" }, ...]
  //   },
  //   message: "success"
  // }
  // 或者是：
  // {
  //   cells: [{ name: "指标A", value: 100, diff: 5 }, ...]
  // }

  const metrics: AeolusMetric[] = [];

  // 尝试多种常见的数据格式
  if (rawData && rawData.data && rawData.data.metrics) {
    // 格式 1: 标准指标数组
    rawData.data.metrics.forEach((m: any, index: number) => {
      metrics.push({
        id: `${context.sheetId}-${index}`,
        name: m.name || m.label || `指标 ${index + 1}`,
        value: m.value ?? m.num ?? m.count ?? 0,
        delta: m.delta ?? m.diff ?? m.trend ?? undefined,
        updatedAt: m.updatedAt || m.time || new Date().toISOString(),
        detailUrl: `https://data.bytedance.net/aeolus/pages/dashboard/${context.dashboardId}?appId=${context.sheetId}`,
      });
    });
  } else if (rawData && rawData.cells) {
    // 格式 2: 单元格数据
    rawData.cells.forEach((cell: any, index: number) => {
      metrics.push({
        id: `${context.sheetId}-cell-${index}`,
        name: cell.name || cell.title || cell.label || `指标 ${index + 1}`,
        value: cell.value ?? cell.data ?? cell.num ?? 0,
        delta: cell.delta ?? cell.change ?? cell.diff ?? undefined,
        updatedAt: cell.updatedAt || cell.time || new Date().toISOString(),
        detailUrl: `https://data.bytedance.net/aeolus/pages/dashboard/${context.dashboardId}?appId=${context.sheetId}`,
      });
    });
  } else if (rawData && Array.isArray(rawData)) {
    // 格式 3: 直接是数组
    rawData.forEach((item: any, index: number) => {
      metrics.push({
        id: `${context.sheetId}-item-${index}`,
        name: item.name || item.label || item.title || `指标 ${index + 1}`,
        value: item.value ?? item.num ?? 0,
        delta: item.delta ?? item.diff ?? undefined,
        updatedAt: item.updatedAt || new Date().toISOString(),
        detailUrl: `https://data.bytedance.net/aeolus/pages/dashboard/${context.dashboardId}?appId=${context.sheetId}`,
      });
    });
  }

  return metrics;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as AeolusDashboardType;

    if (!type || !DASHBOARD_CONFIGS[type]) {
      return NextResponse.json(
        { success: false, message: `无效的 type 参数: ${type}` },
        { status: 400 }
      );
    }

    const config = DASHBOARD_CONFIGS[type];

    // 调用风神 API
    const metrics = await fetchFromAeolus(
      config.dashboardId,
      config.appId,
      config.sheetId,
      config.snapshotId
    );

    // 如果风神 API 返回的数据为空，返回友好的提示
    if (metrics.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "风神 API 返回的数据为空，请检查 API 配置",
      });
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      config: {
        type: config.type,
        name: config.name,
        url: config.url,
      },
    });
  } catch (error: any) {
    console.error("风神 API 路由错误:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "获取风神数据失败",
        hint: "请检查风神 API 配置是否正确，是否需要 token 认证",
      },
      { status: 500 }
    );
  }
}
