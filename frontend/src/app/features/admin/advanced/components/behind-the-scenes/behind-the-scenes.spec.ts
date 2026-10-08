import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehindTheScenes } from './behind-the-scenes';

describe('BehindTheScenes', () => {
  let component: BehindTheScenes;
  let fixture: ComponentFixture<BehindTheScenes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BehindTheScenes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BehindTheScenes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
