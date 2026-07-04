/**
 * Static image map for the mobile app.
 *
 * React Native / Metro require STATIC require() paths (no dynamic strings), so
 * every card image is enumerated here. Generated to match
 * packages/core/data/tarot-cards.json — regenerate via
 * `python apps/mobile/scripts/gen_image_map.py` if cards or files change.
 */
import type { ImageSourcePropType } from 'react-native';

// Card artwork lives at the repo root (assets/img/clean), shared with web.
const images: Record<string, ImageSourcePropType> = {
  maj00: require('../../../assets/img/clean/maj00.jpg'),
  maj01: require('../../../assets/img/clean/maj01.jpg'),
  maj02: require('../../../assets/img/clean/maj02.jpg'),
  maj03: require('../../../assets/img/clean/maj03.jpg'),
  maj04: require('../../../assets/img/clean/maj04.jpg'),
  maj05: require('../../../assets/img/clean/maj05.jpg'),
  maj06: require('../../../assets/img/clean/maj06.jpg'),
  maj07: require('../../../assets/img/clean/maj07.jpg'),
  maj08: require('../../../assets/img/clean/maj08.jpg'),
  maj09: require('../../../assets/img/clean/maj09.jpg'),
  maj10: require('../../../assets/img/clean/maj10.jpg'),
  maj11: require('../../../assets/img/clean/maj11.jpg'),
  maj12: require('../../../assets/img/clean/maj12.jpg'),
  maj13: require('../../../assets/img/clean/maj13.jpg'),
  maj14: require('../../../assets/img/clean/maj14.jpg'),
  maj15: require('../../../assets/img/clean/maj15.jpg'),
  maj16: require('../../../assets/img/clean/maj16.jpg'),
  maj17: require('../../../assets/img/clean/maj17.jpg'),
  maj18: require('../../../assets/img/clean/maj18.jpg'),
  maj19: require('../../../assets/img/clean/maj19.jpg'),
  maj20: require('../../../assets/img/clean/maj20.jpg'),
  maj21: require('../../../assets/img/clean/maj21.jpg'),
  cups01: require('../../../assets/img/clean/cups01.jpg'),
  cups02: require('../../../assets/img/clean/cups02.jpg'),
  cups03: require('../../../assets/img/clean/cups03.jpg'),
  cups04: require('../../../assets/img/clean/cups04.jpg'),
  cups05: require('../../../assets/img/clean/cups05.jpg'),
  cups06: require('../../../assets/img/clean/cups06.jpg'),
  cups07: require('../../../assets/img/clean/cups07.jpg'),
  cups08: require('../../../assets/img/clean/cups08.jpg'),
  cups09: require('../../../assets/img/clean/cups09.jpg'),
  cups10: require('../../../assets/img/clean/cups10.jpg'),
  cups11: require('../../../assets/img/clean/cups11.jpg'),
  cups12: require('../../../assets/img/clean/cups12.jpg'),
  cups13: require('../../../assets/img/clean/cups13.jpg'),
  cups14: require('../../../assets/img/clean/cups14.jpg'),
  pents01: require('../../../assets/img/clean/pents01.jpg'),
  pents02: require('../../../assets/img/clean/pents02.jpg'),
  pents03: require('../../../assets/img/clean/pents03.jpg'),
  pents04: require('../../../assets/img/clean/pents04.jpg'),
  pents05: require('../../../assets/img/clean/pents05.jpg'),
  pents06: require('../../../assets/img/clean/pents06.jpg'),
  pents07: require('../../../assets/img/clean/pents07.jpg'),
  pents08: require('../../../assets/img/clean/pents08.jpg'),
  pents09: require('../../../assets/img/clean/pents09.jpg'),
  pents10: require('../../../assets/img/clean/pents10.jpg'),
  pents11: require('../../../assets/img/clean/pents11.jpg'),
  pents12: require('../../../assets/img/clean/pents12.jpg'),
  pents13: require('../../../assets/img/clean/pents13.jpg'),
  pents14: require('../../../assets/img/clean/pents14.jpg'),
  swords01: require('../../../assets/img/clean/swords01.jpg'),
  swords02: require('../../../assets/img/clean/swords02.jpg'),
  swords03: require('../../../assets/img/clean/swords03.jpg'),
  swords04: require('../../../assets/img/clean/swords04.jpg'),
  swords05: require('../../../assets/img/clean/swords05.jpg'),
  swords06: require('../../../assets/img/clean/swords06.jpg'),
  swords07: require('../../../assets/img/clean/swords07.jpg'),
  swords08: require('../../../assets/img/clean/swords08.jpg'),
  swords09: require('../../../assets/img/clean/swords09.jpg'),
  swords10: require('../../../assets/img/clean/swords10.jpg'),
  swords11: require('../../../assets/img/clean/swords11.jpg'),
  swords12: require('../../../assets/img/clean/swords12.jpg'),
  swords13: require('../../../assets/img/clean/swords13.jpg'),
  swords14: require('../../../assets/img/clean/swords14.jpg'),
  wands01: require('../../../assets/img/clean/wands01.jpg'),
  wands02: require('../../../assets/img/clean/wands02.jpg'),
  wands03: require('../../../assets/img/clean/wands03.jpg'),
  wands04: require('../../../assets/img/clean/wands04.jpg'),
  wands05: require('../../../assets/img/clean/wands05.jpg'),
  wands06: require('../../../assets/img/clean/wands06.jpg'),
  wands07: require('../../../assets/img/clean/wands07.jpg'),
  wands08: require('../../../assets/img/clean/wands08.jpg'),
  wands09: require('../../../assets/img/clean/wands09.jpg'),
  wands10: require('../../../assets/img/clean/wands10.jpg'),
  wands11: require('../../../assets/img/clean/wands11.jpg'),
  wands12: require('../../../assets/img/clean/wands12.jpg'),
  wands13: require('../../../assets/img/clean/wands13.jpg'),
  wands14: require('../../../assets/img/clean/wands14.jpg'),
};

/** Resolve a card image source by its imageKey. */
export function cardImage(imageKey: string): ImageSourcePropType {
  return images[imageKey];
}

export default images;
