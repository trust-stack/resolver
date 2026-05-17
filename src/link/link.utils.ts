export const normalisePath = (path: string) => path.replace(/^\/+|\/+$/g, '');

/**
 * Validate the path of a Link.
 * @param path The path of the Link.
 * @throws {Error} If the path is invalid.
 */
export function validatePath(path: string) {
  // Remove leading and trailing slashes
  const cleanPath = normalisePath(path);

  // Check if path is empty after cleaning
  if (!cleanPath) {
    throw new Error('Path cannot be empty');
  }

  // Split path into segments and validate each pair
  const segments = cleanPath.split('/');

  // Path must have an even number of segments (qualifier/identifier pairs)
  if (segments.length % 2 !== 0) {
    throw new Error('Path must consist of qualifier/identifier pairs');
  }

  // Validate each segment
  for (let i = 0; i < segments.length; i += 2) {
    const qualifier = segments[i];
    const identifier = segments[i + 1];

    if (!qualifier || !identifier) {
      throw new Error('Both qualifier and identifier must be non-empty');
    }

    // Add any specific validation rules for qualifiers and identifiers here
    // For example, you might want to restrict characters or enforce patterns
    if (!/^[a-zA-Z0-9\-_.]+$/.test(qualifier) || !/^[a-zA-Z0-9\-_.]+$/.test(identifier)) {
      throw new Error(
        'Qualifiers and identifiers can only contain alphanumeric characters, hyphens, underscores, and periods',
      );
    }
  }
}

/**
 * Validate the type of a Link.
 * @param type The type of the Link.
 * @throws {Error} If the type is invalid.
 */
export function validateType(type: string) {
  // Check if type is empty
  if (!type) {
    throw new Error('Type cannot be empty');
  }

  // Check basic MIME type format (type/subtype)
  const mimeTypePattern = /^[a-zA-Z0-9-+.]+\/[a-zA-Z0-9-+.]+$/;
  if (!mimeTypePattern.test(type)) {
    throw new Error("Invalid MIME type format. Must be in the format 'type/subtype'");
  }

  // Split into main type and subtype
  const [mainType, subType] = type.split('/');

  // Validate main type starts with standard categories
  const validMainTypes = [
    'application',
    'audio',
    'font',
    'image',
    'message',
    'model',
    'multipart',
    'text',
    'video',
  ];
  if (!validMainTypes.includes(mainType.toLowerCase())) {
    throw new Error(`Invalid main type. Must be one of: ${validMainTypes.join(', ')}`);
  }
}
