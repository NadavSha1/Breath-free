// Mock entities to replace Base44 SDK entities
// Using localStorage for data persistence in standalone mode

class MockEntity {
  constructor(entityName) {
    this.entityName = entityName;
    this.storageKey = `mock_${entityName.toLowerCase()}`;
  }

  _getStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${this.entityName} from storage:`, error);
      return [];
    }
  }

  _setStorage(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${this.entityName} to storage:`, error);
    }
  }

  async create(data) {
    const items = this._getStorage();
    const newItem = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    items.push(newItem);
    this._setStorage(items);
    return newItem;
  }

  async findAll(options = {}) {
    let items = this._getStorage();
    
    // Apply basic filtering
    if (options.where) {
      items = items.filter(item => {
        return Object.entries(options.where).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    // Apply sorting
    if (options.orderBy) {
      const [field, direction = 'asc'] = options.orderBy.split(' ');
      items.sort((a, b) => {
        if (direction === 'desc') {
          return b[field] > a[field] ? 1 : -1;
        }
        return a[field] > b[field] ? 1 : -1;
      });
    }

    // Apply limit
    if (options.limit) {
      items = items.slice(0, options.limit);
    }

    return items;
  }

  async findById(id) {
    const items = this._getStorage();
    return items.find(item => item.id === id) || null;
  }

  async update(id, data) {
    const items = this._getStorage();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`${this.entityName} not found`);
    }

    items[index] = {
      ...items[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    this._setStorage(items);
    return items[index];
  }

  async delete(id) {
    const items = this._getStorage();
    const filteredItems = items.filter(item => item.id !== id);
    this._setStorage(filteredItems);
    return true;
  }
}

// Create entity instances
export const SmokingEntry = new MockEntity('SmokingEntry');
export const CravingEntry = new MockEntity('CravingEntry');
export const Achievement = new MockEntity('Achievement');
export const GoalHistory = new MockEntity('GoalHistory');