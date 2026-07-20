/**
 * Represents a Tag item.
 */
export interface Tag {
  id: string;
  name: string;
  color: string;
}

/**
 * Request body for creating a new Tag.
 */
export interface CreateTagRequest {
  name: string;
  color: string;
}
