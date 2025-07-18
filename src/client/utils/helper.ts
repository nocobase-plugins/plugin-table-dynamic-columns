/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { NAMESPACE } from '../constants';
import { findAllChildrenElementWithClass } from './dom';

export const removeDynamicColumns = (table: HTMLTableElement) => {
  if (!table) {
    console.log(`[${NAMESPACE}] - table not found`);
    return;
  }
  // thead
  const thead = table.querySelector('thead');
  if (thead) {
    const headerRow = thead.rows[0];
    if (headerRow) {
      Array.from(headerRow.cells).forEach((th) => {
        if (th.dataset.dynamicColumn === '1') headerRow.removeChild(th);
      });
    }
  }
  // colgroup
  const colgroup = table.querySelector('colgroup');
  if (colgroup) {
    Array.from(colgroup.children).forEach((col) => {
      if ((col as HTMLElement).dataset && (col as HTMLElement).dataset.dynamicColumn === '1') colgroup.removeChild(col);
    });
  }
  removeDynamicColumnRows(table);
};

export const removeDynamicColumnRows = (table: HTMLTableElement) => {
  // tbody
  const tbody = table.querySelector('tbody');
  if (tbody) {
    Array.from(tbody.rows).forEach((row) => {
      Array.from(row.cells).forEach((td) => {
        if (td.dataset.dynamicColumn === '1') row.removeChild(td);
      });
    });
  }
};

export const addDynamicColumnHeaders = (table: HTMLTableElement, colNumber: number, dynamicColumns: any[]) => {
  if (!table) {
    console.log(`[${NAMESPACE}] - table not found`);
    return;
  }
  // 保证只能有一组动态列，先移除旧的
  removeDynamicColumns(table);
  const thead = table.querySelector('thead');
  if (!thead) {
    console.log(`[${NAMESPACE}] - thead not found`);
    return;
  }
  const headerRow = thead.rows[0];
  if (!headerRow) {
    console.log(`[${NAMESPACE}] - headerRow not found`);
    return;
  }
  const ths = findAllChildrenElementWithClass({
    container: thead,
    includeClass: ['ant-table-cell'],
    excludeClass: ['ant-table-cell-fix-right'],
    nodeType: 'th',
  }) as HTMLElement[];
  const configTh = ths ? ths[colNumber < 0 ? Math.max(0, ths.length + colNumber) : colNumber] : null;
  if (!configTh) {
    console.log(`[${NAMESPACE}] - configTh not found`);
    return;
  }
  dynamicColumns?.forEach((column: any) => {
    const th = document.createElement('th');
    th.className = 'ant-table-cell';
    th.scope = 'col';
    th.dataset.dynamicColumn = '1';
    th.innerHTML = `<span>${column.title}</span>`;
    headerRow.insertBefore(th, configTh.nextSibling);
  });
  // colgroup
  const colgroup = table.querySelector('colgroup');
  if (colgroup) {
    const cols = findAllChildrenElementWithClass({
      container: colgroup,
      nodeType: 'col',
    }) as HTMLElement[];
    const configCol = cols ? cols[colNumber < 0 ? Math.max(0, cols.length + colNumber) : colNumber] : null;
    dynamicColumns?.forEach(() => {
      const col = document.createElement('col');
      col.style.width = '100px';
      col.dataset.dynamicColumn = '1';
      colgroup.insertBefore(col, configCol.nextSibling);
    });
  }
};

export const updateDynamicColumnRows = (
  table: HTMLTableElement,
  colNumber: number,
  dynamicColumns: any[],
  getRowData: (row: HTMLTableRowElement) => any,
  generateDynamicColumnData: (rowData: any, columnId: string) => string,
) => {
  if (!table) {
    console.log(`[${NAMESPACE}] - table not found`);
    return;
  }
  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.log(`[${NAMESPACE}] - tbody not found`);
    return;
  }
  removeDynamicColumnRows(table);
  const rows = Array.from(tbody.rows);
  rows.forEach((row) => {
    const tds = findAllChildrenElementWithClass({
      container: row,
      excludeClass: ['ant-table-cell-fix-right'],
      nodeType: 'td',
    }) as HTMLElement[];
    const configTd = tds ? tds[colNumber < 0 ? Math.max(0, tds.length + colNumber) : colNumber] : null;
    if (!configTd) return;
    // 移除旧的动态列
    tds.forEach((td) => {
      if (td.dataset.dynamicColumn === '1') {
        row.removeChild(td);
      }
    });
    const rowData = getRowData(row as HTMLTableRowElement);
    if (!rowData) return;
    dynamicColumns?.forEach((column: any) => {
      const td = document.createElement('td');
      td.className = 'ant-table-cell';
      td.dataset.dynamicColumn = '1';
      td.textContent = generateDynamicColumnData(rowData, column.id);
      row.insertBefore(td, configTd.nextSibling);
    });
  });
};
