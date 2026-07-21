import { Tag } from './tag.model';

/**
 * Priority levels for Todo items.
 * Must match the backend enum: TodoList.Domain.Enums.Priority
 * Values: Low = 1, Medium = 2, High = 3, Critical = 4
 */
export enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

/**
 * Recurrence intervals for Todo items.
 * Must match the backend enum: TodoList.Domain.Enums.RecurrenceInterval
 */
export enum RecurrenceInterval {
  None = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  Yearly = 4
}

/**
 * Represents a Todo item as returned by the backend API.
 * Maps to: TodoList.Application.Common.DTOs.TodoDto
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate: string | null;
  recurrence: RecurrenceInterval;
  createdAt: string;
  tags?: Tag[];
  subTasks?: SubTask[];
  comments?: TodoComment[];
  attachments?: Attachment[];
}

/**
 * Request body for creating a new Todo.
 * Maps to: TodoList.Application.Common.DTOs.CreateTodoRequest
 */
export interface CreateTodoRequest {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  recurrence: RecurrenceInterval;
  tagIds?: string[];
}

/**
 * Request body for updating an existing Todo.
 * Maps to: TodoList.Application.Common.DTOs.UpdateTodoRequest
 */
export interface UpdateTodoRequest {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  recurrence: RecurrenceInterval;
  tagIds?: string[];
}

/**
 * Generic API response wrapper.
 * Maps to: TodoList.Application.Common.Models.ApiResponse<T>
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: { [key: string]: string[] } | null;
}

/**
 * Paginated list response from the backend.
 * Maps to: TodoList.Application.Common.Models.PaginatedList<T>
 */
export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Query parameters for the paginated todos endpoint.
 */
export interface TodoPagedParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
  tagId?: string;
}

/**
 * SubTask model
 */
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

/**
 * Comment model
 */
export interface TodoComment {
  id: string;
  text: string;
  createdAt: string;
  createdByUserId: string;
  createdByUserName: string;
}

/**
 * Attachment model
 */
export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}
