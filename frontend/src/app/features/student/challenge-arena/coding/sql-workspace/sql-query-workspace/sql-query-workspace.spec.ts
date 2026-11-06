import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlQueryWorkspace } from './sql-query-workspace';

describe('SqlQueryWorkspace', () => {
  let component: SqlQueryWorkspace;
  let fixture: ComponentFixture<SqlQueryWorkspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SqlQueryWorkspace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SqlQueryWorkspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
