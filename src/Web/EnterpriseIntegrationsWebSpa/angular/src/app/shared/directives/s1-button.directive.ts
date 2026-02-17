import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[s1-button]',
})
export class S1ButtonDirective implements OnChanges {
  /**
   * Button style type for text buttons.
   * - 'primary' | 'secondary' | 'secondary-filled' | 'tertiary'
   * Ignored if `iconOnly` is true.
   */
  @Input() btnType: 'primary' | 'secondary' | 'secondary-filled' | 'tertiary' = 'primary';

  /**
   * Make button take full width of container.
   */
  @Input() fullWidth = false;

  /**
   * Disable the button.
   */
  @Input() disabled = false;

  /**
   * If true, renders an icon-only button with 0 padding.
   */
  @Input() iconOnly = false;

  /**
   * Extra custom classes for styling overrides.
   */
  @Input() customClass: string | string[] = '';

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) this.applyClasses();
  }

  private applyClasses(): void {
    const element = this.el.nativeElement;
    
    // Remove all existing classes
    [...element.classList].forEach(cls => this.renderer.removeClass(element, cls));

    // Add base + computed classes
    const newClasses = ['s1-btn', ...this.getClasses()];
    newClasses.forEach(cls => this.renderer.addClass(element, cls));

    // Sync native disabled attribute if it's a button
    if (element.tagName === 'BUTTON') {
      this.renderer.setProperty(element, 'disabled', this.disabled);
    }
  }

  private getClasses(): string[] {
    const classes: string[] = [];
    if (this.iconOnly) classes.push('s1-btn-icon');
    else if (this.btnType) classes.push('s1-btn-' + this.btnType);

    if (this.fullWidth) classes.push('s1-btn-full');
    if (this.disabled) classes.push('s1-disabled');

    if (this.customClass) {
      if (Array.isArray(this.customClass)) {
        classes.push(...this.customClass);
      } else {
        classes.push(this.customClass);
      }
    }
    return classes;
  }
}

/* Example usage in a parent component */

/*
 * Primary 
 * <button type="button" s1-button btnType="primary" (click)="onSave()">Save</button>

 * With your customized styles 
 * <button type="button" s1-button btnType="primary" [customClass]="'my-special-btn'" (click)="onSave()">Save</button>

 * Disabled
 * <button type="button" s1-button btnType="primary" [disabled]="true" (click)="onSave()">Save</button>

 * Full width
 * <button type="button" s1-button btnType="primary" fullWidth (click)="onSubmit()">Submit</button>

 * Icons
 * <button s1-button iconOnly (click)="onRefresh()">
    <img src="assets/icons/refresh.svg" class="default" alt="refresh" />
    <img src="assets/icons/refresh-hover.svg" class="hover" alt="refresh hover" />
  </button>
 
 * */
