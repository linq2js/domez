export type Effect = (context: Context) => void | VoidFunction;

export type ElementRef<T extends HTMLElement = HTMLElement> = Ref<() => T> & {
  style(value: ElementStyle): ElementRef<T>;
  class(value: ElementClass): ElementRef<T>;
  update(data: ElementData<T>): ElementRef<T>;
};

export type Ref<A extends (...args: any[]) => any> = A & {
  mount(element: Element): void;
  unmount(): void;
  readonly mounted: boolean;
  readonly id: string;
  toString(): string;
};

export type Toggle = {
  ref: Ref<() => void>;
  show(): void;
  hide(): void;
  toggle(): void;
  visible: boolean;
  toString(): string;
};

export type List<C, D> = {
  readonly ref: Ref<() => void>;
  readonly size: number;
  get(index: number): C | undefined;
  set(index: number, data: D): C;
  remove(index: number): C | undefined;
  remove(predicate: (item: C, index: number) => boolean, count?: number): C[];
  remove(index: number, count: number): C[];
  sort(sortFn: (a: C, b: C) => number): void;
  insert(index: number, data: D): C;
  move(from: number, to: number): void;
  swap(from: number, to: number): void;
  shift(): C | undefined;
  unshift(data: D): C;
  pop(): C | undefined;
  push(data: D): C;
  findIndex(predicate: (item: C, index: number) => boolean): number;
  find(predicate: (item: C, index: number) => boolean): C | undefined;
  forEach(callback: (item: C, index: number) => void): void;
  toString(): string;
  // return first controller in the list, will throw error if the list is empty
  first(): C;
  // return last controller in the list, will throw error if the list is empty
  last(): C;
};

export type Extension<T = void> = (context: Context) => T;

export type ElementStyle =
  | string
  | { [key in keyof CSSStyleDeclaration]?: any };

export type ElementClass =
  | string
  | Record<string, any>
  | (string | Record<string, any>)[];

export type ControllerRef<T extends Controller> = Ref<() => T>;

export type NoOnPrefix<T> = T extends `on${infer TPostfix}` ? TPostfix : T;

export type ElementData<E> = {
  text?: any;
  html?: any;
  title?: any;
  checked?: any;
  selected?: any;
  disabled?: any;
  value?: any;
  props?: { [key in keyof E]?: E[key] };
  style?: ElementStyle;
  class?: ElementClass;
  attrs?: Record<string, any>;
  onclick?: EventListener;
  ondblclick?: EventListener;
  onchange?: EventListener;
  // mouse events
  onmouseover?: EventListener;
  onmousedown?: EventListener;
  onmousemove?: EventListener;
  onmouseup?: EventListener;
  onmouseenter?: EventListener;
  onmouseleave?: EventListener;
  //
  onload?: EventListener;
  onerror?: EventListener;
  onresize?: EventListener;
  // key events
  onkeydown?: EventListener;
  onkeypress?: EventListener;
  onkeyup?: EventListener;
  on?: { [key in NoOnPrefix<keyof E>]?: EventListener };
};

