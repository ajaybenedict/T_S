import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  Type
} from '@angular/core';

import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';
import {
  RemoteCheckboxInstance, ExtendedComponentReference
} from 'src/app/interface/host-component-ref.interface';
import {
  CheckBox,
  CheckboxGroup,
  CheckboxValue
} from 'src/app/interface/button.interface';

interface RemoteCheckboxModule {
  S1FlatCheckboxComponent?: Type<unknown>;
  S1GroupCheckboxComponent?: Type<unknown>;
}

@Component({
  selector: 'app-host-checkbox',
  templateUrl: './host-checkbox.component.html',
})
export class HostCheckboxComponent
  implements AfterViewInit, OnChanges, OnDestroy {

  public static readonly loadRemoteModuleFn = loadRemoteModule;

  // Cache loaded remote modules
  private static readonly moduleCache =
    new Map<string, RemoteCheckboxModule>();

  @ViewChild('checkboxContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  @Input() checkboxesValue: CheckboxValue = [];

  @Input() checkboxType: 'checkbox' | 'groupcheckbox' = 'checkbox';

  @Output() checkboxesChange =
    new EventEmitter<CheckboxValue>();


  private compRefs: ExtendedComponentReference[] = [];

  private previousCheckboxType: string | null = null;

  private isInitialized = false;

  private loading = false;

  // Prevent stale async renders
  private loadVersion = 0;

  constructor(
    private readonly cdr: ChangeDetectorRef
  ) { }

  async ngAfterViewInit(): Promise<void> {
    await this.loadRemote();

    this.previousCheckboxType = this.checkboxType;

    this.isInitialized = true;

    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {

    // Handle checkbox type changes
    if (changes['checkboxType'] && this.container) {

      const newType =
        changes['checkboxType'].currentValue;

      if (newType !== this.previousCheckboxType) {

        this.previousCheckboxType = newType;

        void this.loadRemote();

        return;
      }
    }

    // Handle value changes
    if (
      changes['checkboxesValue'] &&
      this.isInitialized &&
      this.compRefs.length
    ) {
      this.updateRemote();
    }
  }

  private async loadRemote(): Promise<void> {

    if (!this.container || this.loading) {
      return;
    }

    const currentVersion = ++this.loadVersion;

    this.loading = true;

    this.cleanup();

    try {

      const cacheKey = this.checkboxType;

      let module =
        HostCheckboxComponent.moduleCache.get(cacheKey);

      if (!module) {

        module =
          await HostCheckboxComponent.loadRemoteModuleFn({
            type: 'module',
            remoteEntry: REMOTE_ENTRY_URL,
            exposedModule: `./${this.checkboxType}`,
          }) as RemoteCheckboxModule;

        HostCheckboxComponent.moduleCache.set(
          cacheKey,
          module
        );
      }

      // Ignore stale async responses
      if (currentVersion !== this.loadVersion) {
        return;
      }

      const RemoteCheckbox =
        this.checkboxType === 'checkbox'
          ? module.S1FlatCheckboxComponent
          : module.S1GroupCheckboxComponent;

      if (!RemoteCheckbox) {
        throw new Error(
          `Remote component missing for ${this.checkboxType}`
        );
      }

      // GROUP CHECKBOX
      if (
        this.checkboxType === 'groupcheckbox' &&
        Array.isArray(this.checkboxesValue)
      ) {

        this.compRefs =
          (this.checkboxesValue as CheckboxGroup[])
            .map((group: CheckboxGroup, index: number) => {

              const compRef =
                this.container.createComponent(
                  RemoteCheckbox as Type<unknown>
                ) as ExtendedComponentReference;

              compRef.setInput('inputData', group);

              const instance =
                compRef.instance as RemoteCheckboxInstance;

              const sub =
                instance.checked?.subscribe(
                  (selected: unknown) => {

                    const selectedGroup =
                      selected as CheckboxGroup;

                    const updatedArray = [
                      ...(this.checkboxesValue as CheckboxGroup[])
                    ];

                    updatedArray[index] = selectedGroup;

                    this.checkboxesChange.emit(updatedArray);
                  }
                );

              if (sub) {
               compRef.__sub = sub;
              }

              return compRef;
            });

      } else {

        // FLAT CHECKBOX
        const compRef: ExtendedComponentReference =
          this.container.createComponent(
            RemoteCheckbox as Type<unknown>
          ) as ExtendedComponentReference;

        const instance =
          compRef.instance as RemoteCheckboxInstance;

        const sub =
          instance.checked?.subscribe(
            (selected: unknown) => {
              const selectedItems =
                selected as CheckBox[];

              this.checkboxesChange.emit([
                ...selectedItems
              ]);
            }
          );

       

        if (sub) {
          compRef.__sub = sub;
        }

        this.compRefs = [compRef];
      }

      this.updateRemote();

    } catch (error) {

      console.error(
        'Error loading remote checkbox component:',
        error
      );

    } finally {

      this.loading = false;
    }
  }

  private updateRemote(): void {

    if (!this.compRefs.length) {
      return;
    }

    try {

      // GROUP CHECKBOX
      if (
        this.checkboxType === 'groupcheckbox' &&
        Array.isArray(this.checkboxesValue)
      ) {

        this.compRefs.forEach(
          (ref: ExtendedComponentReference, index: number) => {

            const groupData =
              (this.checkboxesValue as CheckboxGroup[])[index];

            if (groupData) {

              ref.setInput('inputData', groupData);

              ref.changeDetectorRef.detectChanges();
            }
          });

      } else {

        // FLAT CHECKBOX
        const ref = this.compRefs[0];

        const itemsData =
          Array.isArray(this.checkboxesValue)
            ? [...(this.checkboxesValue as CheckBox[])]
            : [];

        if (ref) {

          ref.setInput('inputData', itemsData);

          ref.changeDetectorRef.detectChanges();
        }
      }

    } catch (error) {

      console.error(
        'Error updating remote component:',
        error
      );
    }
  }

  private cleanup(): void {

    this.compRefs.forEach(
      (ref: ExtendedComponentReference) => {
        ref.__sub?.unsubscribe?.();
        ref.destroy();
      });

    this.compRefs = [];
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}