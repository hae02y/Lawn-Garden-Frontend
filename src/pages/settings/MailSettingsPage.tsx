import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import Container from '@/styles/Container';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import { getMyMailSettings, updateMyMailSettings } from '@/api/mail';
import type { MailCategory, MailStatus, Weekday } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const Card = styled.div`
  background: var(--color-background);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 0.8rem;
`;

const SectionTitle = styled.h3`
  color: var(--color-deep-green);
  margin-bottom: 0.6rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem;
`;

const Toggle = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  font-weight: 700;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#3d8d7a' : '#d8d6d2')};
  color: ${({ $active }) => ($active ? '#fff' : '#59534f')};
`;

const HourInput = styled.input`
  width: 100%;
  border: 1px solid #d0ccc8;
  border-radius: 10px;
  padding: 0.6rem;
`;

const Notice = styled.p`
  color: #9a5f5f;
`;

const weekdays: Weekday[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];
const weekdayLabel: Record<Weekday, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};
const categories: MailCategory[] = ['BACKEND', 'FRONTEND', 'AI'];
const categoryLabel: Record<MailCategory, string> = {
  BACKEND: 'Backend',
  FRONTEND: 'Frontend',
  AI: 'AI',
  NONE: 'None',
};

export default function MailSettingsPage() {
  const [status, setStatus] = useState<MailStatus>('ON');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [hour, setHour] = useState(9);
  const [selectedCategories, setSelectedCategories] = useState<MailCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getMyMailSettings();
        setStatus(res.data.status);
        setSelectedDays((res.data.preferredDays as Weekday[]) ?? weekdays);
        setHour(res.data.preferredHour ?? 9);
        setSelectedCategories((res.data.categories as MailCategory[]) ?? categories);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '메일 설정을 불러오지 못했어요.'));
      }
    };
    fetchSettings();
  }, []);

  const saveDisabled = useMemo(
    () => isSaving || selectedDays.length === 0 || selectedCategories.length === 0,
    [isSaving, selectedCategories.length, selectedDays.length]
  );

  const toggleDay = (day: Weekday) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleCategory = (category: MailCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSave = async () => {
    setErrorMessage('');
    try {
      setIsSaving(true);
      await updateMyMailSettings({
        status,
        preferredDays: selectedDays,
        preferredHour: Math.min(23, Math.max(0, hour)),
        categories: selectedCategories,
      });
      alert('메일 설정이 저장되었습니다.');
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, '메일 설정 저장에 실패했어요.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Wrapper>
      <PageHeader title="메일 알림 설정" />
      <Container>
        <Card>
          <SectionTitle>알림 상태</SectionTitle>
          <Grid>
            <Toggle type="button" $active={status === 'ON'} onClick={() => setStatus('ON')}>
              ON
            </Toggle>
            <Toggle type="button" $active={status === 'OFF'} onClick={() => setStatus('OFF')}>
              OFF
            </Toggle>
          </Grid>
        </Card>

        <Card>
          <SectionTitle>알림 요일</SectionTitle>
          <Grid>
            {weekdays.map((day) => (
              <Toggle
                type="button"
                key={day}
                $active={selectedDays.includes(day)}
                onClick={() => toggleDay(day)}
              >
                {weekdayLabel[day]}
              </Toggle>
            ))}
          </Grid>
        </Card>

        <Card>
          <SectionTitle>알림 시간 (0-23시)</SectionTitle>
          <HourInput
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(event) => setHour(Number(event.target.value))}
          />
        </Card>

        <Card>
          <SectionTitle>관심 카테고리</SectionTitle>
          <Grid>
            {categories.map((category) => (
              <Toggle
                type="button"
                key={category}
                $active={selectedCategories.includes(category)}
                onClick={() => toggleCategory(category)}
              >
                {categoryLabel[category]}
              </Toggle>
            ))}
          </Grid>
        </Card>

        <Button onClick={handleSave} disabled={saveDisabled}>
          {isSaving ? '저장 중...' : '설정 저장'}
        </Button>
        {errorMessage && <Notice>{errorMessage}</Notice>}
      </Container>
    </Wrapper>
  );
}
