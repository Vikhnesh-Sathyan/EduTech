import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingWorkspace } from './coding-workspace';

describe('CodingWorkspace', () => {
  let component: CodingWorkspace;
  let fixture: ComponentFixture<CodingWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingWorkspace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
