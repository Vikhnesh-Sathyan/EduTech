import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCodingType } from './edit-coding-type';

describe('EditCodingType', () => {
  let component: EditCodingType;
  let fixture: ComponentFixture<EditCodingType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCodingType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCodingType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
