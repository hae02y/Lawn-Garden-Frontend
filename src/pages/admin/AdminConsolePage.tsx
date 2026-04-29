import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import Container from '@/styles/Container';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import {
  getGeekNewsSyncLogsByAdmin,
  syncAllUserLevelsByAdmin,
  syncGeekNewsByAdmin,
} from '@/api/admin';
import type { GeekNewsSyncLogResponseDto } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Input = styled.input`
  border: 1px solid #d0ccc8;
  border-radius: 10px;
  padding: 0.5rem 0.7rem;
  width: 110px;
`;

const LogList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1rem;
`;

const LogCard = styled.li<{ $ok: boolean }>`
  background: var(--color-background);
  border-left: 4px solid ${({ $ok }) => ($ok ? '#3d8d7a' : '#c54f4f')};
  border-radius: 12px;
  padding: 0.7rem;
`;

const Notice = styled.p`
  color: #9a5f5f;
`;

export default function AdminConsolePage() {
  const [limit, setLimit] = useState(50);
  const [logs, setLogs] = useState<GeekNewsSyncLogResponseDto[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await getGeekNewsSyncLogsByAdmin(0, 20);
      setLogs(res.data.content);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, '동기화 로그를 불러오지 못했어요.'));
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSyncGeekNews = async () => {
    try {
      setIsBusy(true);
      const res = await syncGeekNewsByAdmin(limit);
      alert(`${res.data.message} (신규 ${res.data.affectedCount}건)`);
      await fetchLogs();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'GeekNews 동기화에 실패했어요.'));
    } finally {
      setIsBusy(false);
    }
  };

  const handleSyncLevels = async () => {
    try {
      setIsBusy(true);
      const res = await syncAllUserLevelsByAdmin();
      alert(`${res.data.message} (${res.data.affectedCount}명 업데이트)`);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, '레벨 동기화에 실패했어요.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Wrapper>
      <PageHeader title="운영 센터" />
      <Container>
        <Row>
          <Input
            type="number"
            min={1}
            max={300}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          />
          <Button onClick={handleSyncGeekNews} disabled={isBusy}>
            GeekNews 수동 동기화
          </Button>
        </Row>

        <Button onClick={handleSyncLevels} disabled={isBusy}>
          사용자 레벨 일괄 동기화
        </Button>

        <Button onClick={fetchLogs} disabled={isBusy}>
          로그 새로고침
        </Button>

        {errorMessage && <Notice>{errorMessage}</Notice>}

        <LogList>
          {logs.map((log) => (
            <LogCard key={log.id} $ok={log.success}>
              <strong>{log.success ? '성공' : '실패'}</strong> · 요청 {log.requestedLimit}건 · 신규{' '}
              {log.insertedCount}건
              <div>{log.message}</div>
              <small>{log.createdAt ?? '-'}</small>
            </LogCard>
          ))}
        </LogList>
      </Container>
    </Wrapper>
  );
}
