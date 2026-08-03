import React from 'react';
import { ITEM_SPRITE_INDEX, getItemSpritePath } from '../data/itemSprites';

interface ItemSpriteProps {
  itemId: string;
  className?: string;
}

export const ItemSprite: React.FC<ItemSpriteProps> = ({ itemId, className = '' }) => {
  const index = ITEM_SPRITE_INDEX[itemId];
  if (index === undefined) return <span className={className}>?</span>;

  return (
    <img
      aria-hidden="true"
      className={`ro-item-sprite ${className}`}
      src={getItemSpritePath(itemId)}
      alt=""
      draggable={false}
    />
  );
};