export type Context = {
  readonly parent?: Context;
  readonly id: string;

  ref<E extends HTMLElement = HTMLElement>(data: ElementData<E>): ElementRef<E>;

  ref<E extends HTMLElement = HTMLElement>(): ElementRef<E>;
  ref<C extends Controller>(
    blockBuilder: BlockBuilder<C, void>
  ): ControllerRef<C>;
  ref<H extends Controller, D>(
    blockBuilder: BlockBuilder<H, D>,
    initialData: D
  ): Ref<() => H>;

  /**
   * use an mount/unmount effects
   * @param effect
   */
  effect(effect: Effect): void;

  /**
   * create an element toggle ref
   * @param visible
   */
  toggle(visible?: boolean): Toggle;

  /**
   * create list of block
   * @param block
   */
  list<C extends Controller>(block: BlockBuilder<C, void>): List<C, void>;

  /**
   * create list of block
   * @param bloc
   * @param initialData
   */
  list<C extends Controller>(
    bloc: BlockBuilder<C, void>,
    initialData: number
  ): List<C, void>;

  /**
   * create list of block
   * @param block
   * @param initialData
   */
  list<C extends Controller, D>(
    block: BlockBuilder<C, D>,
    initialData?: D extends void ? number : D[]
  ): List<C, D>;
  /**
   * use single extension
   * @param extension
   */
  use<T>(extension: Extension<T>): T;
  /**
   * use multiple extensions
   * @param extensions
   */
  use<E extends { [key: number]: Extension }>(
    extensions: E
  ): { [key in keyof E]: E[key] extends Extension<infer T> ? T : never };

  /**
   * listen change from single signal
   * @param signal
   * @param listener
   */
  on<T>(signal: Signal<T>, listener: Listener<T>): VoidFunction;

  /**
   * listen change from multiple providers
   * @param signals
   * @param listener
   */
  on<P extends { [key: number]: Signal<any> }>(
    signals: P,
    listener: Listener<{
      [key in keyof P]: P[key] extends Signal<infer T> ? T : never;
    }>
  ): VoidFunction;

  on<T>(signal: Signal<T>): Watcher<T>;

  on<P extends { [key: number]: Signal<any> }>(
    signals: P
  ): Watcher<{
    [key in keyof P]: P[key] extends Signal<infer T> ? T : never;
  }>;
};

export type Watcher<T> = {
  /**
   * return an element binding that call updater once signal changed
   * @param updater
   */
  bind<E extends HTMLElement = HTMLElement>(
    updater: (
      value: T,
      element: E,
      data: Record<string, any>
    ) => void | ElementData<E>
  ): ElementRef<E>;

  /**
   * return an element binding that contains logic to update element text once signal changed
   */
  text(): ElementRef;
  /**
   * return an element binding that contains logic to update element text using transform function once signal changed
   * @param transform
   */
  text(transform: (value: T) => any): ElementRef;

  /**
   * return an element binding that contains logic to update element HTML once signal changed
   */
  html(): ElementRef;

  /**
   * return an element binding that contains logic to update element HTML using transform function once signal changed
   * @param transform
   */
  html(transform: (value: T) => any): ElementRef;

  /**
   * return a binding that does show/hide target element according to signal value
   */
  show(): ElementRef;

  /**
   * return a binding that does show/hide target element according to signal value
   * @param transform
   */
  show(transform: (value: T) => any): ElementRef;

  /**
   * return a binding that does show/hide target element according to signal value
   */
  hide(): ElementRef;

  /**
   * return a binding that does show/hide target element according to signal value
   * @param transform
   */
  hide(transform: (value: T) => any): ElementRef;
};

/**
 * controller is result of block builder. It must have template prop
 */
export type Controller = { template: string };

/**
 * block builder is a pure function that retrieves context for building block.
 * If the block builder has a second argument as required, you must provide the second param when building block
 * ```js
 * const Counter = (context, initialValue) => {}
 *
 * ref(Counter, 1);
 * ```
 */
export type BlockBuilder<R extends Controller = { template: "" }, D = void> =
  | ((context: Context) => R | string)
  | ((context: Context, data: D) => R | string);

export type Block<C extends Controller> = {
  readonly controller: C;
  readonly rootElement: Element;
  mount(element: Element): void;
  unmount(): void;
};

export type TemplateManager = {
  element: Element;
  clone(): Element;
};

const generateRefAttribute = (id: string) => ` data-ref-${id} `;

const generateTemplateHTML = (id: string) =>
  `<template data-ref="${id}" ${generateRefAttribute(id)}></template>`;

