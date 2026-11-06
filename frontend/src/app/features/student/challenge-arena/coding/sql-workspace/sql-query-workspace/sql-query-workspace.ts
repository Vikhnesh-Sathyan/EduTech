import {
  Component,
  EventEmitter,
  Output,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sql-query-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sql-query-workspace.html',
  styleUrl: './sql-query-workspace.css'
})
export class SqlQueryWorkspace {

  @Output() queryChange = new EventEmitter<string>();

  sqlQuery = signal<string>('');

  onQueryChange(value: string): void {
    this.sqlQuery.set(value);
    this.queryChange.emit(value);
  }

}