/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { NAMESPACE } from '../constants';

/**
 * 基于 container 向上查找包含查找指定类型、包含/不包含指定 class 的父级元素
 */
export function findParentElementWithClass(options: {
  element: HTMLElement | null;
  includeClass?: string[];
  excludeClass?: string[];
  nodeType?: string;
}): HTMLElement | null {
  const { element, includeClass = [], excludeClass = [], nodeType } = options;
  let current = element;
  while (current) {
    const isNodeTypeMatch = !nodeType || current.nodeName.toLowerCase() === nodeType.toLowerCase();
    const hasInclude = includeClass.length === 0 || includeClass.every((c) => current?.classList.contains(c) ?? false);
    const hasExclude = excludeClass.some((c) => current?.classList.contains(c) ?? false);
    if (isNodeTypeMatch && hasInclude && !hasExclude) {
      return current;
    }
    current = current.parentElement as HTMLElement | null;
  }
  return null;
}

/**
 * 在 container 内查找指定类型、包含/不包含指定 class 的子元素
 */
export function findChildrenElementWithClass(options: {
  container: HTMLElement;
  includeClass?: string[];
  excludeClass?: string[];
  nodeType?: string;
}): HTMLElement | null {
  return findAllChildrenElementWithClass(options)?.[0] || null;
}

export function findAllChildrenElementWithClass(options: {
  container: HTMLElement;
  includeClass?: string[];
  excludeClass?: string[];
  nodeType?: string;
}): HTMLElement[] {
  const { container, includeClass = [], excludeClass = [], nodeType = 'div' } = options;
  if (!container) return [];
  const nodes = Array.from(container.querySelectorAll(nodeType));
  return nodes.filter((node) => {
    const classList = Array.from((node as HTMLElement).classList || []);
    const hasInclude = includeClass.length === 0 || includeClass.every((cls) => classList.includes(cls));
    const hasExclude = excludeClass.some((cls) => classList.includes(cls));
    return hasInclude && !hasExclude;
  }) as HTMLElement[];
}

/**
 * 监听元素出现
 * @param container 容器
 * @param finder 查找器
 * @param callback 回调
 * @returns 观察者
 */
export function monitorContainerMutationsAndInvokeWhenFound(
  container: HTMLElement,
  finder: (element: HTMLElement) => HTMLElement | null,
  callback: (element: HTMLElement) => void,
): MutationObserver | null {
  if (!container) {
    console.log(`[${NAMESPACE}] - container not found`);
    return null;
  }
  const initialElement = finder(container);
  if (initialElement) {
    console.log(`[${NAMESPACE}] - element found:`, initialElement);
    callback(initialElement);
    return null;
  }
  const observer = new MutationObserver(() => {
    const element = finder(container);
    if (element) {
      console.log(`[${NAMESPACE}] - element found:`, element);
      callback(element);
      observer.disconnect();
    }
  });
  observer.observe(container, { childList: true, subtree: true });
  return observer;
}

/**
 * 监听table body的增删tr，当tr出现时，触发回调
 * @param table table dom
 * @param onChange 回调
 * @returns 观察者
 */
export function monitorTableBodyMutationsAndInvokeWhenFound(
  table: HTMLTableElement,
  onChange: (table: HTMLTableElement) => void,
  isInit = false,
) {
  if (!table) {
    console.log(`[${NAMESPACE}] - table not found`);
    return null;
  }
  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.log(`[${NAMESPACE}] - tbody not found`);
    return null;
  }
  isInit && onChange && onChange(table);
  const observer = new MutationObserver((mutations) => {
    // 只在tr增删时触发
    if (
      mutations.some(
        (m) =>
          Array.from(m.addedNodes).some((n) => n.nodeName === 'TR') ||
          Array.from(m.removedNodes).some((n) => n.nodeName === 'TR'),
      )
    ) {
      onChange && onChange(table);
    }
  });
  observer.observe(tbody, { childList: true }); // 不要subtree
  return observer;
}

/**
 * Listen for visibility changes (display, visibility, opacity) of a given element and trigger a callback when the visibility changes.
 * @param element The target HTMLElement to observe.
 * @param callback The callback function to invoke when visibility changes. Receives a boolean: true if visible, false if hidden.
 * @returns The MutationObserver instance.
 */
export function monitorElementVisibilityChange(
  element: HTMLElement,
  callback: (isVisible: boolean) => void
): MutationObserver | null {
  if (!element) {
    console.log(`[${NAMESPACE}] - element not found`);
    return null;
  }

  // Helper to determine visibility
  function isElementVisible(el: HTMLElement): boolean {
    const style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  let lastVisible = isElementVisible(element);

  // Initial callback
  callback(lastVisible);

  const observer = new MutationObserver(() => {
    const currentVisible = isElementVisible(element);
    if (currentVisible !== lastVisible) {
      lastVisible = currentVisible;
      callback(currentVisible);
    }
  });

  observer.observe(element, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    subtree: false,
  });

  return observer;
}