const createTemplate = (
  templateElement: Element,
  templateString: string
): TemplateManager => {
  templateElement.innerHTML = templateString;
  const content = (templateElement as any).content as DocumentFragment;
  if (content.children.length !== 1) {
    throw new Error(
      `Invalid template. The template must have only child but got ${content.children.length}`
    );
  }
  const rootElement = content.children[0];

  return {
    element: templateElement,
    clone(): Element {
      return rootElement.cloneNode(true) as Element;
    },
  };
};

const generateRefId = (context: Context, index: number) => {
  return context.id + "-" + index.toString(36);
};

let dynamicRefId = 0;
const generateDynamicRefId = () => {
  return `D${dynamicRefId++}`;
};

const insertBefore = (currentNode: Node, newNode: Node) => {
  currentNode.parentNode?.insertBefore(newNode, currentNode);
};

const createTextNode = (data = "") => document.createTextNode(data);

const createList = <C extends Controller, D>(
  context: Context,
  id: string,
  blockBuilder: BlockBuilder<C, D>,
  initialData: number | D[] | undefined
) => {
  let placeholder: Node;
  let items: Block<C>[] = [];
  const createItem = (data: D, insertAction: (element: Element) => void) => {
    const block = createBlock(blockBuilder, context, data);
    const templateElement = document.createElement("template");
    // should use static ref id
    templateElement.setAttribute("data-ref", generateDynamicRefId());
    insertAction(templateElement);
    block.mount(templateElement);
    return block;
  };
  const ref = createRef(
    id,
    "element",
    (element) => {
      placeholder = createTextNode("");
      element.before(placeholder);
      element.remove();
      return () => {};
    },
    () => {
      items.forEach((item) => item.unmount());
      items.length = 0;
      placeholder.parentNode?.removeChild(placeholder);
    }
  );
  const list: List<C, D> = {
    ref,
    get size() {
      return items.length;
    },
    get(index) {
      return items[index]?.controller;
    },
    set(index, data) {
      if (index < 0 || index >= items.length) {
        throw new Error("Item index is out of range");
      }
      const block = createItem(data, (element) => {
        insertBefore(items[index].rootElement, element);
      });
      items[index].unmount();
      items[index] = block;
      return block.controller;
    },
    first() {
      if (items.length) {
        throw new Error("Cannot access the first item of empty list");
      }
      return items[0].controller;
    },
    last() {
      if (items.length) {
        throw new Error("Cannot access the last item of empty list");
      }
      return items[items.length - 1].controller;
    },
    pop() {
      const item = items.pop();
      item?.unmount();
      return item?.controller;
    },
    shift() {
      const item = items.shift();
      item?.unmount();
      return item?.controller;
    },
    unshift(data) {
      const block = createItem(data, (element) => {
        insertBefore(items[0]?.rootElement ?? placeholder, element);
      });
      items.unshift(block);
      return block.controller;
    },
    push(data) {
      const block = createItem(data, (element) => {
        insertBefore(placeholder, element);
      });
      items.push(block);
      return block.controller;
    },
    insert(index: number, data) {
      const block = createItem(data, (element) => {
        insertBefore(items[index]?.rootElement ?? placeholder, element);
      });
      items.splice(index, 0, block);
      return block.controller;
    },
    swap(from, to) {
      if (
        !items.length ||
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= items.length ||
        to >= items.length
      )
        return;
      // make sure "from" is always less than "to"
      if (from > to) {
        [from, to] = [to, from];
      }
      const toItem = items[to];
      const fromItem = items[from];
      const nextFrom = fromItem.rootElement.nextSibling ?? placeholder;
      items[from] = toItem;
      items[to] = fromItem;
      insertBefore(toItem.rootElement, fromItem.rootElement);
      insertBefore(nextFrom, toItem.rootElement);
    },
    move(from, to) {
      if (
        !items.length ||
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= items.length ||
        to >= items.length
      )
        return;
      const toItem = items[to];
      const fromItem = items[from];

      items.splice(to, 0, fromItem);
      toItem.rootElement.before(fromItem.rootElement);
    },
    sort(sortFn) {
      if (!items.length) return;
      const sorted = items
        .slice()
        .sort((a, b) => -sortFn(a.controller, b.controller));
      let lastNode = placeholder;
      sorted.forEach((controller, index) => {
        insertBefore(lastNode, controller.rootElement);
        items[index] = controller;
        lastNode = controller.rootElement;
      });
    },
    findIndex(predicate) {
      return items.findIndex((item, index) =>
        predicate(item.controller, index)
      );
    },
    find(predicate) {
      return items.find((item, index) => predicate(item.controller, index))
        ?.controller;
    },
    forEach(callback) {
      items.forEach((item, index) => callback(item.controller, index));
    },
    remove(...args: any[]): any {
      // remove(predicate, count)
      if (typeof args[0] === "function") {
        let [predicate, count = Number.MAX_VALUE] = args as [Function, number];
        const removed: C[] = [];
        const removedIndices: number[] = [];
        let index = 0;
        for (const item of items) {
          if (predicate(item.controller, index)) {
            removed.push(item.controller);
            item.unmount();
            count--;
            removedIndices.push(index);
          }
          if (!count) break;
          index++;
        }
        while (removedIndices.length) {
          items.splice(removedIndices.pop()!, 1);
        }
        return removed;
      } else {
        // remove(index, count)
        const [index, count = 1] = args as [number, number];
        const removed = items.splice(index, count);
        removed.forEach((x) => x.unmount());
        if (arguments.length > 1) return removed[0];
        return removed.map((x) => x.controller);
      }
    },
    toString: ref.toString,
  };

  if (initialData) {
    const initialList =
      typeof initialData === "number"
        ? new Array<D>(initialData).fill(undefined as unknown as D)
        : initialData;
    context.effect(() => {
      initialList.forEach((item) => list.push(item));
    });
  }

  return list;
};

