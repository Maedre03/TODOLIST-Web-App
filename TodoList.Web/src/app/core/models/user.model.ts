export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface UpdateUserProfileRequest {
  username: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
