import { fetchOthersConfig } from "./sysConfig";
import { checkDatabaseConfig as checkDbConfig } from './databaseAdapter.js';

let disableTelemetry = false;

export async function errorHandling(context) {
  // 读取KV中的设置
  const othersConfig = await fetchOthersConfig(context.env);
  disableTelemetry = !othersConfig.telemetry.enabled;

  // EdgeOne 平台暂不支持 Sentry 插件，直接继续
  return context.next();
}

export async function telemetryData(context) {
  // 读取KV中的设置
  const othersConfig = await fetchOthersConfig(context.env);
  disableTelemetry = !othersConfig.telemetry.enabled;
  
  if (!disableTelemetry) {
    try {
      const parsedHeaders = {};
      context.request.headers.forEach((value, key) => {
        parsedHeaders[key] = value;
      });
      
      // EdgeOne 平台没有 request.cf 对象，使用 headers 中的信息代替
      const platformData = {
        country: context.request.headers.get('cf-ipcountry') || 
                  context.request.headers.get('x-edgeone-country') || 'Unknown',
        city: context.request.headers.get('x-edgeone-city') || 'Unknown',
        asn: context.request.headers.get('x-edgeone-asn') || 'Unknown',
      };
      
      const data = {
        headers: parsedHeaders,
        platform: platformData,
        url: context.request.url,
        method: context.request.method,
        redirect: context.request.redirect,
      };
      
      // 记录请求信息到控制台
      const urlPath = new URL(context.request.url).pathname;
      console.log(`[Telemetry] ${context.request.method} ${urlPath}`, data);
      
      return await context.next();
    } catch (e) {
      console.log(e);
    }
  }

  return context.next();
}

export async function traceData(context, span, op, name) {
  // EdgeOne 平台暂不支持 tracing，保留函数签名以兼容
  console.log(`[Trace] ${op}: ${name}`);
}

// 检查数据库是否配置
export async function checkDatabaseConfig(context) {
  var env = context.env;

  var dbConfig = checkDbConfig(env);

  if (!dbConfig.configured) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "数据库未配置 / Database not configured",
        message: "请配置 KV 存储 (env.img_url) 或 D1 数据库 (env.img_d1)。 / Please configure KV storage (env.img_url) or D1 database (env.img_d1)."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  // 继续执行
  return await context.next();
}