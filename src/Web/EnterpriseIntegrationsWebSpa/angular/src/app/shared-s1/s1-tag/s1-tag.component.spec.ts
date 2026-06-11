import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1TagComponent } from './s1-tag.component';

describe('S1TagComponent', () => {
  let component: S1TagComponent;
  let fixture: ComponentFixture<S1TagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1TagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1TagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose default input values', () => {
    expect(component.value).toBe('');
    expect(component.color).toBe('Teal');
  });

  it('should render provided value and color utility classes', () => {
    component.value = 'High Risk';
    component.color = 'Sunset';
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    const label = fixture.nativeElement.querySelector('span') as HTMLSpanElement;

    expect(label.textContent?.trim()).toBe('High Risk');
    expect(container.className).toContain('s1-border-all-1px-Sunset');
    expect(label.className).toContain('s1-C-Sunset');
  });
});
