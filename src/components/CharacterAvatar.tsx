import Image from "next/image";

// 十天干角色 · the team's original cartoon characters (public/characters/0..9.webp)
export const CHARACTERS = [
  { stem: "甲", pinyin: "JIA", element: "木", zh: "青松", en: "The Oak" },
  { stem: "乙", pinyin: "YI", element: "木", zh: "青藤", en: "The Vine" },
  { stem: "丙", pinyin: "BING", element: "火", zh: "烈阳", en: "The Sun" },
  { stem: "丁", pinyin: "DING", element: "火", zh: "明烛", en: "The Candle" },
  { stem: "戊", pinyin: "WU", element: "土", zh: "厚山", en: "The Mountain" },
  { stem: "己", pinyin: "JI", element: "土", zh: "沃田", en: "The Garden" },
  { stem: "庚", pinyin: "GENG", element: "金", zh: "锐锋", en: "The Blade" },
  { stem: "辛", pinyin: "XIN", element: "金", zh: "珠玉", en: "The Jewel" },
  { stem: "壬", pinyin: "REN", element: "水", zh: "沧海", en: "The Ocean" },
  { stem: "癸", pinyin: "GUI", element: "水", zh: "甘露", en: "The Dew" },
] as const;

export default function CharacterAvatar({
  index,
  className,
  priority = false,
}: {
  index: number; // day-master stem index 0..9 (甲..癸)
  className?: string;
  priority?: boolean;
}) {
  const i = index >= 0 && index <= 9 ? index : 0;
  const c = CHARACTERS[i];
  return (
    <Image
      src={`/characters/${i}.webp`}
      alt={`${c.pinyin} ${c.stem}${c.element} · ${c.zh} ${c.en}`}
      width={432}
      height={518}
      priority={priority}
      className={className}
    />
  );
}
