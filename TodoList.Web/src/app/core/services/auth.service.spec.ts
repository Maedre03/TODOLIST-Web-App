import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: any;

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };
    
    // Clear localStorage before each test
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user, store token and update signal', () => {
      const mockResponse = { token: 'mock-jwt-token' };
      const credentials = { email: 'test@test.com', password: 'Password123!' };

      service.login(credentials).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('todo_app_token', 'mock-jwt-token');
      expect(service.getToken()).toBe('mock-jwt-token');
    });
  });

  describe('register', () => {
    it('should register a new user', () => {
      const mockResponse = { id: 'user-id-123' };
      const registerData = { username: 'testuser', email: 'test@test.com', password: 'Password123!' };

      service.register(registerData).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear token and navigate to login', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');
      // Create a fresh instance to pick up the item in localstorage
      const newService = TestBed.inject(AuthService);
      
      newService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('todo_app_token');
      expect(newService.getToken()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
