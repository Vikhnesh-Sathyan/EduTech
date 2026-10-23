import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedPageHeader } from './advanced-page-header';

describe('AdvancedPageHeader', () => {
  let component: AdvancedPageHeader;
  let fixture: ComponentFixture<AdvancedPageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedPageHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedPageHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
