/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useFieldSchema } from '@formily/react';
import { useBlockContext, useDesignable, useAllDataBlocks, useRequest } from '@nocobase/client';
import { message, Popover } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PopoverForm } from '../components/PopoverForm';
import { NAMESPACE } from '../constants';
import {
  findChildrenElementWithClass,
  monitorTableBodyMutationsAndInvokeWhenFound,
  monitorContainerMutationsAndInvokeWhenFound,
  monitorElementVisibilityChange,
} from '../utils/dom';
import { addDynamicColumnHeaders, removeDynamicColumns, updateDynamicColumnRows } from '../utils/helper';
import { useFilterForm } from './useFilterForm';

type BlockType = 'table' | 'filter-form' | 'unknown';

interface BlockTypeConfig {
  getTargetDataBlockUids: (fieldSchema: any) => string[];
}

const blockTypeConfigs: Record<BlockType, BlockTypeConfig> = {
  table: {
    getTargetDataBlockUids: (fieldSchema) => [fieldSchema?.parent?.parent?.['x-uid']],
  },
  'filter-form': {
    getTargetDataBlockUids: (fieldSchema) =>
      (fieldSchema?.parent?.parent?.parent?.['x-filter-targets'] ?? []).map((item: any) => item.uid),
  },
  unknown: {
    getTargetDataBlockUids: () => [],
  },
};

const parseHeaderData = (data: any) => {
  if (data && !Array.isArray(data)) {
    message.error('Dynamic columns header data is not an array');
    return [];
  }
  return data && Array.isArray(data) ? data.slice().reverse().map((item) => ({
    id: String(item.key),
    title: `${item.value}`,
  })) : [];
};

const parseRowData = (data: any) => {
  if (data && !Array.isArray(data)) {
    message.error('Dynamic columns row data is not an array');
    return [];
  }
  return data && Array.isArray(data) ? data.reduce((acc, item) => {
    const { rowKey, colKey, value } = item;
    // 统一处理ID的类型为字符串，避免出现数字类型导致对象属性名不一致
    // 将rowKey和colKey转换为字符串，因为rowKey和colKey可能是数字
    const strRowKey = String(rowKey);
    const strColKey = String(colKey);
    if (!acc[strRowKey]) {
      acc[strRowKey] = {};
    }
    acc[strRowKey][strColKey] = value;
    return acc;
  }, {}) : {};
};

