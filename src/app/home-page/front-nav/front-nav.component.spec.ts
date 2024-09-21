import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontNavComponent } from './front-nav.component';

describe('FrontNavComponent', () => {
  let component: FrontNavComponent;
  let fixture: ComponentFixture<FrontNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrontNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
