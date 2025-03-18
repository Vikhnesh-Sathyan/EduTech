import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyTestComponent } from './company-test.component';

describe('CompanyTestComponent', () => {
  let component: CompanyTestComponent;
  let fixture: ComponentFixture<CompanyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
