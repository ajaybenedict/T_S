import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[s1EllipsisTooltip]',
})
/**
 * Adds a native browser tooltip (via the `title` attribute) only when the host element's
 * text is visually truncated with an ellipsis.
 *
 * Rationale:
 * - Avoids showing tooltips for short/fully-visible values.
 * - Uses the built-in browser tooltip for minimal UI impact.
 * - Computes tooltip content from `textContent` (plain text) to avoid HTML in tooltips.
 */
export class EllipsisTooltipDirective implements AfterViewInit, OnDestroy {
  private static readonly TRUNCATION_TOLERANCE_PX = 0.1;
  private static readonly NEAR_BOUNDARY_PX = 1;
  private static readonly DOM_MEASURE_TOLERANCE_PX = 0.01;

  private rafId: number | null = null;
  private textMeasureContext: CanvasRenderingContext2D | null = null;
  private isViewInitialized = false;
  private _enabled = true;

  /**
   * Allows callers to disable tooltip calculations for non-critical/high-volume cells.
   * Enabled by default to preserve behavior for existing usages.
   */
  @Input()
  set s1EllipsisTooltip(value: boolean) {
    this._enabled = value;

    if (!this._enabled) {
      const element = this.elementRef.nativeElement;
      this.renderer.removeAttribute(element, 'title');
      if (this.rafId != null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      return;
    }

    if (this.isViewInitialized) {
      this.scheduleUpdate();
    }
  }

  get s1EllipsisTooltip(): boolean {
    return this._enabled;
  }

  /**
   * Recompute tooltip when host text value changes from template bindings.
   * Used to keep updates deterministic and avoid observer overhead.
   */
  @Input()
  set s1EllipsisTooltipTrigger(_: unknown) {
    if (this.isViewInitialized) {
      this.scheduleUpdate();
    }
  }

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  /**
   * Schedules an initial measurement after the view has painted, so width-based truncation
   * checks are reliable.
   */
  ngAfterViewInit(): void {
    this.isViewInitialized = true;

    if (!this.s1EllipsisTooltip) {
      return;
    }

    // Ensure the DOM has painted before measuring.
    this.scheduleUpdate();
  }

  /** Cancels any pending animation frame callbacks. */
  ngOnDestroy(): void {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  /** Updates `title` when the user hovers/focuses the element (fallback to keep it accurate). */
  updateTitleOnEnter(): void {
    if (!this.s1EllipsisTooltip) {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'title');
      return;
    }

    this.updateTitle();
  }

  /**
   * Defers measurement to the next animation frame to avoid layout thrashing and ensure
   * the DOM has settled after rendering.
   */
  private scheduleUpdate(): void {
    if (!this.s1EllipsisTooltip) {
      return;
    }

    if (this.rafId != null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateTitle();
    });
  }

  /**
   * Sets the `title` attribute only when the content is truncated.
   *
   * Truncation detection: `scrollWidth > clientWidth`.
   * Tooltip content: normalized plain text from `textContent`.
   */
  private updateTitle(): void {
    const element = this.elementRef.nativeElement;

    if (!this.s1EllipsisTooltip) {
      this.renderer.removeAttribute(element, 'title');
      return;
    }

    // If the element isn't measurable (e.g., display:none), don't show a tooltip.
    if (!element || element.clientWidth <= 0) {
      this.renderer.removeAttribute(element, 'title');
      return;
    }

    const isTruncated = this.isTruncated(element);
    if (!isTruncated) {
      this.renderer.removeAttribute(element, 'title');
      return;
    }

    const text = (element.textContent ?? '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      this.renderer.removeAttribute(element, 'title');
      return;
    }

    this.renderer.setAttribute(element, 'title', text);
  }

  /**
   * Determines whether the element's content is visually truncated.
   *
   * Primary signal: `scrollWidth > clientWidth`.
   * Fallback: measure text width using computed font (handles sub-pixel rounding edge cases).
   */
  private isTruncated(element: HTMLElement): boolean {
    if (!this.s1EllipsisTooltip) {
      return false;
    }

    if (element.scrollWidth > element.clientWidth) return true;

    const availableWidth = this.getAvailableTextWidth(element);
    if (availableWidth <= 0) return false;

    const hasEllipsisStyle = this.hasEllipsisStyle(element);

    if (this.isFirstChildTruncated(element, availableWidth, hasEllipsisStyle)) return true;

    const text = this.getNormalizedTextContent(element);
    if (!text) return false;

    if (this.isTextWidthTruncated(element, text, availableWidth, hasEllipsisStyle)) return true;
    if (!hasEllipsisStyle) return false;

    return this.isDomFallbackTruncated(element, text, availableWidth);
  }

