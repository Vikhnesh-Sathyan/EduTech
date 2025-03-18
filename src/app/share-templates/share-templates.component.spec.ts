import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareTemplatesComponent } from './share-templates.component';

describe('ShareTemplatesComponent', () => {
  let component: ShareTemplatesComponent;
  let fixture: ComponentFixture<ShareTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
