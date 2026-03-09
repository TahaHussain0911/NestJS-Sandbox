import slugify from 'slugify';

export function DTOTrim({ value }) {
  return typeof value === 'string' ? value.trim() : value;
}

export function DTOBoolean({ value }) {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return undefined;
}

export function createSlug(name: string) {
  const slug = slugify(name, {
    lower: true,
    strict: true,
  });
  return slug;
}
