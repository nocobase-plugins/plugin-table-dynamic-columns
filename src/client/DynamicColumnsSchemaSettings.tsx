/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useField, useFieldSchema } from '@formily/react';
import { SchemaSettingsItem, useDesignable } from '@nocobase/client';
import React, { useState } from 'react';
import { NAMESPACE } from './constants';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { DynamicColumnsConfigModal } from './components/DynamicColumnsConfig';
import { useFilterForm } from './hooks/useFilterForm';

export function DynamicColumnsSchemaSettings() {
  const { dn } = useDesignable();
  const { t } = useTranslation(NAMESPACE);
  const fieldSchema = useFieldSchema();
  const field = useField();
  const [styleModalVisible, setStyleModalVisible] = useState(false);
  const filterForm = useFilterForm();

  const initialValues = fieldSchema?.['x-component-props']?.dynamicColumnsConfig;

  const handleStyleModalOk = (values: any) => {
    // Update field configuration
    fieldSchema['x-component-props'] = fieldSchema['x-component-props'] || {};
    fieldSchema['x-component-props'].dynamicColumnsConfig = values || {};

    // Update field instance
    field.componentProps = field.componentProps || {};
    field.componentProps.dynamicColumnsConfig = values;

    // Send update event
    dn.emit('patch', {
      schema: {
        ['x-uid']: fieldSchema['x-uid'],
        'x-component-props': {
          ...fieldSchema['x-component-props'],
        },
      },
    });

    message.success(t('Configuration saved successfully'));
    setStyleModalVisible(false);
  };

  return (
    <>
      <SchemaSettingsItem title={t('Customize Dynamic Columns')} onClick={() => setStyleModalVisible(true)} />
      <DynamicColumnsConfigModal
        visible={styleModalVisible}
        onCancel={() => setStyleModalVisible(false)}
        onOk={handleStyleModalOk}
        initialValues={initialValues}
        t={t}
        filterForm={filterForm}
      />
    </>
  );
}
