/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import axios from 'axios';

const fetchDataFromLocalSQL = async (ctx, next, sql) => {
  if (!sql) {
    ctx.throw(400, 'sql is required');
  }

  /**
   * // 使用 Sequelize 查询
   * // Sequelize group/aggregate
   * const repo = ctx.db.getRepository(tableId);
   * const rows = await repo.model.findAll({
   *   attributes: [
   *     fieldId, [ctx.db.sequelize.fn('COUNT', ctx.db.sequelize.col(fieldId)), 'count']
   *   ],
   *   group: [fieldId]
   * });
   * // 获取结果
   * const field = row[0][fieldId];
   * const count = row[0].count;
   */

  // 使用原生 SQL 查询
  const rows = await ctx.db.sequelize.query(sql, {
    type: ctx.db.sequelize.QueryTypes.SELECT,
  });
  ctx.body = { data: rows };

  await next();
};

const fetchDataFromRemoteAPI = async (ctx, next, data) => {
  try {
    let { url, headers } = data || {};
    const { method = 'get', query = {}, body = {} } = data || {};
    if (!url) {
      ctx.throw(400, 'url is required for api type');
    }
    // 解析 basic auth
    let authHeader = '';
    try {
      const urlObj = new URL(url);
      if (urlObj.username && urlObj.password) {
        const basic = Buffer.from(`${urlObj.username}:${urlObj.password}`).toString('base64');
        authHeader = `Basic ${basic}`;
        urlObj.username = '';
        urlObj.password = '';
        url = urlObj.toString();
      }
    } catch (e) {
      // URL 解析失败，忽略 basic auth
    }
    if (authHeader) {
      headers = { ...headers, Authorization: authHeader };
    }
    const axiosConfig = {
      url,
      method: method.toLowerCase(),
      headers,
      params: query,
      data: body,
      validateStatus: () => true, // 让我们自己处理错误码
    };
    let response;
    try {
      response = await axios(axiosConfig);
    } catch (err) {
      ctx.throw(500, `Remote API request error: ${err.message}`);
      return;
    }
    if (!response || typeof response.status !== 'number') {
      ctx.throw(500, 'Remote API response is invalid');
      return;
    }
    if (response.status < 200 || response.status >= 300) {
      ctx.throw(response.status, `Remote API request failed: ${response.statusText}`);
      return;
    }
    ctx.body = { data: response.data?.data ?? response.data };
    await next();
  } catch (err) {
    ctx.throw(500, `fetchDataFromRemoteAPI error: ${err.message}`);
  }
};

const fetchData = async (ctx, next) => {
  if (!ctx || !ctx.action || !ctx.action.params) {
    ctx.throw(400, 'params is required');
  }
  console.log('params:', ctx.action.params);
  const { data } = ctx.action.params;
  if (!data) {
    ctx.throw(400, 'data is required');
  }
  if (data.type === 'sql') {
    await fetchDataFromLocalSQL(ctx, next, data.data);
  } else if (data.type === 'api') {
    await fetchDataFromRemoteAPI(ctx, next, data.data);
  } else {
    ctx.throw(400, 'type must be sql or api');
  }
};

export class TableDynamicColumnsPlugin extends Plugin {
  async load() {
    this.app.resourceManager.registerActionHandlers({
      'collections:table_dynamic_columns-fetch_header': async (ctx, next) => {
        await fetchData(ctx, next);
      },
      'collections:table_dynamic_columns-fetch_rows': async (ctx, next) => {
        await fetchData(ctx, next);
      },
    });
  }
}

export default TableDynamicColumnsPlugin;
