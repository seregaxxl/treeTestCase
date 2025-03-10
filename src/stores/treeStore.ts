type Item = {
    id: string | number;
    parent: string | number | null;
    label: string;
  };
  
  class TreeStore {
    private items: Map<string | number, Item> = new Map();
    private history: Item[][] = [];
    private historyIndex: number = -1;
  
    constructor(items: Item[]) {
      items.forEach((item) => this.items.set(item.id, item));
    }
  
    getAll(): Item[] {
      return Array.from(this.items.values());
    }
  
    getItem(id: string | number): Item | undefined {
      return this.items.get(id);
    }
  
    getChildren(id: string | number): Item[] {
      return this.getAll().filter((item) => item.parent === id);
    }
  
    getAllChildren(id: string | number): Item[] {
      const children: Item[] = [];
      const stack = this.getChildren(id);
      while (stack.length) {
        const item = stack.pop()!;
        children.push(item);
        stack.push(...this.getChildren(item.id));
      }
      return children;
    }
  
    getAllParents(id: string | number): Item[] {
      const parents: Item[] = [];
      let current = this.getItem(id);
      while (current && current.parent !== null) {
        current = this.getItem(current.parent);
        if (current) parents.push(current);
      }
      return parents;
    }
  
    addItem(item: Item): void {
      this.saveHistory();
      this.items.set(item.id, item);
    }
  
    removeItem(id: string | number): void {
      this.saveHistory();
      const toRemove = [id, ...this.getAllChildren(id).map((child) => child.id)];
      toRemove.forEach((removeId) => this.items.delete(removeId));
    }
  
    updateItem(updatedItem: Item): void {
      if (this.items.has(updatedItem.id)) {
        this.saveHistory();
        this.items.set(updatedItem.id, updatedItem);
      }
    }
  
    private saveHistory(): void {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(this.getAll());
      this.historyIndex++;
    }
  
    undo(): void {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.items = new Map(this.history[this.historyIndex].map((item) => [item.id, item]));
      }
    }
  
    redo(): void {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.items = new Map(this.history[this.historyIndex].map((item) => [item.id, item]));
      }
    }
  }
  
  export default TreeStore;
  