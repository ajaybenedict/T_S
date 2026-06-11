import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationbarComponent } from './navigationbar.component';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('NavigationbarComponent', () => {
  let component: NavigationbarComponent;
  let fixture: ComponentFixture<NavigationbarComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [ NavigationbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
