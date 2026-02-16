---
name: serviceLayer
description: Angular standards for data persistence using Async Storage, Signals for state, and User Message feedback.
---
# Service Layer Guidelines (Angular Renaissance)

## File Location & Structure
- **Location**: Place all services in `src/app/services/`.
- **Naming**: Use `.service.ts` suffix (e.g., `automation.service.ts`).
- **Testing**: Create a corresponding `.spec.ts` file using Jasmine/Karma or Vitest.

## Service Pattern (Injectable Singletons)
Services MUST be classes using the `@Injectable` decorator. Use Signals for reactive state.

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  private storage = inject(AsyncStorageService);
  private msg = inject(UserMsgService);

  // Private state signal
  private _items_ = signal<Item[]>([]);
  // Public readonly exposure
  readonly items_ = this._items_.asReadonly();

  async loadItems() {
    try {
      const data = await this.storage.query<Item>('items_db');
      this._items_.set(data);
    } catch (err) {
      this.msg.onSetErrorMsg('Failed to load data');
    }
  }
}