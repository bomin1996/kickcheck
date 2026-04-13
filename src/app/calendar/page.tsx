import type { Metadata } from 'next';
import Link from 'next/link';
import { getCalendarData } from '@/lib/data';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

export const metadata: Metadata = {
  title: `${currentYear}년 ${currentMonth}월 스니커즈 발매 캘린더 | 한정판 출시일`,
  description: `${currentYear}년 ${currentMonth}월 스니커즈 발매 일정. 나이키, 조던, 뉴발란스 한정판 출시 정보.`,
};

export const revalidate = 7200;

const TYPE_LABELS: Record<string, string> = {
  raffle: '래플',
  fcfs: '선착순',
  general: '일반 발매',
};

const TYPE_STYLES: Record<string, string> = {
  raffle: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  fcfs: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default async function CalendarPage() {
  const releases = await getCalendarData(currentYear, currentMonth);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">발매 캘린더</h1>
      <p className="text-gray-500 text-sm mb-6">{currentYear}년 {currentMonth}월 스니커즈 발매 일정</p>

      {releases.length === 0 ? (
        <p className="text-center text-gray-400 py-12">이번 달 발매 일정이 없습니다.</p>
      ) : (
        <div className="space-y-6">
          {releases.map((day) => (
            <div key={day.date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex flex-col items-center justify-center text-sm font-bold shrink-0">
                  <span className="text-xs">{new Date(day.date).getMonth() + 1}월</span>
                  <span className="text-lg leading-none">{new Date(day.date).getDate()}</span>
                </div>
                <p className="font-medium">
                  {new Date(day.date).toLocaleDateString('ko-KR', { weekday: 'long' })}
                </p>
              </div>

              <div className="space-y-2 pl-[60px]">
                {day.items.map((item: { slug: string; name: string; brand: string; price: number | null; platform: string | null; type: string | null }) => (
                  <Link
                    key={item.slug}
                    href={`/products/${item.slug}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{item.name}</p>
                        {item.type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLES[item.type] || TYPE_STYLES.general}`}>
                            {TYPE_LABELS[item.type] || item.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.platform && `${item.platform} · `}
                        출시가 {item.price?.toLocaleString()}원
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