const createRef = <A extends (...args: any[]) => any>(
  id: string,
  type: "attribute" | "element",
  init?: (element: Element) => A | void,
  onUnmount?: VoidFunction,
  onMount?: VoidFunction
): Ref<A> => {
  let accessor: A;
  let mounted = false;
  const template =
    type === "attribute" ? generateRefAttribute(id) : generateTemplateHTML(id);
  const ref = Object.assign(
    (...args: Parameters<A>): ReturnType<A> => {
      if (!mounted) {
        throw new Error("The ref has not been mounted");
      }
      return accessor(...args);
    },
    {
      id,
      toString: () => template,
      mount(element: Element) {
        if (mounted) {
          throw new Error("Cannot re-mount. The ref has been mounted");
        }
        accessor = init?.(element) ?? ((() => element) as A);
        mounted = true;
        onMount?.();
      },
      unmount() {
        if (!mounted) return;
        mounted = false;
        onUnmount?.();
      },
    }
  ) as any;

  Object.defineProperty(ref, "mounted", {
    get: () => mounted,
  });

  // is element ref
  if (type === "attribute") {
    Object.assign(ref, {
      style: (value: any) => setStyle(ref(), value),
      class: (value: any) => setClass(ref(), value),
      update: (value: any) => updateElement(ref(), value, id),
    });
  }

  return ref;
};

const createToggle = (
  id: string,
  initialVisible = true,
  onMount?: (element: Element) => void
) => {
  let placeholder: Node;
  let rootElement: Element;
  let visible: boolean = false;
  let ref = createRef(
    id,
    "attribute",
    (element) => {
      placeholder = createTextNode("");
      element.before(placeholder);
      rootElement = element;
    },
    () => {},
    () => {
      toggle.visible = initialVisible;
      onMount?.(rootElement);
    }
  );

  const toggle: Toggle = {
    ref,
    get visible() {
      return visible;
    },
    set visible(value) {
      if (value === visible) return;
      visible = value;
      if (visible) {
        insertBefore(placeholder, rootElement);
      } else {
        rootElement.remove();
      }
    },
    show() {
      toggle.visible = true;
    },
    hide() {
      toggle.visible = false;
    },
    toggle() {
      toggle.visible = !toggle.visible;
    },
    toString: ref.toString,
  };

  return toggle;
};

