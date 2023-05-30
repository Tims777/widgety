const quickActions = {
  select: {
    key: " ",
  },
  enter: {
    key: "Enter",
  },
  exit: {
    key: "Escape",
  },
  left: {
    key: "ArrowLeft",
  },
  right: {
    key: "ArrowRight",
  },
  up: {
    key: "ArrowUp",
  },
  down: {
    key: "ArrowDown",
  },
  increase: {
    key: "+",
  },
  decrease: {
    key: "-",
  },
} as const;

const quickClassPrefix = "quick-";

enum KeyModifier {
  alt = "alt",
  shift = "shift",
  ctrl = "ctrl",
  meta = "meta",
}

function makeFocusable(element: HTMLElement, autofocus: boolean) {
  element.tabIndex = 0;
  if (autofocus) {
    const defaultElements = element.getElementsByClassName("quick-default");
    if (defaultElements.length && defaultElements[0] instanceof HTMLElement) {
      defaultElements[0].focus();
    } else {
      element.focus();
    }
  }
}

function attachListeners(element: HTMLElement, quick: Quick) {
  element.onkeydown = (event) => {
    const handled = quick.handleKeyDown(event.key, {
      alt: event.altKey,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    });
    if (handled) {
      event.preventDefault();
      return false;
    }
  };
}

function* iterate<T>(collection: { length: number; [index: number]: T }) {
  for (let i = 0; i < collection.length; i++) {
    yield collection[i];
  }
}

function getQuickActions(classList: DOMTokenList) {
  return [...iterate(classList)]
    .filter((c) => c.startsWith(quickClassPrefix))
    .map((c) => c.substring(quickClassPrefix.length))
    .filter((c) => c in quickActions)
    .map((c) => quickActions[c as keyof typeof quickActions]);
}

function buildNavigationTree(element: HTMLElement) {
  let tree: NavigationTree = {};
  for (const child of [...iterate(element.children)]) {
    if (child instanceof HTMLElement) {
      // child.tabIndex = -1;
      for (const action of getQuickActions(child.classList)) {
        tree[action.key] = child;
      }
      tree = { ...tree, ...buildNavigationTree(child) };
    }
  }
  return tree;
}

type NavigationTree = Record<string, HTMLElement>;

export default class Quick {
  private root: HTMLElement;

  private tree: NavigationTree;

  constructor(root: HTMLElement, autofocus: boolean = true) {
    this.root = root;
    makeFocusable(root, autofocus);
    attachListeners(root, this);
    this.tree = buildNavigationTree(root);
  }

  public rebuildNavigationTree() {
    this.tree = buildNavigationTree(this.root);
  }

  public handleKeyDown(key: string, modifiers: Record<KeyModifier, boolean>) {
    if (key in this.tree) {
      this.tree[key].focus();
      this.tree[key].click();
      return true;
    }
    return false;
  }
}
