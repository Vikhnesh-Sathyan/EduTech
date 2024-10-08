import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcelinkComponent } from './resourcelink.component';

describe('ResourcelinkComponent', () => {
  let component: ResourcelinkComponent;
  let fixture: ComponentFixture<ResourcelinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcelinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourcelinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
