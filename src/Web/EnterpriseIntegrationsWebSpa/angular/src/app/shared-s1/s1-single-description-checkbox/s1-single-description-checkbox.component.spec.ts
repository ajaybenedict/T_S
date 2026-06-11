import { ComponentFixture, TestBed } from '@angular/core/testing';

import { S1DescriptionCheckbox } from 'src/app/models/s1/s1-filter-checkbox.interface';

import { S1SingleDescriptionCheckboxComponent } from './s1-single-description-checkbox.component';

describe('S1SingleDescriptionCheckboxComponent', () => {
  let component: S1SingleDescriptionCheckboxComponent;
  let fixture: ComponentFixture<S1SingleDescriptionCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [S1SingleDescriptionCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1SingleDescriptionCheckboxComponent);
    component = fixture.componentInstance;
    component.inputData = [
      {
        displayName: 'Option A',
        key: 'a',
        checked: false,
        description: 'A description'
      },
      {
        displayName: 'Option B',
        key: 'b',
        checked: false,
        description: 'B description'
      },
      {
        displayName: 'Option C',
        key: 'c',
        checked: false,
        description: 'C description'
      }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select only the clicked option', () => {
    component.toggle({
      displayName: 'Option B',
      key: 'b',
      checked: true,
    });

    const selected = component.inputData.filter(item => item.checked);
    expect(selected.length).toBe(1);
    expect(selected[0].key).toBe('b');
  });

  it('should deselect previously selected option when another option is selected', () => {
    component.toggle({
      displayName: 'Option A',
      key: 'a',
      checked: true,
    });

    component.toggle({
      displayName: 'Option C',
      key: 'c',
      checked: true,
    });

    const selected = component.inputData.filter(item => item.checked);
    expect(selected.length).toBe(1);
    expect(selected[0].key).toBe('c');
    expect(component.inputData.find(item => item.key === 'a')?.checked).toBeFalse();
  });

  it('should allow deselecting the active option', () => {
    component.toggle({
      displayName: 'Option A',
      key: 'a',
      checked: true,
    });

    component.toggle({
      displayName: 'Option A',
      key: 'a',
      checked: false,
    });

    expect(component.inputData.every(item => !item.checked)).toBeTrue();
  });

  it('should emit checked output with updated state', () => {
    spyOn(component.checked, 'emit');

    component.toggle({
      displayName: 'Option B',
      key: 'b',
      checked: true,
    });

    expect(component.checked.emit).toHaveBeenCalledWith(component.inputData);
  });

  it('should do nothing for invalid input', () => {
    const originalState: S1DescriptionCheckbox[] = component.inputData.map(item => ({ ...item }));

    component.toggle(null as unknown as S1DescriptionCheckbox);

    expect(component.inputData).toEqual(originalState);
  });
});
