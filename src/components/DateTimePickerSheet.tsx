import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily } from '@/constants/theme';

const palette = {
  green800: '#1A5C38',
  green100: '#E4F3EB',
  neutral900: '#0F172A',
  neutral700: '#334155',
  neutral500: '#64748B',
  neutral400: '#94A3B8',
  neutral300: '#CBD5E1',
  neutral200: '#E2E8F0',
  neutral100: '#F1F5F9',
  neutral50: '#F8FAFC',
  white: '#FFFFFF',
  overlay: 'rgba(15,23,42,0.5)',
};

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAY_HEADERS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const WEEKDAY_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const HOUR_ITEM_HEIGHT = 32;
const MINUTES = [0, 15, 30, 45];

type DateTimePickerSheetProps = {
  visible: boolean;
  title: string;
  hintLabel: string;
  initialValue?: string;
  onConfirm: (isoValue: string) => void;
  onClose: () => void;
};

export function DateTimePickerSheet({
  visible,
  title,
  hintLabel,
  initialValue,
  onConfirm,
  onClose,
}: DateTimePickerSheetProps) {
  const initialDate = useMemo(() => parseInitial(initialValue), [initialValue]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [hour12, setHour12] = useState(to12Hour(initialDate.getHours()));
  const [minute, setMinute] = useState(roundToQuarter(initialDate.getMinutes()));
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialDate.getHours() >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    if (visible) {
      const seed = parseInitial(initialValue);
      setViewYear(seed.getFullYear());
      setViewMonth(seed.getMonth());
      setSelectedDay(seed.getDate());
      setHour12(to12Hour(seed.getHours()));
      setMinute(roundToQuarter(seed.getMinutes()));
      setPeriod(seed.getHours() >= 12 ? 'PM' : 'AM');
    }
  }, [visible, initialValue]);

  const daysGrid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  const preview = useMemo(() => {
    const date = new Date(viewYear, viewMonth, selectedDay, to24Hour(hour12, period), minute, 0, 0);
    return formatPreview(date);
  }, [viewYear, viewMonth, selectedDay, hour12, minute, period]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleConfirm = () => {
    const final = new Date(viewYear, viewMonth, selectedDay, to24Hour(hour12, period), minute, 0, 0);
    onConfirm(final.toISOString());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.headerBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.preview}>{preview}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.monthNav}>
            <Pressable onPress={handlePrevMonth} style={styles.monthNavBtn} accessibilityRole="button">
              <Ionicons name="chevron-back" size={16} color={palette.neutral700} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {capitalize(MONTHS_ES[viewMonth])} {viewYear}
            </Text>
            <Pressable onPress={handleNextMonth} style={styles.monthNavBtn} accessibilityRole="button">
              <Ionicons name="chevron-forward" size={16} color={palette.neutral700} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_HEADERS.map((wd) => (
              <Text key={wd} style={styles.weekday}>{wd}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {daysGrid.map((cell, idx) => {
              if (cell === null) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const isSelected = cell === selectedDay;
              const isToday = isCurrentMonth && cell === today.getDate();
              const isPast = isPastDay(viewYear, viewMonth, cell, today);

              return (
                <Pressable
                  key={cell}
                  onPress={() => setSelectedDay(cell)}
                  style={[
                    styles.dayCell,
                    isSelected ? styles.daySelected : null,
                    !isSelected && isToday ? styles.dayToday : null,
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      isPast && !isSelected ? styles.dayPastText : null,
                      isSelected ? styles.daySelectedText : null,
                      !isSelected && isToday ? styles.dayTodayText : null,
                    ]}>
                    {cell}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Text style={styles.timeLabel}>{hintLabel}</Text>

          <View style={styles.timeRow}>
            <DrumPicker
              values={Array.from({ length: 12 }, (_, i) => i + 1)}
              selected={hour12}
              onChange={setHour12}
            />
            <Text style={styles.timeColon}>:</Text>
            <DrumPicker
              values={MINUTES}
              selected={minute}
              onChange={setMinute}
              pad
            />
            <View style={styles.periodToggle}>
              <Pressable
                onPress={() => setPeriod('AM')}
                style={[styles.periodBtn, period === 'AM' ? styles.periodBtnActive : null]}>
                <Text style={[styles.periodText, period === 'AM' ? styles.periodTextActive : null]}>AM</Text>
              </Pressable>
              <Pressable
                onPress={() => setPeriod('PM')}
                style={[styles.periodBtn, period === 'PM' ? styles.periodBtnActive : null]}>
                <Text style={[styles.periodText, period === 'PM' ? styles.periodTextActive : null]}>PM</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={handleConfirm} style={styles.confirmBtn} accessibilityRole="button">
            <Text style={styles.confirmText}>Confirmar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type DrumPickerProps = {
  values: number[];
  selected: number;
  onChange: (v: number) => void;
  pad?: boolean;
};

function DrumPicker({ values, selected, onChange, pad }: DrumPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, values.indexOf(selected));

  useEffect(() => {
    const id = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * HOUR_ITEM_HEIGHT, animated: false });
    }, 30);
    return () => clearTimeout(id);
  }, [selectedIndex]);

  return (
    <View style={styles.drum}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={HOUR_ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: HOUR_ITEM_HEIGHT }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / HOUR_ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(values.length - 1, idx));
          onChange(values[clamped]);
        }}>
        {values.map((v, i) => {
          const isSel = i === selectedIndex;
          return (
            <View key={v} style={styles.drumItem}>
              <Text style={[styles.drumText, isSel ? styles.drumTextActive : null]}>
                {pad ? String(v).padStart(2, '0') : String(v).padStart(2, '0')}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View pointerEvents="none" style={styles.drumHighlight} />
    </View>
  );
}

function parseInitial(value?: string): Date {
  if (value) {
    const d = new Date(value);
    if (Number.isFinite(d.getTime())) return d;
  }
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(roundToQuarter(now.getMinutes()));
  return now;
}

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isPastDay(year: number, month: number, day: number, today: Date): boolean {
  const target = new Date(year, month, day).getTime();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return target < todayStart;
}

function to12Hour(hour24: number): number {
  const h = hour24 % 12;
  return h === 0 ? 12 : h;
}

function to24Hour(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function roundToQuarter(minutes: number): number {
  const buckets = [0, 15, 30, 45];
  let closest = 0;
  let bestDiff = 99;
  for (const b of buckets) {
    const diff = Math.abs(minutes - b);
    if (diff < bestDiff) {
      bestDiff = diff;
      closest = b;
    }
  }
  return closest;
}

function formatPreview(date: Date): string {
  const dow = WEEKDAY_FULL[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_ES[date.getMonth()];
  const year = date.getFullYear();
  const h24 = date.getHours();
  const m = date.getMinutes();
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = to12Hour(h24);
  return `${dow}, ${day} de ${month} ${year} · ${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: palette.neutral200,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 20,
  },
  headerBlock: {
    gap: 4,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    color: palette.neutral900,
    letterSpacing: -0.3,
  },
  preview: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: palette.green800,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: palette.neutral100,
    marginHorizontal: -20,
    marginVertical: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    backgroundColor: palette.neutral100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 15,
    color: palette.neutral900,
    letterSpacing: -0.3,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.extrabold,
    fontSize: 9.5,
    color: palette.neutral400,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 1.5,
  },
  dayText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: palette.neutral700,
  },
  dayPastText: {
    color: palette.neutral300,
    fontFamily: fontFamily.medium,
  },
  daySelected: {
    backgroundColor: palette.green800,
  },
  daySelectedText: {
    color: palette.white,
    fontFamily: fontFamily.extrabold,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: palette.green800,
  },
  dayTodayText: {
    color: palette.green800,
    fontFamily: fontFamily.bold,
  },
  timeLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    color: palette.neutral400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  drum: {
    width: 64,
    height: HOUR_ITEM_HEIGHT * 3,
    backgroundColor: palette.neutral100,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  drumItem: {
    height: HOUR_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: palette.neutral300,
  },
  drumTextActive: {
    fontFamily: fontFamily.extrabold,
    fontSize: 20,
    color: palette.neutral900,
  },
  drumHighlight: {
    position: 'absolute',
    top: HOUR_ITEM_HEIGHT,
    left: 4,
    right: 4,
    height: HOUR_ITEM_HEIGHT,
    backgroundColor: palette.white,
    borderRadius: 10,
    zIndex: -1,
  },
  timeColon: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    color: palette.neutral900,
    paddingHorizontal: 2,
  },
  periodToggle: {
    flexDirection: 'column',
    gap: 4,
    marginLeft: 6,
  },
  periodBtn: {
    width: 48,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.neutral100,
  },
  periodBtnActive: {
    backgroundColor: palette.green800,
  },
  periodText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: palette.neutral400,
  },
  periodTextActive: {
    color: palette.white,
  },
  confirmBtn: {
    backgroundColor: palette.green800,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: palette.green800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  confirmText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: palette.white,
    letterSpacing: -0.2,
  },
});
