type Item = {
    id: string | number;
    parent: string | number | null;
    label: string;
  };
  
  type HistoryEntry = {
    action: 'add' | 'remove' | 'update';
    item: Item;
    previousItem?: Item;
  };
  
  class TreeStore {
    private items: Map<string | number, Item> = new Map();
    private history: HistoryEntry[] = [];
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
      this.saveHistory({ action: 'add', item });
      this.items.set(item.id, item);
    }
  
    removeItem(id: string | number): void {
      const removedItems = [this.getItem(id), ...this.getAllChildren(id).map(child => this.getItem(child.id))].filter(Boolean) as Item[];
      removedItems.forEach(item => this.saveHistory({ action: 'remove', item }));
      removedItems.forEach(item => this.items.delete(item.id));
    }
  
    updateItem(updatedItem: Item): void {
      const previousItem = this.getItem(updatedItem.id);
      if (previousItem) {
        this.saveHistory({ action: 'update', item: updatedItem, previousItem });
        this.items.set(updatedItem.id, updatedItem);
      }
    }
  
    private saveHistory(entry: HistoryEntry): void {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(entry);
      this.historyIndex++;
    }
  
    undo(): void {
      if (this.historyIndex >= 0) {
        const lastAction = this.history[this.historyIndex];
        this.historyIndex--;
        
        switch (lastAction.action) {
          case 'add':
            this.items.delete(lastAction.item.id);
            break;
          case 'remove':
            this.items.set(lastAction.item.id, lastAction.item);
            break;
          case 'update':
            if (lastAction.previousItem) {
              this.items.set(lastAction.previousItem.id, lastAction.previousItem);
            }
            break;
        }
      }
    }
  
    redo(): void {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        const redoAction = this.history[this.historyIndex];
        
        switch (redoAction.action) {
          case 'add':
            this.items.set(redoAction.item.id, redoAction.item);
            break;
          case 'remove':
            this.items.delete(redoAction.item.id);
            break;
          case 'update':
            this.items.set(redoAction.item.id, redoAction.item);
            break;
        }
      }
    }
  }
  
  export default TreeStore;
  