const mountRefs = (rootElement: Element, refs: Ref<() => any>[]) => {
  refs.forEach((ref) => {
    if (!ref.id) {
      throw new Error("Invalid ref");
    }
    const attr = generateRefAttribute(ref.id).trim();
    const refElement =
      rootElement.getAttribute(attr) === ""
        ? rootElement
        : rootElement?.querySelector(`[${attr}]`);

    if (!refElement) {
      console.warn(`Ref element ${ref.id} is not rendered`);
      return;
    }
    refElement.removeAttribute(ref.id);
    ref.mount(refElement);
  });
};

export type Listener<T, A = void> = (e: T, a: A) => void;

export type Signal<T = any> = {
  on(listener: Listener<T>): VoidFunction;
  get(): T;
  readonly state: T;
};

export type UpdatableSignal<T = any> = Signal<T> & {
  state: T;
  set(value: ((prev: T) => T) | T): void;
  toggle(): void;
  $set<A extends any[], R>(
    setter: (value: T, ...args: A) => R
  ): (...args: A) => R;
};

export type EmittableSignal<T = any, A = any> = Signal<T> & {
  emit(action: A): void;
  on(listener: Listener<T, A>, type?: "action" | "state"): VoidFunction;
};

export type CreateSignal = {
  <T>(initialState: T): UpdatableSignal<T>;
  <T, A>(initialState: T, reducer: (state: T, action: A) => T): EmittableSignal<
    T,
    A
  >;
};

const createCallbackGroup = () => {
  const callbacks = new Set<Function>();
  return {
    add(callback: Function) {
      callbacks.add(callback);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        callbacks.delete(callback);
      };
    },
    call(...args: any[]) {
      if (args.length > 2) {
        callbacks.forEach((callback) => callback(...args));
      } else if (args.length === 2) {
        callbacks.forEach((callback) => callback(args[0], args[1]));
      } else if (args.length === 1) {
        callbacks.forEach((callback) => callback(args[0]));
      } else {
        callbacks.forEach((callback) => callback());
      }
    },
  };
};

const createSignal: CreateSignal = (
  initialState: any,
  reducer?: Function
): any => {
  const stateListeners = createCallbackGroup();
  const actionListeners = createCallbackGroup();

  let currentState = initialState;
  const get = () => currentState;
  const set = (nextState: (() => any) | any) => {
    if (typeof nextState === "function") {
      nextState = nextState(currentState);
    }
    if (currentState === nextState) return;
    currentState = nextState;
    stateListeners.call(currentState);
  };
  const toggle = () => set((prev: any) => !prev);
  const $set = (setter: Function) => {
    return (...args: any[]) => set(setter(currentState, ...args));
  };
  const on = (listener: Function, type: string) => {
    const listeners = type === "action" ? actionListeners : stateListeners;
    if (type === "state") {
      listener(currentState);
    }
    return listeners.add(listener);
  };

  if (!reducer) {
    return {
      get state() {
        return get();
      },
      set state(value) {
        set(value);
      },
      get,
      set,
      toggle,
      $set,
      on,
    };
  }

  return {
    get state() {
      return get();
    },
    get,
    on,
    emit(action: any) {
      actionListeners.call(currentState, action);
      set(reducer(currentState, action));
    },
  };
};

export const setClass = (
  element: HTMLElement,
  value: ElementClass,
  id?: any
) => {
  let classes: Map<any, any> = (element as any).__classes;
  if (!classes) {
    (element as any).__classes = classes = new Map();
    // default style
    classes.set(element, element.className);
  }

  classes.set(id, value);
  // combine all classes
  const classNames: string[] = [];
  classes.forEach((value) => {
    if (!value) return;
    if (typeof value === "string") {
      classNames.push(value);
    } else {
      Object.entries(value).forEach(([key, value]) => {
        if (value) classNames.push(key);
      });
    }
  });
  if (classNames.length) {
    element.className = classNames.join(" ");
  }
};

