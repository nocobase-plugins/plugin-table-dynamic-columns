/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { createContext, useContext } from 'react';

export const DynamicColumnsContext = createContext<{} | null>(null);

export function useDynamicColumnsContext() {
  const ctx = useContext(DynamicColumnsContext);
  if (!ctx) throw new Error('DynamicColumnsContext not found');
  return ctx;
}
