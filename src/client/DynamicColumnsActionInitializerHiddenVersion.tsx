/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useRef, createContext } from 'react';
import { withDynamicSchemaProps } from '@nocobase/client';

const DynamicColumnsActionContext = createContext<any>(null);
DynamicColumnsActionContext.displayName = 'DynamicColumnsActionContext';

const InternalDynamicColumnsAction = React.memo((props: any) => {
  const domRef = useRef<any>(null);

  // useDynamicColumns({});

  return (
    <DynamicColumnsActionContext.Provider value={{}}>
      <i ref={domRef} />
    </DynamicColumnsActionContext.Provider>
  );
});

InternalDynamicColumnsAction.displayName = 'InternalDynamicColumnsAction';

export const DynamicColumnsActionInitializerHiddenVersion = withDynamicSchemaProps((props: any) => {
  return <InternalDynamicColumnsAction {...props} disabled={!!props.disabled} />;
});

DynamicColumnsActionInitializerHiddenVersion.displayName = 'DynamicColumnsActionInitializerHiddenVersion';
