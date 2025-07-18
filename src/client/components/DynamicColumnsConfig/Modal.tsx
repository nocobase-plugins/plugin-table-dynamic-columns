/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, CSSProperties, useState } from 'react';
import { Modal, Form, Input, Button, Switch, Typography, InputNumber } from 'antd';
import { NAMESPACE } from '../../constants';

const { TextArea } = Input;

interface DynamicColumnsConfigModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: FormValues) => void;
  initialValues?: FormValues;
  t: (key: string) => string;
  filterForm: any;
}

interface FormValues {
  defaultShowDynamicColumns: boolean;
  rowIdColumnIndex: number;
  insertAfterColumnIndex: number;
  autoRefresh: number;
  renderDelay: number;
  hasCustomForm: boolean;
  formSchema: string;
  headerFunctionTemplate: string;
  rowFunctionTemplate: string;
}
// Modal configuration constants
const MODAL_CONFIG = {
  width: '80vw',
  style: {
    height: '80vh',
    top: '10vh',
  },
  bodyStyle: {
    height: 'calc(80vh - 110px)', // Subtract header and footer height
    overflow: 'auto',
  } as CSSProperties,
};

// Style constants for better performance
const MODAL_CONTAINER_STYLE: CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  margin: '0 4px',
};

const FORM_STYLE: CSSProperties = {
  flex: 1,
};

const TEXTAREA_STYLE: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '12px',
  minHeight: '100px',
  resize: 'vertical',
};

const INFO_BOX_BASE_STYLE: CSSProperties = {
  padding: '16px',
  border: '1px solid #e1e4e8',
  borderRadius: '6px',
  marginTop: '16px',
};

const INFO_BOX_GUIDE_STYLE: CSSProperties = {
  ...INFO_BOX_BASE_STYLE,
  backgroundColor: '#f6f8fa',
  borderLeft: '4px solid #1890ff',
};

const INFO_BOX_WARNING_STYLE: CSSProperties = {
  ...INFO_BOX_BASE_STYLE,
  backgroundColor: '#fff7e6',
  border: '1px solid #ffd591',
  borderLeft: '4px solid #fa8c16',
};

const INFO_TITLE_STYLE: CSSProperties = {
  fontWeight: 'bold',
  marginBottom: '8px',
  fontSize: '14px',
};

// 统一主色、警告色、灰色、背景、圆角、间距
const MAIN_COLOR = '#3056a0';
const SUB_COLOR = '#666';
const BG_COLOR = '#f6f8fa';
const CODE_BG = '#f0f0f0';
const RADIUS = 5;
const BLOCK_MARGIN = '16px';

const INFO_TITLE_GUIDE_STYLE: CSSProperties = {
  ...INFO_TITLE_STYLE,
  color: MAIN_COLOR,
};
const INFO_TITLE_L1_STYLE: CSSProperties = {
  fontWeight: 600,
  fontSize: '15px',
  color: MAIN_COLOR,
  margin: `${BLOCK_MARGIN} 0 8px 0`,
  borderLeft: `3px solid ${MAIN_COLOR}`,
  background: BG_COLOR,
  borderRadius: RADIUS,
  paddingLeft: 9,
  lineHeight: '2',
  display: 'block',
};
const INFO_TITLE_L2_STYLE: CSSProperties = {
  fontWeight: 500,
  fontSize: '13.5px',
  color: SUB_COLOR,
  margin: '10px 0 4px 16px',
  display: 'block',
};
const INFO_CONTENT_STYLE: CSSProperties = {
  color: SUB_COLOR,
  lineHeight: '1.7',
  fontSize: '13px',
  margin: '0 0 0 18px',
  marginBottom: BLOCK_MARGIN,
};
const CODE_STYLE: CSSProperties = {
  backgroundColor: CODE_BG,
  padding: '2px 6px',
  borderRadius: RADIUS,
  fontSize: '12px',
  fontFamily: 'monospace',
  marginRight: 4,
};
const PRE_STYLE: CSSProperties = {
  backgroundColor: CODE_BG,
  padding: '10px',
  borderRadius: RADIUS,
  fontSize: '12px',
  margin: '0 0 16px 0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'monospace',
};
const LIST_STYLE: CSSProperties = {
  marginLeft: '-18px',
};
const FIELD_BLOCK_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: BLOCK_MARGIN,
};

