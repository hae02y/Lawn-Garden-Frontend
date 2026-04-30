import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import Container from '@/styles/Container';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import { getNotificationSettings, updateNotificationSettings } from '@/api/notification';
import type { UserNotificationSettingDto } from '@/types/api';
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

const HourRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
`;

const HourInput = styled.input`
  width: 100%;
  border: 1px solid #d0ccc8;
  border-radius: 10px;
  padding: 0.6rem;
`;

const Caption = styled.p`
  color: #6a6f6c;
  font-size: 0.82rem;
  margin-bottom: 0.5rem;
`;

const Notice = styled.p`
  color: #9a5f5f;
`;

type NotificationToggleKey =
  | 'missionEnabled'
  | 'streakRiskEnabled'
  | 'levelUpEnabled'
  | 'rewardEnabled'
  | 'quietHoursEnabled';

const switchItems: Array<{ key: NotificationToggleKey; label: string }> = [
  { key: 'missionEnabled', label: '오늘 미션 알림' },
  { key: 'streakRiskEnabled', label: '연속 끊김 위험 알림' },
  { key: 'levelUpEnabled', label: '레벨업 알림' },
  { key: 'rewardEnabled', label: '보상 구간 알림' },
];

const defaultSettings: UserNotificationSettingDto = {
  missionEnabled: true,
  streakRiskEnabled: true,
  levelUpEnabled: true,
  rewardEnabled: true,
  quietHoursEnabled: false,
  quietStartHour: 23,
  quietEndHour: 8,
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<UserNotificationSettingDto>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getNotificationSettings();
        setSettings(res.data);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '알림 설정을 불러오지 못했어요.'));
      }
    };
    fetchSettings();
  }, []);

  const saveDisabled = useMemo(() => isSaving, [isSaving]);

  const toggleSwitch = (key: NotificationToggleKey) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setErrorMessage('');
    try {
      setIsSaving(true);
      const payload: UserNotificationSettingDto = {
        ...settings,
        quietStartHour: Math.min(23, Math.max(0, settings.quietStartHour)),
        quietEndHour: Math.min(23, Math.max(0, settings.quietEndHour)),
      };
      const response = await updateNotificationSettings(payload);
      setSettings(response.data);
      alert('알림 설정이 저장되었습니다.');
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, '알림 설정 저장에 실패했어요.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Wrapper>
      <PageHeader title="정원 알림 설정" />
      <Container>
        <Card>
          <SectionTitle>알림 항목</SectionTitle>
          <Grid>
            {switchItems.map((item) => (
              <Toggle
                type="button"
                key={item.key}
                $active={Boolean(settings[item.key])}
                onClick={() => toggleSwitch(item.key)}
              >
                {item.label}
              </Toggle>
            ))}
          </Grid>
        </Card>

        <Card>
          <SectionTitle>방해 금지 시간</SectionTitle>
          <Caption>활성화하면 지정 시간대에 신규 알림을 생성하지 않습니다.</Caption>
          <Grid>
            <Toggle
              type="button"
              $active={settings.quietHoursEnabled}
              onClick={() => toggleSwitch('quietHoursEnabled')}
            >
              {settings.quietHoursEnabled ? 'ON' : 'OFF'}
            </Toggle>
            <div />
          </Grid>

          <HourRow>
            <HourInput
              type="number"
              min={0}
              max={23}
              value={settings.quietStartHour}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  quietStartHour: Number(event.target.value),
                }))
              }
            />
            <HourInput
              type="number"
              min={0}
              max={23}
              value={settings.quietEndHour}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  quietEndHour: Number(event.target.value),
                }))
              }
            />
          </HourRow>
        </Card>

        <Button onClick={handleSave} disabled={saveDisabled}>
          {isSaving ? '저장 중...' : '설정 저장'}
        </Button>
        {errorMessage && <Notice>{errorMessage}</Notice>}
      </Container>
    </Wrapper>
  );
}