  private getNormalizedTextContent(element: HTMLElement): string {
    return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  private isFirstChildTruncated(element: HTMLElement, availableWidth: number, hasEllipsisStyle: boolean): boolean {
    // If the actual text is wrapped in a child element (common with [innerHTML]),
    // compare the child's rendered width against the wrapper width.
    const firstChild = element.firstElementChild as HTMLElement | null;
    if (!firstChild) return false;

    if (firstChild.scrollWidth > availableWidth) return true;

    const childRectWidth = firstChild.getBoundingClientRect().width;
    if (childRectWidth - availableWidth > EllipsisTooltipDirective.TRUNCATION_TOLERANCE_PX) return true;

    // Near-boundary fallback: when ellipsis styling is active, treat as truncated if the
    // child is within ~1px of the available width. This catches sub-pixel rounding cases.
    return hasEllipsisStyle && childRectWidth >= availableWidth - EllipsisTooltipDirective.NEAR_BOUNDARY_PX;
  }

  private isTextWidthTruncated(
    element: HTMLElement,
    text: string,
    availableWidth: number,
    hasEllipsisStyle: boolean,
  ): boolean {
    // If scrollWidth/clientWidth are equal, the browser may still show ellipsis due to
    // sub-pixel rounding. Fall back to text measurement.
    const measuredWidth = this.measureTextWidth(element, text);
    if (measuredWidth - availableWidth > EllipsisTooltipDirective.TRUNCATION_TOLERANCE_PX) return true;

    // Heuristic: if ellipsis styling is active and we're at/near the boundary,
    // treat it as truncated to avoid missing native tooltip in edge cases.
    return hasEllipsisStyle && measuredWidth >= availableWidth - EllipsisTooltipDirective.NEAR_BOUNDARY_PX;
  }

  private isDomFallbackTruncated(element: HTMLElement, text: string, availableWidth: number): boolean {
    // Final fallback: measure rendered text width using a DOM Range.
    // This is more accurate in some browsers/layouts than scrollWidth/clientWidth.
    const renderedWidth = this.measureRenderedTextWidth(element);
    if (renderedWidth > 0 && renderedWidth - availableWidth > EllipsisTooltipDirective.TRUNCATION_TOLERANCE_PX) {
      return true;
    }

    // Last resort: measure text using an off-screen element with the same font/letter-spacing.
    // This captures browser-specific glyph metrics (kerning/rounding) that canvas/range can miss.
    const domMeasuredWidth = this.measureTextWidthWithDom(element, text);
    return (
      domMeasuredWidth > 0 &&
      domMeasuredWidth - availableWidth > EllipsisTooltipDirective.DOM_MEASURE_TOLERANCE_PX
    );
  }

  /**
   * Measures rendered text width inside the element using a DOM Range.
   * Returns 0 when measurement isn't possible.
   */
  private measureRenderedTextWidth(element: HTMLElement): number {
    if (typeof document === 'undefined' || typeof Range === 'undefined') return 0;
    try {
      const range = document.createRange();
      range.selectNodeContents(element);
      const rect = range.getBoundingClientRect();
      return rect.width;
    } catch (error) {
      // Ignore measurement errors; tooltip will simply not be shown.
      // Log for diagnostics (this should not break the UI).
      // eslint-disable-next-line no-console
      console.debug('[EllipsisTooltipDirective] Range measurement failed', error);
      return 0;
    }
  }

  /**
   * Measures text width by rendering it into a hidden span that mirrors the element's text styles.
   * Returns 0 when measurement isn't possible.
   */
  private measureTextWidthWithDom(element: HTMLElement, text: string): number {
    if (typeof document === 'undefined') return 0;
    if (!text) return 0;

    // Prefer the first child element's styles if present (it may define the actual font).
    const styleSource = (element.firstElementChild as HTMLElement | null) ?? element;
    const computed = getComputedStyle(styleSource);

    const probe = document.createElement('span');
    probe.textContent = text;

    // Keep it out of layout flow and invisible, but measurable.
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'nowrap';
    probe.style.top = '-9999px';
    probe.style.left = '-9999px';

    // Mirror relevant text metrics.
    probe.style.font = computed.font;
    probe.style.letterSpacing = computed.letterSpacing;
    probe.style.textTransform = computed.textTransform;

    try {
      document.body.appendChild(probe);
      return probe.getBoundingClientRect().width;
    } catch (error) {
      // Ignore measurement errors; tooltip will simply not be shown.
      // Log for diagnostics (this should not break the UI).
      // eslint-disable-next-line no-console
      console.debug('[EllipsisTooltipDirective] DOM measurement failed', error);
      return 0;
    } finally {
      probe.remove();
    }
  }

  private hasEllipsisStyle(element: HTMLElement): boolean {
    const style = getComputedStyle(element);
    return (
      style.textOverflow === 'ellipsis' &&
      style.whiteSpace === 'nowrap' &&
      (style.overflowX === 'hidden' || style.overflow === 'hidden')
    );
  }

  /** Returns content-box width available for text (clientWidth minus horizontal padding). */
  private getAvailableTextWidth(element: HTMLElement): number {
    const style = getComputedStyle(element);
    const paddingLeft = Number.parseFloat(style.paddingLeft || '0') || 0;
    const paddingRight = Number.parseFloat(style.paddingRight || '0') || 0;
    return element.clientWidth - paddingLeft - paddingRight;
  }

  /** Measures text width using the element's computed font. */
  private measureTextWidth(element: HTMLElement, text: string): number {
    const context = this.getTextMeasureContext();
    if (!context) return 0;

    const style = getComputedStyle(element);
    // `font` is the most reliable shorthand to match rendering.
    context.font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return context.measureText(text).width;
  }

  private getTextMeasureContext(): CanvasRenderingContext2D | null {
    if (this.textMeasureContext) return this.textMeasureContext;
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    this.textMeasureContext = context;
    return context;
  }
}
