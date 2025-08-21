import { schema } from './orama';
import { Tag } from './tags';

export type Schema = typeof schema;

// 2. Document type
export type PatternDoc = {
  id: string;
  title: string;
  url: string;
  image: string;
  price: string;
  source: string;
  tags: Array<Tag>;
};
