/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Form, Input, Space, Button, InputNumber, Switch, Select, DatePicker } from 'antd';
import React from 'react';

// formMetaData 是表单的元数据，用于生成表单
// formMetaData 的结构如下：
//     [
//         {
//             "name": "tableIdForFetchHeader",
//             "label": "表ID",
//             "required": true,
//             "defaultValue": "t_nvxzi2mf5jm",
//             "type": "string",// 类型：string(默认), number, boolean, select, date, datetime
//             "placeholder": "请输入表ID",
//             "options": [// 如果type为select，则options为选项列表
//                 {
//                     "label": "选项1",
//                     "value": "1"
//                 },
//             ]
//         }
//     ]
// values 是表单的值，用于初始化表单
// onApply 是表单应用的回调函数
// onClose 是表单关闭的回调函数
export const PopoverForm = ({ formMetaData, values, onApply, onClose, t }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} initialValues={values} onClick={(e) => e.stopPropagation()}>
      {formMetaData.map((item) => {
        if (!item.type || item.type === 'string') {
          return (
            <Form.Item
              key={item.name}
              label={item.label}
              name={item.name}
              rules={[{ required: item.required, message: t('Please input {label}', { label: item.label }) }]}
            >
              <Input autoComplete="off" placeholder={t(item.placeholder)} />
            </Form.Item>
          );
        } else if (item.type === 'number') {
          return (
            <Form.Item
              key={item.name}
              label={item.label}
              name={item.name}
              rules={[{ required: item.required, message: t('Please input {label}', { label: item.label }) }]}
            >
              <InputNumber autoComplete="off" placeholder={t(item.placeholder)} />
            </Form.Item>
          );
        } else if (item.type === 'boolean') {
          return (
            <Form.Item
              key={item.name}
              label={item.label}
              name={item.name}
              rules={[{ required: item.required, message: t('Please input {label}', { label: item.label }) }]}
            >
              <Switch />
            </Form.Item>
          );
        } else if (item.type === 'select') {
          return (
            <Form.Item
              key={item.name}
              label={item.label}
              name={item.name}
              rules={[{ required: item.required, message: t('Please input {label}', { label: item.label }) }]}
            >
              <Select options={item.options} placeholder={t(item.placeholder)} />
            </Form.Item>
          );
        } else if (item.type === 'date') {
          return (
            <Form.Item
              key={item.name}
              label={item.label}
              name={item.name}
              rules={[{ required: item.required, message: t('Please input {label}', { label: item.label }) }]}
            >
              <DatePicker placeholder={t(item.placeholder)} />
            </Form.Item>
          );
        } else if (item.type === 'datetime') {
          return (
            <Form.Item
              key={item.name}
              label={item.label}
              name={item.name}
              rules={[{ required: item.required, message: t('Please input {label}', { label: item.label }) }]}
            >
              <DatePicker placeholder={t(item.placeholder)} showTime />
            </Form.Item>
          );
        } else {
          return null;
        }
      })}
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          {t('Close')}
        </Button>
        <Button
          type="primary"
          onClick={(e) => {
            e.stopPropagation();
            form
              .validateFields()
              .then((values) => {
                onApply(values);
              })
              .catch(() => {});
          }}
        >
          {t('Apply')}
        </Button>
      </Space>
    </Form>
  );
};