export const setStyle = (
  element: HTMLElement,
  style: ElementStyle,
  id?: any
) => {
  let styles: Map<any, any> = (element as any).__styles;
  if (!styles) {
    (element as any).__styles = styles = new Map();
    // default style
    styles.set(element, element.style.cssText);
  }

  styles.set(id, style);
  // combine all css texts
  const cssTexts: string[] = [];
  const cssProps: Record<string, any> = {};
  styles.forEach((value) => {
    if (typeof value === "string") {
      cssTexts.push(value);
    } else {
      Object.assign(cssProps, value);
    }
  });
  if (cssTexts.length) {
    element.style.cssText = cssTexts.join(";");
  }
  Object.assign(element.style, cssProps);
};

export const updateElement = <E extends HTMLElement = HTMLElement>(
  element: E,
  data: ElementData<E>,
  id?: any
) => {
  if ("text" in data) {
    element.textContent = data.text;
  }

  if ("html" in data) {
    element.innerHTML = data.html;
  }

  const {
    text: _text,
    html: _html,
    props,
    attrs,
    class: klass,
    style,
    on,
    ...commonProps
  } = data;

  if (props || Object.keys(commonProps).length) {
    Object.assign(element, { ...commonProps, ...props });
  }

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (on) {
    Object.entries(on).forEach(([key, value]) => {
      (element as any)["on" + key] = value;
    });
  }

  if (klass) {
    setClass(element, klass, id);
  }

  if (style) {
    setStyle(element, style, id);
  }
};

const createControllerRef = <C extends Controller, D>(
  parent: Context,
  id: string,
  blockBuilder: BlockBuilder<C, D>,
  data: D
) => {
  let block: Block<C>;
  return createRef(
    id,
    "element",
    (e) => {
      block = createBlock(blockBuilder, parent, data);
      block.mount(e);
      return () => block.controller;
    },
    () => {
      block.unmount();
    }
  );
};

