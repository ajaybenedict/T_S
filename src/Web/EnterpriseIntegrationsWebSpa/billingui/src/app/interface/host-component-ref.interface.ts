import { Observable, Subscription } from 'rxjs';

// Remote component instance interface (typed as RxJS Observable)
export interface RemoteCheckboxInstance<T = unknown> {
  checked?: Observable<T>;
  inputData?: unknown;
}

// Generic component reference
export interface ComponentReference<TInstance = unknown> {
  setInput: (key: string, value: unknown) => void;
  changeDetectorRef: {
    detectChanges: () => void;
  };
  destroy: () => void;
  instance: TInstance;
}

// Extended reference with subscription tracking
export interface ExtendedComponentReference<T = unknown>
  extends ComponentReference<T> {
  __sub?: Subscription;
}