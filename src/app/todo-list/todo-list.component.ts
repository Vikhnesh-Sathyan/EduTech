import { Component, OnInit } from '@angular/core';
import { TodoService } from '../todo.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [TodoService], // Add TodoService as a provider here
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})

export class TodoListComponent implements OnInit {
  todos: any[] = [];
  newTodo = { title: '', description: '', dueDate: '' };

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe(
      (todos) => {
        this.todos = todos;
      },
      (error) => {
        console.error('Error loading todos:', error);
      }
    );
  }

  addTodo(): void {
    // Check if all required fields are filled in
    if (!this.newTodo.title || !this.newTodo.dueDate) {
      alert('Please enter a title and a due date');
      return;
    }
  
    this.todoService.createTodo(this.newTodo).subscribe(
      (todo) => {
        // Push the new todo to the array of todos
        this.todos.push(todo);
        // Reset the newTodo input fields after adding the task
        this.newTodo = { title: '', description: '', dueDate: '' };
      },
      (error) => {
        console.error('Error adding todo:', error);
      }
    );
  }
  toggleComplete(todo: any): void {
    const updatedStatus = !todo.completed; // Calculate the new status
  
    // Send the update to the backend
    this.todoService.updateTodo(todo.id, { completed: updatedStatus }).subscribe(
      () => {
        // Update the local state only after a successful backend response
        todo.completed = updatedStatus;
      },
      (error) => {
        console.error('Error updating todo:', error);
        alert('Failed to update the task. Please try again.');
      }
    );
  }
  
  markAsCompleted(todo: any): void {
    // Create the payload with the updated completed state
    const payload = { completed: !todo.completed };
  
    this.todoService.updateTodo(todo.id, payload).subscribe(
      () => {
        // Update the local todo completed state
        todo.completed = !todo.completed;
      },
      (error) => {
        console.error('Error updating todo:', error);
      }
    );
  }
  

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id).subscribe(
      () => {
        this.loadTodos(); // Reload todos after deletion
      },
      (error) => {
        console.error('Error deleting todo:', error);
      }
    );
  }
}
