/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import {
  Action,
  InitializerWithSwitch,
  RemoveButton,
  SchemaSettings,
  useDesignable,
  useSchemaInitializerItem,
  useSchemaToolbar,
} from '@nocobase/client';
import React from 'react';
import { Button } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { NAMESPACE } from './constants';
import { useTranslation } from 'react-i18next';
import { useDynamicColumns } from './hooks/useDynamicColumns';
import { DynamicColumnsSchemaSettings } from './DynamicColumnsSchemaSettings';

export const dynamicColumnsActionSettings = new SchemaSettings({
  name: 'actionSettings:dynamicColumns',
  items: [
    {
      name: 'dynamicColumnsConfig',
      Component: DynamicColumnsSchemaSettings,
    },
    {
      name: 'delete',
      sort: 100,
      Component: RemoveButton as any,
      useComponentProps() {
        const { removeButtonProps } = useSchemaToolbar();
        return removeButtonProps;
      },
    },
  ],
});

export const DynamicColumnsActionComponent = (props) => {
  const { t } = useTranslation(NAMESPACE);
  const { designable } = useDesignable();
  const { showDynamicColumns, component, onClick } = useDynamicColumns();
  const icon = showDynamicColumns ? <EyeOutlined /> : <EyeInvisibleOutlined />;
  if (designable) {
    // 设计器模式下用标准 Action，保留编辑能力
    return <Action {...props} icon={icon} title={component} onClick={onClick} />;
  } else {
    // 非设计器模式下用按钮，避免出现Action的title使用自定义组件后导致按钮的title为[object Object]
    return (
      <Button {...props} title={t('Dynamic Columns')} onClick={onClick}>
        {icon} {component}
      </Button>
    );
  }
};

export const DynamicColumnsActionInitializer = (props) => {
  const schema = {
    type: 'void',
    name: 'dynamicColumnsAction',
    'x-component': 'DynamicColumnsActionComponent',
    'x-settings': 'actionSettings:dynamicColumns',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-action': 'dynamicColumnsAction',
  };
  const itemConfig = useSchemaInitializerItem();
  return <InitializerWithSwitch {...itemConfig} {...props} schema={schema} item={itemConfig} type={'x-action'} />;
};