const INFO_TITLE_WARNING_STYLE: CSSProperties = {
  ...INFO_TITLE_STYLE,
  color: '#fa8c16',
};

// 新增：自定义 TextArea 组件，支持自动高度切换
const AutoResizeTextArea: React.FC<React.ComponentProps<typeof TextArea>> = (props) => {
  const [height, setHeight] = useState(100);
  return (
    <TextArea
      {...props}
      style={{ ...props.style, height }}
      onFocus={(e) => {
        setHeight(500);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setHeight(100);
        props.onBlur?.(e);
      }}
    />
  );
};

export const DynamicColumnsConfigModal: React.FC<DynamicColumnsConfigModalProps> = ({
  visible,
  onCancel,
  onOk,
  initialValues,
  t,
  filterForm,
}) => {
  const [form] = Form.useForm<FormValues>();

  // 转换 filterForm 数据结构
  const filterFields = filterForm?.fields
    ? Object.entries(filterForm.fields).map(([key, value]) => ({
        key,
        label: value?.['label'],
      }))
    : [];

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        defaultShowDynamicColumns: initialValues?.defaultShowDynamicColumns ?? true,
        rowIdColumnIndex: initialValues?.rowIdColumnIndex,
        insertAfterColumnIndex: initialValues?.insertAfterColumnIndex ?? -1,
        autoRefresh: initialValues?.autoRefresh ?? 0,
        renderDelay: initialValues?.renderDelay ?? 500,
        hasCustomForm: Boolean(initialValues?.formSchema),
        formSchema: initialValues?.formSchema ?? '',
        headerFunctionTemplate: initialValues?.headerFunctionTemplate ?? '',
        rowFunctionTemplate: initialValues?.rowFunctionTemplate ?? '',
      });
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(`[${NAMESPACE}] - config values:`, values);
      onOk(values);
    } catch (error) {
      console.error(`[${NAMESPACE}] - config form validation failed:`, error);
    }
  };

  return (
    <Modal
      title={t('Dynamic Columns Configuration')}
      open={visible}
      onCancel={onCancel}
      width={MODAL_CONFIG.width}
      style={MODAL_CONFIG.style}
      styles={{
        body: MODAL_CONFIG.bodyStyle,
      }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('Cancel')}
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          {t('Save')}
        </Button>,
      ]}
    >
      <div style={MODAL_CONTAINER_STYLE}>
        <Form form={form} layout="vertical" style={FORM_STYLE}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
            <Form.Item
              name="defaultShowDynamicColumns"
              label={t('Default Show Dynamic Columns')}
              valuePropName="checked"
              style={{ marginBottom: 0, minWidth: 220, flex: 'none' }}
            >
              <Switch />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="rowIdColumnIndex"
              label={t('Row ID Column Index')}
              rules={[
                { required: true, message: t('Please enter the column index for row ID') },
                { type: 'number', min: 0, message: t('Minimum value is 0') },
              ]}
              style={{ marginBottom: 0, minWidth: 180, flex: 'none' }}
              extra={t('Required. The column index to get row ID, minimum 0.')}
            >
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item
              name="insertAfterColumnIndex"
              label={t('Insert Dynamic Columns After Column Index')}
              tooltip={t('-1 means after the last column')}
              rules={[{ type: 'number', min: -1, message: t('Minimum value is -1') }]}
              initialValue={-1}
              style={{ marginBottom: 0, minWidth: 220, flex: 'none' }}
              extra={t('Optional. -1 means after the last column, minimum -1.')}
            >
              <InputNumber min={-1} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item
              name="autoRefresh"
              label={t('Auto Refresh')}
              tooltip={t('Auto refresh the dynamic columns, unit: second, 0 means no auto refresh')}
              rules={[{ type: 'number', min: 0, message: t('Minimum value is 0') }]}
              initialValue={0}
              style={{ marginBottom: 0, minWidth: 220, flex: 'none' }}
              extra={t('Optional. 0 means no auto refresh, minimum 0.')}
            >
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item
              name="renderDelay"
              label={t('Render Delay')}
              tooltip={t('Render delay, unit: millisecond, 0 means no render delay')}
              rules={[{ type: 'number', min: 0, message: t('Minimum value is 0') }]}
              initialValue={500}
              style={{ marginBottom: 0, minWidth: 220, flex: 'none' }}
              extra={t('Optional. 0 means no render delay, minimum 0.')}
            >
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
          </div>

          <Form.Item
            name="hasCustomForm"
            label={t('Use Custom Form')}
            valuePropName="checked"
            tooltip={t(
              'If enabled, a form will pop up when the user clicks the dynamic column button, otherwise the user clicks the dynamic column button to directly display/close the dynamic column',
            )}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.hasCustomForm !== currentValues.hasCustomForm}
          >
            {({ getFieldValue }) => {
              const hasCustomForm = getFieldValue('hasCustomForm');
              return hasCustomForm ? (
                <Form.Item
                  name="formSchema"
                  label={t('Form Schema')}
                  tooltip={t(
                    'Used to generate a form for user operation, the value of the form will be passed to the sql template below',
                  )}
                >
                  <AutoResizeTextArea
                    rows={12}
                    style={TEXTAREA_STYLE}
                    placeholder={t('Enter your form schema here...')}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            name="headerFunctionTemplate"
            label={t('Dynamic Column Header Function Template (JS)')}
            tooltip={t(
              'A JS function template to generate dynamic column headers. Signature: (customForm, filterForm). Must return an object with type (sql|api|js) and data. See below for details and examples.',
            )}
          >
            <AutoResizeTextArea
              rows={2}
              style={TEXTAREA_STYLE}
              placeholder={t('Enter your JS function template for dynamic column headers...')}
            />
          </Form.Item>

          <Form.Item
            name="rowFunctionTemplate"
            label={t('Dynamic Column RowData Function Template (JS)')}
            tooltip={t(
              'A JS function template to generate dynamic column row-data. Signature: (customForm, filterForm, rowIds, rows). Must return an object with type (sql|api|js) and data. See below for details and examples.',
            )}
          >
            <AutoResizeTextArea
              rows={2}
              style={TEXTAREA_STYLE}
              placeholder={t('Enter your JS function template for dynamic column row-data...')}
            />
          </Form.Item>

          <div style={INFO_BOX_GUIDE_STYLE}>
            <div style={INFO_TITLE_GUIDE_STYLE}>💡 {t('Configuration Guide')}</div>
            <div style={INFO_CONTENT_STYLE}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.hasCustomForm !== currentValues.hasCustomForm}
              >
                {({ getFieldValue }) => {
                  const hasCustomForm = getFieldValue('hasCustomForm');
                  return hasCustomForm ? (
                    <>
                      <span style={INFO_TITLE_L1_STYLE}>{t('Form Schema Configuration')}</span>
                      <span style={INFO_TITLE_L2_STYLE}>{t('Supported Field Types')}</span>
                      <ul style={LIST_STYLE}>
                        <li>
                          <code style={CODE_STYLE}>string</code> - Text input (default)
                        </li>
                        <li>
                          <code style={CODE_STYLE}>number</code> - Number input
                        </li>
                        <li>
                          <code style={CODE_STYLE}>boolean</code> - Switch
                        </li>
                        <li>
                          <code style={CODE_STYLE}>select</code> - Dropdown (requires options)
                        </li>
                        <li>
                          <code style={CODE_STYLE}>date</code> - Date picker
                        </li>
                        <li>
                          <code style={CODE_STYLE}>datetime</code> - Datetime picker
                        </li>
                      </ul>
                      <span style={INFO_TITLE_L2_STYLE}>{t('Example')}</span>
                      <pre style={PRE_STYLE}>
                        {`[
  {
    "name": "tableId",
    "label": "Table ID",
    "required": true,
    "type": "string",
    "placeholder": "Enter table ID"
  },
  {
    "name": "status",
    "label": "Status",
    "type": "select",
    "options": [
      { "label": "Enabled", "value": "1" },
      { "label": "Disabled", "value": "0" }
    ]
  }
]
`}
                      </pre>
                    </>
                  ) : null;
                }}
              </Form.Item>

              {filterFields.length > 0 && (
                <>
                  <span style={INFO_TITLE_L1_STYLE}>{t('Available Filter Form Fields')}</span>
                  <div style={FIELD_BLOCK_STYLE}>
                    {filterFields.map((field, index) => (
                      <CopyableCode key={field.key} code={field.key} label={field.label} />
                    ))}
                  </div>
                </>
              )}

              <span style={INFO_TITLE_L1_STYLE}>{t('Dynamic Column Header Function Template')}</span>
              <div style={INFO_CONTENT_STYLE}>
                <div>{t('Function signature:')}</div>
                <pre style={PRE_STYLE}>
                  {`(customForm, filterForm) => {
  // your logic
  return {
    type: 'js' | 'sql' | 'api',
    data: ...
  }
}`}
                </pre>
                <div>{t('Return format (SQL type):')}</div>
                <pre style={PRE_STYLE}>
                  {`{
  type: 'sql',
  data: 'SELECT ...'
}
// SQL Must return an array like:
[
  { key: 'xiaomi', value: '小米' }
]`}
                </pre>
                <div>{t('Return format (API type):')}</div>
                <pre style={PRE_STYLE}>
                  {`{
  type: 'api',
  data: {
    url: '...',
    method: 'get',
    headers: {},
    query: {},
    body: {}
  }
}
// API Must return an array like:
[
  { key: 'xiaomi', value: '小米' }
]`}
                </pre>
                <div>{t('Return format (js type):')}</div>
                <pre style={PRE_STYLE}>
                  {`{
  type: 'js',
  data: [
    { key: 'xiaomi', value: '小米' }
  ]
}
// Direct array of header objects with key-value pairs`}
                </pre>
                <div>{t('Example (SQL):')}</div>
                <pre style={PRE_STYLE}>
                  {`(customForm, filterForm) => {
  let field = filterForm?.f_spqwq6g99cu;
  field = field ?? customForm?.fieldIdForGroup;
  if (!field) {
    throw new Error('Parameter f_spqwq6g99cu is required');
  }
  return {
    type: 'sql',
    data: \`SELECT \`\${field}\` as \`key\`, CONCAT(\`\${field}\`, '(', COUNT(\`\${field}\`), ')') as \`value\` FROM t_nvxzi2mf5jm GROUP BY \`\${field}\`\`
  };
}`}
                </pre>
                <div>{t('Example (js):')}</div>
                <pre style={PRE_STYLE}>
                  {`(customForm, filterForm) => {
  // 直接返回固定的列头配置
  const columns = [
    { key: 'q1', value: 'Q1 2024' },
    { key: 'q2', value: 'Q2 2024' },
    { key: 'q3', value: 'Q3 2024' },
    { key: 'q4', value: 'Q4 2024' }
  ];
  
  return {
    type: 'js',
    data: columns
  };
}`}
                </pre>
              </div>

              <span style={INFO_TITLE_L1_STYLE}>{t('Dynamic Column RowData Function Template')}</span>
              <div style={INFO_CONTENT_STYLE}>
                <div>{t('Function signature:')}</div>
                <pre style={PRE_STYLE}>
                  {`(customForm, filterForm, rowIds, rows) => {
  // your logic
  return {
    type: 'js' | 'sql' | 'api',
    data: ...
  }
}`}
                </pre>
                <div>{t('Return format (SQL type):')}</div>
                <pre style={PRE_STYLE}>
                  {`{
  type: 'sql',
  data: 'SELECT ...'
}
// SQL Must return an array like:
[
  { rowKey: 1, colKey: 'xiaomi', value: 666 }
]`}
                </pre>
                <div>{t('Return format (API type):')}</div>
                <pre style={PRE_STYLE}>
                  {`{
  type: 'api',
  data: {
    url: '...',
    method: 'get',
    headers: {},
    query: {},
    body: {}
  }
}
// API Must return an array like:
[
  { rowKey: 1, colKey: 'xiaomi', value: 666 }
]`}
                </pre>
                <div>{t('Return format (js type):')}</div>
                <pre style={PRE_STYLE}>
                  {`{
  type: 'js',
  data: [
    { rowKey: '1', colKey: '2', value: '2' },
    { rowKey: '2', colKey: '2', value: '5' }
  ]
}
// Direct array of row data objects with rowKey, colKey and value properties`}
                </pre>
                <div>{t('Example (SQL):')}</div>
                <pre style={PRE_STYLE}>
                  {`(customForm, filterForm, rowIds) => {
  let field = filterForm?.f_spqwq6g99cu;
  field = field ?? customForm?.fieldIdForGroup;
  if (!field) {
    throw new Error('Parameter f_spqwq6g99cu is required');
  }
  if (!rowIds || rowIds.length === 0) {
    throw new Error('Parameter rowIds is required');
  }
  const ids = rowIds.join(',');
  return {
    type: 'sql',
    data: \`SELECT f_d03np8mq8hz as \`rowKey\`, \`\${field}\` as \`colKey\`, COUNT(\`\${field}\`) as \`value\` FROM t_nvxzi2mf5jm WHERE f_d03np8mq8hz IN ({{ids}}) GROUP BY \`\${field}\`, f_d03np8mq8hz\`.replaceAll('{{ids}}', ids)
  };
}`}
                </pre>
                <div>{t('Example (js):')}</div>
                <pre style={PRE_STYLE}>
                  {`(customForm, filterForm, rowIds, rows) => {
  // 指定要提取的列索引
  const targetColKey = '2';
  
  // 创建结果数组
  const rowsData = [];
  
  // 检查输入数据
  if (!rowIds || !rows || rowIds.length === 0 || rows.length === 0) {
    return {
      type: 'js',
      data: []
    };
  }
  
  // 遍历每行，提取指定列的值
  for (let i = 0; i < Math.min(rowIds.length, rows.length); i++) {
    const rowId = rowIds[i];
    const rowData = rows[i];
    
    // 如果行存在且包含目标列
    if (rowData && targetColKey in rowData) {
      rowsData.push({
        rowKey: rowId,
        colKey: targetColKey,
        value: rowData[targetColKey]
      });
    }
  }
  
  return {
    type: 'js',
    data: rowsData
  };
}`}
                </pre>
              </div>
            </div>
          </div>

          <div style={INFO_BOX_WARNING_STYLE}>
            <div style={INFO_TITLE_WARNING_STYLE}>⚠️ {t('Important Notes')}</div>
            <div style={INFO_CONTENT_STYLE}>
              <ul style={LIST_STYLE}>
                <li>{t('Form schema must be a valid JSON array')}</li>
                <li>{t('Each form field must have a unique name')}</li>
                <li>{t('For select type fields, options array is required')}</li>
                <li>{t('Make sure your SQL queries are safe and optimized')}</li>
                <li>{t('The js type allows direct data processing in the browser without server requests')}</li>
                <li>
                  {t(
                    'For row data functions, the rows parameter contains table data in the format: [{1: "value1", 2: "value2"}, ...]',
                  )}
                </li>
              </ul>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

const CopyableCode: React.FC<{ code: string; label: string }> = ({ code, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 12 }}>
    <Typography.Text code copyable={{ text: code }}>
      {code}
    </Typography.Text>
    <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>({label})</span>
  </span>
);
