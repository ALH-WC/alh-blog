import type { SchemaTypeDefinition } from 'sanity';
import { article } from './article';
import { lead } from './lead';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [article, lead],
};

export const schemaTypes = schema.types;
