/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Plugin, SchemaComponentOptions } from '@nocobase/client';
import { DynamicColumnsContext } from './contexts/DynamicColumnsContext';
import {
  DynamicColumnsActionInitializer,
  DynamicColumnsActionComponent,
  dynamicColumnsActionSettings,
} from './DynamicColumnsActionInitializer';
import { NAMESPACE } from './constants';

class TableDynamicColumnsPlugin extends Plugin {
  async load() {
    this.app.addProvider((props) => {
      const { children } = props;
      return (
        <DynamicColumnsContext.Provider value={{}}>
          <SchemaComponentOptions
            components={{
              // DynamicColumnsActionInitializerHiddenVersion,
              DynamicColumnsActionInitializer,
              DynamicColumnsActionComponent,
            }}
            scope={
              {
                // useDynamicColumnsActionProps,
              }
            }
          >
            {children}
          </SchemaComponentOptions>
        </DynamicColumnsContext.Provider>
      );
    });

    // this.app.schemaInitializerManager.addItem('table:configureActions', 'customize.dynamicColumns', {
    //   type: 'item',
    //   name: 'dynamicColumns',
    //   title: "{{t('Customize Dynamic Columns')}}",
    //   Component: (props) => {
    //     const schema = {
    //       'x-component': 'DynamicColumnsActionInitializerHiddenVersion',
    //       'x-component-props': {
    //         defaultShowDynamicColumns: true
    //       }
    //     };
    //     const itemConfig = useSchemaInitializerItem();
    //     return <InitializerWithSwitch {...props} schema={schema} item={itemConfig} type={'x-action'} />;
    //   }
    // });

    this.app.schemaInitializerManager.addItem('table:configureActions', 'customize.dynamicColumns', {
      type: 'item',
      name: 'dynamicColumns',
      title: `{{t('Customize Dynamic Columns', { ns: '${NAMESPACE}' })}}`,
      Component: 'DynamicColumnsActionInitializer',
      schema: {
        'x-align': 'right',
      },
    });
    this.app.schemaInitializerManager.addItem('filterForm:configureActions', 'customize.dynamicColumns', {
      type: 'item',
      name: 'dynamicColumns',
      title: `{{t('Customize Dynamic Columns', { ns: '${NAMESPACE}' })}}`,
      Component: 'DynamicColumnsActionInitializer',
    });
    this.schemaSettingsManager.add(dynamicColumnsActionSettings);
  }
}

export default TableDynamicColumnsPlugin;
