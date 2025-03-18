import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddstplaComponent } from './addstpla.component';

describe('AddstplaComponent', () => {
  let component: AddstplaComponent;
  let fixture: ComponentFixture<AddstplaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddstplaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddstplaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
