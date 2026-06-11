import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-s1-breadcrumb',
  templateUrl: './s1-breadcrumb.component.html',
  styleUrls: ['./s1-breadcrumb.component.css']
})
export class S1BreadcrumbComponent implements OnChanges {
  /**
   * Breadcrumb items as a `$`-delimited string.
   * Example: `Nav1$Nav2$Nav3`.
   */
  @Input() inputData: string | null = null;

  /**
   * Optional CSS color value to override the breadcrumb button text color.
   * When omitted, the component uses the current default styles.
   *
   * Examples: `#262626`, `rgb(0,0,0)`, `var(--some-token)`.
   */
  @Input() buttonTextColor: string | null = null;

  crumbList: string[] = [];
  upperBound = -1;

  ngOnChanges(): void {
    const parts = (this.inputData ?? '')
      .split('$')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    this.crumbList = parts;
    this.upperBound = this.crumbList.length - 1;
  }
}
