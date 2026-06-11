import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { S1SearchBarComponent } from './s1-search-bar.component';
import { InputFilterDirective } from 'src/app/shared/directives/validators/input-filter.directive';

describe('S1SearchBarComponent', () => {
  let component: S1SearchBarComponent;
  let fixture: ComponentFixture<S1SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [S1SearchBarComponent, InputFilterDirective],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputFilter property', () => {
    it('should have inputFilter as optional with no default value', () => {
      expect(component.inputFilter).toBeUndefined();
    });

    it('should accept inputFilter value when provided', () => {
      component.inputFilter = 'numeric';
      fixture.detectChanges();
      expect(component.inputFilter).toBe('numeric');
    });

    it('should accept different inputFilter modes', () => {
      const modes = ['numeric', 'decimal', 'alpha', 'alphanumeric', 'emailchars', 'alphanumerichyphen'] as const;
      modes.forEach(mode => {
        component.inputFilter = mode;
        fixture.detectChanges();
        expect(component.inputFilter).toBe(mode);
      });
    });

    it('should allow undefined inputFilter to disable restrictions', () => {
      component.inputFilter = undefined;
      fixture.detectChanges();
      expect(component.inputFilter).toBeUndefined();
    });

    it('should prevent alphabetic keydown when numeric filter is enabled', () => {
      component.inputFilter = 'numeric';
      fixture.detectChanges();

      const input: HTMLInputElement | null = fixture.nativeElement.querySelector('.input-field');
      expect(input).toBeTruthy();

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = spyOn(event, 'preventDefault').and.callThrough();

      input?.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent alphabetic keydown when filter is not provided', () => {
      component.inputFilter = undefined;
      fixture.detectChanges();

      const input: HTMLInputElement | null = fixture.nativeElement.querySelector('.input-field');
      expect(input).toBeTruthy();

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = spyOn(event, 'preventDefault').and.callThrough();

      input?.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should initialize with default placeholder when not provided', () => {
      component.inputData = {} as any;
      component.ngOnInit();
      expect(component.placeHolder).toBe('Search');
    });

    it('should use custom placeholder when provided', () => {
      component.inputData = { placeHolder: 'Enter ID' } as any;
      component.ngOnInit();
      expect(component.placeHolder).toBe('Enter ID');
    });

    it('should initialize with default height and width', () => {
      component.inputData = {} as any;
      component.ngOnInit();
      expect(component.height).toBe('100%');
      expect(component.width).toBe('100%');
    });

    it('should use custom height and width when provided', () => {
      component.inputData = { height: '50px', width: '300px' } as any;
      component.ngOnInit();
      expect(component.height).toBe('50px');
      expect(component.width).toBe('300px');
    });

    it('should initialize searchControl with input data value', () => {
      component.inputData = { searchText: 'initial value' } as any;
      component.ngOnInit();
      expect(component.searchControl.value).toBe('initial value');
    });

    it('should show clear button when input has value', (done) => {
      component.inputData = {} as any;
      component.ngOnInit();
      component.searchControl.setValue('test');
      setTimeout(() => {
        expect(component.showClearButton).toBe(true);
        done();
      }, 100);
    });

    it('should hide clear button when input is empty', (done) => {
      component.inputData = {} as any;
      component.ngOnInit();
      component.searchControl.setValue('');
      setTimeout(() => {
        expect(component.showClearButton).toBe(false);
        done();
      }, 100);
    });
  });

  describe('onKeyDown', () => {
    it('should track the last key pressed', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeyDown(event);
      expect(component.lastKeyPressed).toBe('Enter');
    });

    it('should update lastKeyPressed on multiple key presses', () => {
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'a' }));
      expect(component.lastKeyPressed).toBe('a');
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Backspace' }));
      expect(component.lastKeyPressed).toBe('Backspace');
    });
  });

  describe('isDeleteKey', () => {
    it('should return true for Backspace', () => {
      expect(component.isDeleteKey('Backspace')).toBe(true);
    });

    it('should return true for Delete', () => {
      expect(component.isDeleteKey('Delete')).toBe(true);
    });

    it('should return true for Del', () => {
      expect(component.isDeleteKey('Del')).toBe(true);
    });

    it('should return true for Clear', () => {
      expect(component.isDeleteKey('Clear')).toBe(true);
    });

    it('should return true for NumPadClear', () => {
      expect(component.isDeleteKey('NumPadClear')).toBe(true);
    });

    it('should return false for non-delete keys', () => {
      expect(component.isDeleteKey('Enter')).toBe(false);
      expect(component.isDeleteKey('a')).toBe(false);
      expect(component.isDeleteKey('Shift')).toBe(false);
    });
  });

  describe('inputHandler', () => {
    it('should emit search when Enter key is pressed', () => {
      spyOn(component.outputData, 'emit');
      component.searchControl.setValue('test value');
      const event = new KeyboardEvent('keyup', { key: 'Enter' });
      component.inputHandler(event);
      expect(component.outputData.emit).toHaveBeenCalledWith('test value');
    });

    it('should not emit search for other keys', () => {
      spyOn(component.outputData, 'emit');
      component.searchControl.setValue('test value');
      const event = new KeyboardEvent('keyup', { key: 'a' });
      component.inputHandler(event);
      expect(component.outputData.emit).not.toHaveBeenCalled();
    });

    it('should not emit if search value is empty and not manually cleared', () => {
      spyOn(console, 'info');
      component.searchControl.setValue('');
      component.clearedManually = false;
      const event = new KeyboardEvent('keyup', { key: 'Enter' });
      component.inputHandler(event);
      expect(console.info).toHaveBeenCalledWith('Search skipped: empty and not cleared manually again');
    });
  });

  describe('searchBtnClick', () => {
    it('should emit search value when button clicked', () => {
      spyOn(component.outputData, 'emit');
      component.searchControl.setValue('search term');
      component.searchBtnClick();
      expect(component.outputData.emit).toHaveBeenCalledWith('search term');
    });

    it('should not emit if value is empty and not manually cleared', () => {
      spyOn(console, 'info');
      component.searchControl.setValue('');
      component.clearedManually = false;
      component.searchBtnClick();
      expect(console.info).toHaveBeenCalledWith('Search skipped: empty and not cleared manually again');
    });
  });

  describe('clearInput', () => {
    it('should clear search control value', () => {
      component.searchControl.setValue('test');
      component.clearInput();
      expect(component.searchControl.value).toBe('');
    });

    it('should hide clear button', () => {
      component.showClearButton = true;
      component.clearInput();
      expect(component.showClearButton).toBe(false);
    });

    it('should emit empty string', () => {
      spyOn(component.outputData, 'emit');
      component.clearInput();
      expect(component.outputData.emit).toHaveBeenCalledWith('');
    });
  });

  describe('Search behavior with manual clear', () => {
    it('should set clearedManually flag when delete key is used to clear input', (done) => {
      component.inputData = {} as any;
      component.ngOnInit();
      component.searchControl.setValue('test');
      
      // Simulate delete key press
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Backspace' }));
      component.searchControl.setValue('');
      
      setTimeout(() => {
        expect(component.clearedManually).toBe(true);
        done();
      }, 100);
    });

    it('should emit empty string on search when manually cleared', () => {
      spyOn(component.outputData, 'emit');
      component.clearedManually = true;
      component.searchControl.setValue('');
      component.searchBtnClick();
      expect(component.outputData.emit).toHaveBeenCalledWith('');
    });

    it('should reset clearedManually flag after emitting', () => {
      spyOn(component.outputData, 'emit');
      component.clearedManually = true;
      component.searchControl.setValue('test');
      component.searchBtnClick();
      expect(component.clearedManually).toBe(false);
    });
  });

  describe('Trim behavior', () => {
    it('should emit trimmed search value', () => {
      spyOn(component.outputData, 'emit');
      component.searchControl.setValue('  test value  ');
      component.searchBtnClick();
      expect(component.outputData.emit).toHaveBeenCalledWith('test value');
    });

    it('should not show clear button for whitespace-only input', (done) => {
      component.inputData = {} as any;
      component.ngOnInit();
      component.searchControl.setValue('   ');
      setTimeout(() => {
        expect(component.showClearButton).toBe(false);
        done();
      }, 100);
    });
  });
});