const createBlock = <C extends Controller, D>(
  blockBuilder: BlockBuilder<C, D>,
  parent: Context | undefined,
  data: D
) => {
  let rootElement: Element;
  let mounted = false;
  let id = "";
  let block: Block<C>;
  let controller: C;
  const refs: Ref<() => any>[] = [];
  const effects: Effect[] = [];
  const onUnmount = new Set<VoidFunction>();

  const context: Context = {
    get id() {
      return id;
    },
    parent,
    on(signal: Signal | Signal[], listener?: Listener<any>): any {
      if (listener) {
        const isMultipleSignals = Array.isArray(signal);
        const signals = isMultipleSignals ? signal : [signal];
        const listenerWrapper =
          signals.length === 1
            ? () => {
                listener(signals[0].get());
              }
            : () => {
                const values = signals.map((signal) => signal.get());
                listener(isMultipleSignals ? values : values[0]);
              };
        const removeListeners = signals.map((signal) =>
          signal.on(listenerWrapper)
        );
        const removeListenerWrapper = () => {
          onUnmount.delete(removeListenerWrapper);
          removeListeners.forEach((x) => x());
          removeListeners.length = 0;
        };
        onUnmount.add(removeListenerWrapper);

        // first run
        listenerWrapper();

        return removeListenerWrapper;
      }
      const bind = (updater: Function) => {
        const id = generateRefId(context, refs.length);
        const cache = {};
        const ref = createRef(id, "attribute", (element) => {
          context.on(signal, (value) => {
            const data = updater(value, element, cache);
            if (!data) return;
            updateElement(element as HTMLElement, data, id);
          });
        });
        refs.push(ref);
        return ref;
      };

      const toggle = (reverse: boolean, transform?: Function) => {
        const id = generateRefId(context, refs.length);
        const toggle = createToggle(id, true, () => {
          context.on(signal, (value) => {
            let visible = transform ? transform(value) : value;
            if (reverse) visible = !visible;
            toggle.visible = visible;
          });
        });
        refs.push(toggle.ref);
        return toggle.ref;
      };

      return {
        bind,
        text(transform?: Function) {
          if (transform) {
            return bind((value: any) => ({ text: transform(value) }));
          }
          return bind((text: any) => ({ text }));
        },
        html(transform?: Function) {
          if (transform) {
            return bind((value: any) => ({ html: transform(value) }));
          }
          return bind((html: any) => ({ html }));
        },
        show(transform?: Function) {
          return toggle(false, transform);
        },
        hide(transform?: Function) {
          return toggle(true, transform);
        },
      };
    },
    use(...args: any[]): any {
      // is use(extensions[])
      if (Array.isArray(args[0])) {
        const extensions: Extension[] = args[0];
        return extensions.map((x) => x(context));
      }

      // is use(extension)
      const extension: Extension = args[0];
      return extension(context);
    },
    toggle(visible) {
      const id = generateRefId(context, refs.length);
      const toggle = createToggle(id, visible);
      refs.unshift(toggle.ref);
      return toggle;
    },
    list(blockBuilder: BlockBuilder, initialData?: any) {
      const id = generateRefId(context, refs.length);
      const list = createList(context, id, blockBuilder, initialData);
      refs.push(list.ref);
      return list;
    },
    effect(effect) {
      if (mounted) {
        throw new Error("Cannot use effect after block mounting");
      }
      effects.push(effect);
    },
    ref(...args: any[]): any {
      const id = generateRefId(context, refs.length);
      let ref: Ref<() => any>;
      if (!args.length) {
        // element ref
        ref = createRef(id, "attribute");
      } else if (typeof args[0] === "function") {
        ref = createControllerRef(context, id, args[0], args[1]);
      }
      // ref(updateProps)
      else if (args[0] && typeof args[0] === "object") {
        ref = createRef(id, "attribute", (element) => {
          updateElement(element as HTMLElement, args[0], id);
        });
      } else {
        throw new Error("Invalid ref");
      }
      refs.push(ref);
      return ref;
    },
  };

  block = {
    get rootElement() {
      return rootElement;
    },
    mount(templateElement) {
      if (templateElement.tagName !== "TEMPLATE") {
        throw new Error("Invalid element");
      }
      id = templateElement.getAttribute("data-ref") as string;
      // run block builder logic
      const result = blockBuilder(context, data);
      // block builder result can be string (a template) or block controller object
      let templateString: string;
      if (typeof result === "string") {
        templateString = result;
        controller = {} as C;
      } else {
        templateString = result.template;
        controller = result;
      }
      rootElement = createTemplate(templateElement, templateString).clone();
      templateElement.before(rootElement);
      templateElement.remove();
      mounted = true;
      mountRefs(rootElement, refs);
      // call all effects
      effects.forEach((effect) => {
        const unmountHandler = effect(context);
        if (unmountHandler) onUnmount.add(unmountHandler);
      });
    },
    unmount() {
      rootElement.remove();
      refs.forEach((ref) => ref.unmount());
      onUnmount.forEach((x) => x());
    },
    get controller() {
      return controller;
    },
  };

  return block;
};

export type Render = {
  <H extends Controller, D>(
    container: Element,
    blockBuilder: BlockBuilder<H, D>,
    data: D
  ): H;
  <H extends Controller>(container: Element, blockBuilder: BlockBuilder<H>): H;
};

export const render: Render = (
  container: Element,
  blockBuilder: BlockBuilder,
  param?: any
) => {
  container.innerHTML = generateTemplateHTML("root");
  const block = createBlock(blockBuilder, undefined, param);
  block.mount(container.firstElementChild!);
  return block.controller;
};

export const html = (template: TemplateStringsArray, ...args: any[]) =>
  String.raw(template, ...args);

export const signal = createSignal;
