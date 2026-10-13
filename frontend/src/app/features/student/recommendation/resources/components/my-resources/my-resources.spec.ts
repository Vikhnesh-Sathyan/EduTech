import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyResources } from './my-resources';

describe('MyResources', () => {
  let component: MyResources;
  let fixture: ComponentFixture<MyResources>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyResources]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyResources);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
