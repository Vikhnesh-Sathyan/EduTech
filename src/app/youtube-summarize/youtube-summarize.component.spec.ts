import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeSummarizeComponent } from './youtube-summarize.component';

describe('YoutubeSummarizeComponent', () => {
  let component: YoutubeSummarizeComponent;
  let fixture: ComponentFixture<YoutubeSummarizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YoutubeSummarizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YoutubeSummarizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
