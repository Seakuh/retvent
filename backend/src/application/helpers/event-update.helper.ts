export class EventUpdateHelper {
  static getChangedFields(original: any, updates: any): Partial<any> {
    const changes: Partial<any> = {};

    Object.keys(updates).forEach((key) => {
      // Skip if field is undefined
      if (updates[key] === undefined) return;

      // Deep comparison for objects
      if (typeof updates[key] === 'object' && updates[key] !== null) {
        if (JSON.stringify(updates[key]) !== JSON.stringify(original[key])) {
          changes[key] = updates[key];
        }
      }
      // Simple comparison for primitives
      else if (updates[key] !== original[key]) {
        changes[key] = updates[key];
      }
    });

    // Always set updatedAt
    changes.updatedAt = new Date();

    return changes;
  }
}
