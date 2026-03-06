import { Types } from 'mongoose';
import slugify from 'slugify';

export function convertStringIdsToMongoIds(value: string[]): Types.ObjectId[];
export function convertStringIdsToMongoIds(
  value: string,
): Types.ObjectId | undefined;

export function convertStringIdsToMongoIds(
  value: string[] | string,
): Types.ObjectId[] | Types.ObjectId | undefined {
  if (Array.isArray(value)) {
    return value.flatMap((id) => {
      try {
        return [new Types.ObjectId(id)];
      } catch (error) {
        return [];
      }
    });
  } else {
    try {
      return new Types.ObjectId(value);
    } catch (error) {
      return undefined;
    }
  }
}

export function createSlug(name: string) {
  const slug = slugify(name, {
    lower: true,
    strict: true,
  });
  return slug;
}
