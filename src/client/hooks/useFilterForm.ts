/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useForm } from '@formily/react';
import { FilterForm } from '../types';

/**
 * 获取关联的过滤表单
 * @returns
 */
export const useFilterForm = () => {
  const form = useForm();
  const fieldsArr = Array.isArray(form?.fields) ? form.fields : Object.values(form?.fields || {});
  const filteredFields = fieldsArr.filter(
    (field) => field?.componentType === 'CollectionField' && field?.decoratorType === 'FormItem',
  );
  const filteredFieldsMap = filteredFields.reduce(
    (acc, field) => {
      const name = field?.props?.name;
      if (name) {
        acc[name] = {
          label: field?.title,
          value: field?.value,
          field: field,
        };
      }
      return acc;
    },
    {} as Record<string, { label: string; value: any; field: any }>,
  );
  return new FilterForm(filteredFieldsMap, form.values);
};
