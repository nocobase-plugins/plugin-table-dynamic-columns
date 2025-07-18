/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export class FilterForm {
  constructor(
    public fields: Record<string, { label: string; value: any; field: any }>,
    public values: any,
  ) {}

  getFields() {
    return this.fields;
  }

  getValues() {
    return this.values;
  }
}
