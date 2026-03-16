import { fetchOthersConfig } from "./sysConfig";

let othersConfig = {};
let cfZoneId = "";
let cfEmail = "";
let cfApiKey = "";

/**
 * 统一的 CDN 缓存清除函数
 * 根据配置自动选择 Cloudflare 或 EdgeOne 缓存清除
 * @param {Object} env - 环境变量
 * @param {string} cdnUrl - 需要清除缓存的 URL
 */
export async function purgeCDNCache(env, cdnUrl) {
    try {
        // 同时尝试清除 Cloudflare 和 EdgeOne 的缓存
        const promises = [];
        promises.push(purgeCFCache(env, cdnUrl));
        promises.push(purgeEdgeOneCache(env, cdnUrl));
        
        // 并行执行，不阻塞主流程
        await Promise.allSettled(promises);
    } catch (error) {
        console.error('Failed to purge CDN cache:', error.message || error);
    }
}

export async function purgeCFCache(env, cdnUrl) {
    try {
        // 读取其他设置
        othersConfig = await fetchOthersConfig(env);
        cfZoneId = othersConfig.cloudflareApiToken?.CF_ZONE_ID;
        cfEmail = othersConfig.cloudflareApiToken?.CF_EMAIL;
        cfApiKey = othersConfig.cloudflareApiToken?.CF_API_KEY;

        // 如果没有配置Cloudflare API，跳过缓存清除
        if (!cfZoneId || !cfEmail || !cfApiKey) {
            return;
        }

        // 清除CDN缓存
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'X-Auth-Email': `${cfEmail}`, 'X-Auth-Key': `${cfApiKey}`},
            body: `{"files":["${ cdnUrl }"]}`
        };
        await fetch(`https://api.cloudflare.com/client/v4/zones/${ cfZoneId }/purge_cache`, options);
    } catch (error) {
        console.error('Failed to purge CF cache:', error.message || error);
    }
}

/**
 * 清除 EdgeOne CDN 缓存
 * @param {Object} env - 环境变量
 * @param {string} cdnUrl - 需要清除缓存的 URL
 */
export async function purgeEdgeOneCache(env, cdnUrl) {
    try {
        // 读取其他设置
        othersConfig = await fetchOthersConfig(env);
        const edgeOneConfig = othersConfig.edgeOneApiToken || {};
        
        const secretId = edgeOneConfig.SECRET_ID || env.EDGEONE_SECRET_ID;
        const secretKey = edgeOneConfig.SECRET_KEY || env.EDGEONE_SECRET_KEY;
        const zoneId = edgeOneConfig.ZONE_ID || env.EDGEONE_ZONE_ID;

        // 如果没有配置 EdgeOne API，跳过缓存清除
        if (!secretId || !secretKey || !zoneId) {
            return;
        }

        // 生成时间戳和签名
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = Math.random().toString(36).substring(2, 15);
        
        // EdgeOne API 签名（简化版，实际应根据 EdgeOne API 规范实现）
        const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${timestamp}/teo/tc3_request, SignedHeaders=content-type;host;x-tc-action;x-tc-timestamp;x-tc-nonce, Signature=${secretKey}`;

        // 清除 CDN 缓存
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization,
                'X-TC-Action': 'PurgePathCache',
                'X-TC-Timestamp': timestamp.toString(),
                'X-TC-Nonce': nonce,
                'X-TC-Version': '2022-09-01',
                'X-TC-Region': 'ap-guangzhou'
            },
            body: JSON.stringify({
                ZoneId: zoneId,
                Type: 'purge_url',
                Urls: [cdnUrl]
            })
        };
        
        await fetch('https://teo.tencentcloudapi.com/', options);
    } catch (error) {
        console.error('Failed to purge EdgeOne cache:', error.message || error);
    }
}

/**
 * 检查 Cache API 是否可用
 * EdgeOne 平台可能不支持 caches.default
 */
function isCacheApiAvailable() {
    return typeof caches !== 'undefined' && caches.default;
}

export async function purgeRandomFileListCache(origin, ...dirs) {
    try {
        // EdgeOne 平台可能不支持 Cache API，检查可用性
        if (!isCacheApiAvailable()) {
            console.log('Cache API not available, skipping randomFileList cache purge');
            return;
        }
        
        const cache = caches.default;
        // cache.delete有bug，通过写入一个max-age=0的response来清除缓存
        const nullResponse = new Response(null, {
            headers: { 'Cache-Control': 'max-age=0' },
        });

        for (const dir of dirs) {
            await cache.put(`${origin}/api/randomFileList?dir=${dir}`, nullResponse);
        }
    } catch (error) {
        console.error('Failed to clear randomFileList cache:', error);
    }
}

export async function purgePublicFileListCache(origin, ...dirs) {
    try {
        // EdgeOne 平台可能不支持 Cache API，检查可用性
        if (!isCacheApiAvailable()) {
            console.log('Cache API not available, skipping publicFileList cache purge');
            return;
        }
        
        const cache = caches.default;
        // cache.delete有bug，通过写入一个max-age=0的response来清除缓存
        const nullResponse = new Response(null, {
            headers: { 'Cache-Control': 'max-age=0' },
        });

        for (const dir of dirs) {
            // 清除递归和非递归两种缓存
            await cache.put(`${origin}/api/publicFileList?dir=${dir}&recursive=false`, nullResponse);
            await cache.put(`${origin}/api/publicFileList?dir=${dir}&recursive=true`, nullResponse);
        }
    } catch (error) {
        console.error('Failed to clear publicFileList cache:', error);
    }
}