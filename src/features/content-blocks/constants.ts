import type {ContentBlockType} from './types';

export const CONTENT_BLOCK_TYPE_OPTIONS: Array<{
  value: ContentBlockType;
  labelKey: string;
}> = [
  {value: 'TEXT', labelKey: 'types.TEXT'},
  {value: 'IMAGE', labelKey: 'types.IMAGE'},
  {value: 'VIDEO', labelKey: 'types.VIDEO'},
  {value: 'TEXT_IMAGE', labelKey: 'types.TEXT_IMAGE'},
  {value: 'GALLERY', labelKey: 'types.GALLERY'}
];