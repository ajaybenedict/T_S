import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TraverseinfoComponentComponent } from './traverseinfo-component.component';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('TraverseinfoComponentComponent', () => {
  let component: TraverseinfoComponentComponent;
  let fixture: ComponentFixture<TraverseinfoComponentComponent>;

  beforeEach(async () => {
    await configureTestBed({
      declarations: [TraverseinfoComponentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TraverseinfoComponentComponent);
    component = fixture.componentInstance;

    
    component.tableId = 'TEST_TABLE_ID';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});