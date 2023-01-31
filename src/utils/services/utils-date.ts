import { format, parse } from 'date-fns';

const CSTLayout = 'yyyy-MM-dd HH:mm:ss';

// CSTLayoutString 格式化时间
// 返回 "2006-01-02 15:04:05" 格式的时间
export function CSTLayoutString(date: number | Date) {
  return format(date, CSTLayout);
}

// ParseCSTInLocation 格式化时间
export function ParseCSTInLocation(date: string) {
  return parse(date, CSTLayout);
}
