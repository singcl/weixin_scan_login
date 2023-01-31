import { format, parse } from 'date-fns';

const CSTLayout = 'yyyy-MM-dd HH:mm:ss';

// CSTLayoutString 格式化时间
// 返回 "2006-01-02 15:04:05" 格式的时间
export function CSTLayoutString(date: number | Date) {
  return format(date, CSTLayout);
}

// parseCSTInLocation 格式化时间
export function parseCSTInLocation(date: string) {
  return parse(date, CSTLayout, new Date());
}

// SubInLocation 计算时间差
export function subInLocation(ts: Date) {
  return Math.abs(Date.now() - ts.getTime());
}