export const useDynamicColumns = () => {
  const { t } = useTranslation(NAMESPACE);
  const domRef = useRef<HTMLElement>(null);
  const fieldSchema = useFieldSchema();
  const blockContext = useBlockContext();
  const { designable } = useDesignable();
  const { getAllDataBlocks } = useAllDataBlocks();

  // 获取关联的过滤表单
  const filterForm = useFilterForm();

  // 所有数据区块
  const [allDataBlocks, setAllDataBlocks] = useState<any[]>([]);

  // 目标数据区块
  const [targetBlock, setTargetBlock] = useState<any>(null);

  // 目标table
  const [targetTable, setTargetTable] = useState<HTMLTableElement | null>(null);

  // 目标table的当前页的行ID列表
  const [tableRowIds, setTableRowIds] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<string[]>([]);

  // 获取动态列配置
  const initialValues = fieldSchema?.['x-component-props']?.dynamicColumnsConfig;
  const defaultShowDynamicColumns = initialValues?.defaultShowDynamicColumns ?? true;
  const customFormSchema = initialValues?.formSchema ?? '';
  const headerFunctionTemplate = initialValues?.headerFunctionTemplate ?? '';
  const rowFunctionTemplate = initialValues?.rowFunctionTemplate ?? '';
  const rowIdColumnIndex = initialValues?.rowIdColumnIndex;
  const renderDelay = initialValues?.renderDelay ?? 500;
  const autoRefresh = initialValues?.autoRefresh ?? 0;
  const hasCustomForm = initialValues?.hasCustomForm ?? false;
  const showActionButton = initialValues?.showActionButton ?? true;
  const [insertAfterColumnIndex, setInsertAfterColumnIndex] = useState(initialValues?.insertAfterColumnIndex ?? -1);

  // 因为退出编辑模式后，表格列尾会自动插入一个空列，所以需要减去1
  useEffect(() => {
    if (designable) {
      setInsertAfterColumnIndex(initialValues?.insertAfterColumnIndex ?? -1);
    } else {
      setInsertAfterColumnIndex((initialValues?.insertAfterColumnIndex ?? -1) - 1);
    }
  }, [designable, initialValues]);

  // 动态列状态
  const [showDynamicColumns, setShowDynamicColumns] = useState(defaultShowDynamicColumns);
  const [customFormMetaData, setCustomFormMetaData] = useState<any[]>([]);
  const [customFormValues, setCustomFormValues] = useState<any>({});

  // 动态列头
  const [dynamicColumnsHeader, setDynamicColumnsHeader] = useState<any[]>([]);
  // 动态列行数据
  const [dynamicColumnsRowData, setDynamicColumnsRowData] = useState<any>({});

  // 是否展开浮窗
  const [popoverOpen, setPopoverOpen] = useState(false);

  // 用于获取动态列头
  const {
    loading: headerLoading,
    data: headerData,
    run: fetchHeader,
  } = useRequest<any>(
    {
      url: `collections:table_dynamic_columns-fetch_header`,
      skipAuth: true,
    },
    { manual: true },
  );

  // 用于获取动态列行数据
  const {
    loading: rowLoading,
    data: rowData,
    run: fetchRow,
  } = useRequest<any>(
    {
      url: `collections:table_dynamic_columns-fetch_rows`,
      skipAuth: true,
    },
    { manual: true },
  );

  /**
   * 初始化时，获取不到数据区块，所以需要定时获取
   */
  const initialInterval = setInterval(() => {
    const allDataBlocks = getAllDataBlocks?.();
    if (allDataBlocks?.length > 0) {
      setAllDataBlocks(allDataBlocks);
    }
    clearInterval(initialInterval);
  }, 100);

  /**
   * 获取目标数据区块的table
   * @param container
   * @returns
   */
  const findTargetTable = (container: HTMLElement): HTMLTableElement | null => {
    return findChildrenElementWithClass({
      container: container,
      excludeClass: ['skeleton-table'],
      nodeType: 'table',
    }) as HTMLTableElement | null;
  };

  /**
   * 添加loading的显隐监听
   * @param spin 目标spin
   * @param isInit 是否是初始化
   */
  const addSpinObserver = (spin: HTMLElement, table: HTMLTableElement) => {
    return monitorElementVisibilityChange(
      spin,
      (isVisible) => {
        console.log(`[${NAMESPACE}] - addSpinObserver - isVisible:`, isVisible);
        if (!isVisible) {
          doTableObserver(table);
        }
      },
    );
  };

  /**
   * 添加table的增删tr监听
   * @param table 目标table
   * @param isInit 是否是初始化
   */
  const addTableObserver = (table: HTMLTableElement, isInit: boolean) => {
    const observer = monitorTableBodyMutationsAndInvokeWhenFound(
      table,
      (table) => {
        doTableObserver(table);
        observer?.disconnect();
      },
      isInit,
    );
    return observer;
  };

  const doTableObserver = (table: HTMLTableElement) => {
    const run = () => {
      const tbody = table.querySelector('tbody');
      if (!tbody) {
        console.log(`[${NAMESPACE}] - addTableObserver - tbody not found`);
        return;
      }
      const rows = Array.from(tbody.rows);
      const newRowIds = [];
      const newRows = [];
      rows.forEach((row) => {
        const rowId = row.cells?.[rowIdColumnIndex]?.textContent?.trim() ?? '';
        if (rowId !== '') {
          newRowIds.push(rowId);

          // 收集行中所有单元格的数据
          const rowData = {};
          for (let i = 0; i < row.cells.length; i++) {
            rowData[i] = row.cells[i]?.textContent?.trim() ?? '';
          }
          newRows.push(rowData);
        }
      });
      setTableRowIds(newRowIds);
      setTableRows(newRows);
    };
    console.log(`[${NAMESPACE}] - doTableObserver - renderDelay:`, renderDelay);
    if (renderDelay > 0) {
      setTimeout(() => {
        run();
      }, renderDelay); // 等待表格加载完成
    } else {
      run();
    }
  };
  /**
   * 关闭浮窗
   */
  const handleClose = () => {
    setPopoverOpen(false);
    setShowDynamicColumns(false);
  };

  /**
   * 应用自定义表单值
   * @param values 自定义表单值
   */
  const handleApply = async (values) => {
    console.log(`[${NAMESPACE}] - handleApply - customFormValues:`, values);
    try {
      setPopoverOpen(false);
      setCustomFormValues(values);
      setShowDynamicColumns(true);
    } catch (e) {
      message.error(e.message);
    }
  };

  // 初始化时，获取目标数据区块
  useEffect(() => {
    if (!designable && !showActionButton && domRef.current) {
      // field.setDisplay('hidden'); // 这个setDisplay会导致action内的逻辑都不会执行
      const parent = domRef.current?.parentElement?.parentElement?.parentElement;
      if (parent) {
        parent.style.display = 'none';
      }
      console.log(`[${NAMESPACE}] - effect(initial) - not designable and not showActionButton, so hide action button.`);
    }
    // 获取所在区块类型
    let blockType: BlockType = 'unknown';
    if (blockContext?.name === 'table') {
      blockType = 'table';
    } else if (blockContext?.name === 'filter-form') {
      blockType = 'filter-form';
    } else {
      const parentInitializer = fieldSchema?.parent?.['x-initializer'];
      if (parentInitializer === 'filterForm:configureActions') {
        blockType = 'filter-form';
      } else if (parentInitializer === 'table:configureActions') {
        blockType = 'table';
      }
    }
    console.log(`[${NAMESPACE}] - effect(initial) - blockType:`, blockType);
    console.log(`[${NAMESPACE}] - effect(initial) - allDataBlocks:`, allDataBlocks);

    // 获取目标数据区块
    const targetDataBlockUids = blockTypeConfigs[blockType].getTargetDataBlockUids(fieldSchema);
    const targetDataBlocks = allDataBlocks?.filter((block) => targetDataBlockUids.includes(block.uid)) ?? [];
    console.log(`[${NAMESPACE}] - effect(initial) - targetDataBlocks:`, targetDataBlocks);

    // 获取目标数据区块的dom
    const targetBlock = targetDataBlocks?.[0];
    const targetBlockDom = targetBlock?.dom;
    setTargetBlock(targetBlock);
    console.log(`[${NAMESPACE}] - effect(initial) - targetBlockDom:`, targetBlockDom);

    // 监听目标数据区块的dom变化，当table出现时，开始主流程
    let autoRefreshInterval = null;
    let loadingObserver = null;
    const observer = monitorContainerMutationsAndInvokeWhenFound(
      targetBlockDom,
      findTargetTable,
      (table: HTMLTableElement) => {
        console.log(`[${NAMESPACE}] - effect(initial) - table found:`, table);
        setTargetTable(table);
        addTableObserver(table, true);
        // 如果配置了自动刷新，则定时刷新
        if (autoRefreshInterval) {
          clearInterval(autoRefreshInterval);
          autoRefreshInterval = null;
        }
        if (autoRefresh > 0) {
          autoRefreshInterval = setInterval(() => {
            doTableObserver(table);
          }, autoRefresh * 1000);
          console.log(`[${NAMESPACE}] - effect(initial) - init autoRefreshInterval:`, autoRefreshInterval);
        }

        loadingObserver = targetBlockDom ? addSpinObserver(targetBlockDom.querySelector('.ant-card-body .ant-spin'), findTargetTable(targetBlockDom)) : null;
        console.log(`[${NAMESPACE}] - effect(initial) - init loadingObserver:`, loadingObserver);
      },
    );
    console.log(`[${NAMESPACE}] - effect(initial) - init observer:`, observer);

    return () => {
      if (initialInterval) {
        clearInterval(initialInterval);
      }
      observer?.disconnect();
      loadingObserver?.disconnect();
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [fieldSchema, blockContext, allDataBlocks, autoRefresh]);

  // 解析自定义表单结构
  useEffect(() => {
    if (hasCustomForm) {
      try {
        const formMetaData = customFormSchema ? JSON.parse(customFormSchema) : [];
        setCustomFormMetaData(formMetaData);
        setCustomFormValues(
          formMetaData.reduce(
            (acc, item) => ({
              ...acc,
              [item.name]: item.defaultValue,
            }),
            {},
          ),
        );
      } catch (e) {
        console.error(`[${NAMESPACE}] - effect(parseCustomFormSchema) - parse customFormSchema error:`, e);
      }
    }
  }, [hasCustomForm, customFormSchema]);

  // 获取动态列头
  useEffect(() => {
    if (!headerFunctionTemplate) {
      console.log(`[${NAMESPACE}] - effect(fetchHeader) - headerFunctionTemplate is empty`);
      return;
    }
    if (!showDynamicColumns) {
      console.log(`[${NAMESPACE}] - effect(fetchHeader) - showDynamicColumns is false`);
      return;
    }
    let data = null;
    try {
      data = eval(headerFunctionTemplate)(customFormValues, filterForm.values);
    } catch (e) {
      // 初始化时，两个form的值都是空，所以不显示错误
      if (Object.keys(customFormValues).length > 0 || Object.keys(filterForm.values).length > 0) {
        message.error(e.message);
      }
      console.error(`[${NAMESPACE}] - effect(fetchHeader) - eval headerFunctionTemplate error:`, e);
    }
    if (data) {
      console.log(`[${NAMESPACE}] - effect(fetchHeader) - fetchHeader data:`, data);
      if (data.type === 'js') {
        const dynamicColumnsHeader = parseHeaderData(data.data);
        setDynamicColumnsHeader(dynamicColumnsHeader);
      } else {
        fetchHeader({ data });
      }
    }
  }, [customFormValues, fetchHeader, headerFunctionTemplate, showDynamicColumns]);

  // 处理动态列头数据
  useEffect(() => {
    if (!headerLoading && headerData?.data?.data && showDynamicColumns) {
      // 统一处理ID的类型为字符串，避免出现数字类型导致对象属性名不一致
      // 将key转换为字符串，因为key可能是数字
      const dynamicColumnsHeader = parseHeaderData(headerData.data.data);
      console.log(`[${NAMESPACE}] - effect(setDynamicColumnsHeader) - dynamicColumnsHeader:`, dynamicColumnsHeader);
      setDynamicColumnsHeader(dynamicColumnsHeader);
    }
  }, [headerLoading, headerData, showDynamicColumns]);

  // 获取动态列行数据
  useEffect(() => {
    if (!rowFunctionTemplate) {
      console.log(`[${NAMESPACE}] - effect(fetchRow) - rowFunctionTemplate is empty`);
      return;
    }
    if (!showDynamicColumns) {
      console.log(`[${NAMESPACE}] - effect(fetchRow) - showDynamicColumns is false`);
      return;
    }
    if (tableRowIds.length > 0) {
      let data = null;
      try {
        data = eval(rowFunctionTemplate)(customFormValues, filterForm.values, tableRowIds, tableRows);
      } catch (e) {
        // 初始化时，两个form的值都是空，所以不显示错误
        if (Object.keys(customFormValues).length > 0 || Object.keys(filterForm.values).length > 0) {
          message.error(e.message);
        }
        console.error(`[${NAMESPACE}] - effect(fetchRow) - eval rowFunctionTemplate error:`, e);
      }
      if (data) {
        console.log(`[${NAMESPACE}] - effect(fetchRow) - fetchRow data:`, data);
        if (data.type === 'js') {
          const dynamicColumnsRowData = parseRowData(data.data);
          setDynamicColumnsRowData(dynamicColumnsRowData);
        } else {
          fetchRow({ data });
        }
      }
    }
  }, [tableRowIds, tableRows, fetchRow, customFormValues, rowFunctionTemplate, showDynamicColumns]);

  // 处理动态列行数据
  useEffect(() => {
    if (!rowLoading && rowData?.data?.data && showDynamicColumns) {
      const dynamicColumnsRowData = parseRowData(rowData.data.data);
      console.log(`[${NAMESPACE}] - effect(setDynamicColumnsRowData) - dynamicColumnsRowData:`, dynamicColumnsRowData);
      setDynamicColumnsRowData(dynamicColumnsRowData);
    }
  }, [rowLoading, rowData, showDynamicColumns]);

  // 监听targetTable的变化，当targetTable变化时，更新动态列头
  useEffect(() => {
    if (targetTable && showDynamicColumns) {
      console.log(`[${NAMESPACE}] - effect(addDynamicColumnHeaders) - targetTable changed`);
      addDynamicColumnHeaders(targetTable, insertAfterColumnIndex, dynamicColumnsHeader);
      console.log(`[${NAMESPACE}] - effect(addDynamicColumnHeaders) - addDynamicColumnHeaders`);
    }
    if (!showDynamicColumns) {
      removeDynamicColumns(targetTable);
    }
  }, [targetTable, showDynamicColumns, dynamicColumnsHeader]);

  // 监听targetTable的变化，当targetTable变化时，更新动态列行数据
  useEffect(() => {
    if (targetTable && tableRowIds.length > 0 && showDynamicColumns) {
      console.log(
        `[${NAMESPACE}] - effect(updateDynamicColumnRows) - targetTable changed, tableRowIds: ${tableRowIds}, dynamicColumnsHeader: ${JSON.stringify(
          dynamicColumnsHeader,
        )}, dynamicColumnsRowData: ${JSON.stringify(dynamicColumnsRowData)}`,
      );
      updateDynamicColumnRows(
        targetTable,
        insertAfterColumnIndex,
        dynamicColumnsHeader,
        (row: HTMLTableRowElement) => {
          // ID有值，则生成动态列数据，否则不生成
          const rowId = row.cells[rowIdColumnIndex]?.textContent?.trim() ?? '';
          return rowId !== '' ? dynamicColumnsRowData?.[rowId] ?? {} : null;
        },
        (rowData: any, columnId: string) => {
          return rowData?.[columnId] ?? '';
        },
      );
      console.log(`[${NAMESPACE}] - effect(updateDynamicColumnRows) - updateDynamicColumnRows`);
    }
    if (!showDynamicColumns) {
      removeDynamicColumns(targetTable);
    } else {
      // 行数据更新完成后再次监听表格
      addTableObserver(targetTable, false);
    }
  }, [targetTable, tableRowIds, showDynamicColumns, dynamicColumnsHeader, dynamicColumnsRowData]);

  const [component, setComponent] = useState<React.ReactNode>(null);

  useEffect(() => {
    setComponent(
      popoverOpen ? (
        <Popover
          open={popoverOpen}
          destroyTooltipOnHide
          content={
            <PopoverForm
              formMetaData={customFormMetaData}
              values={customFormValues}
              onApply={handleApply}
              onClose={handleClose}
              t={t}
            />
          }
          trigger="click"
          placement="bottomLeft"
          ref={(popoverRef) => {
            console.log(`[${NAMESPACE}] - ref - popoverRef:`, popoverRef);
            if (popoverRef) {
              (popoverRef.popupElement.querySelector('.ant-popover-inner') as HTMLElement).onclick = function(e) {
                if (e.target === e.currentTarget) {
                  // 只有直接点击父容器时才阻止传播
                  e.stopPropagation();
                }
              };
            }
          }}
        >
          <span ref={domRef}>{t('Dynamic Columns')}</span>
        </Popover>
      ) : (
        <span ref={domRef}>{t('Dynamic Columns')}</span>
      ),
    );
  }, [popoverOpen]);

  return {
    showDynamicColumns,
    component,
    onClick: () => {
      if (hasCustomForm) {
        if (popoverOpen) {
          setPopoverOpen(false);
          return;
        }
        if (!customFormMetaData || customFormMetaData.length < 1) {
          message.error(t('Please configure dynamic columns first'));
          return;
        } else {
          setPopoverOpen(true);
        }
      } else {
        // 如果没有配置自定义表单，则按钮逻辑改为：toggle逻辑
        setShowDynamicColumns(!showDynamicColumns);
      }
    },
  };
};
