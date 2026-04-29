import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import Container from '@/styles/Container';
import PageHeader from '@/components/PageHeader';
import { getErrorCodeDocs, getSystemStatus } from '@/api/system';
import type { ErrorCodeDocItem, SystemStatusResponseDto } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const Card = styled.div`
  background: var(--color-background);
  border-radius: 14px;
  padding: 0.9rem;
  margin-bottom: 0.8rem;
`;

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const Notice = styled.p`
  color: #9a5f5f;
`;

export default function SystemStatusPage() {
  const [status, setStatus] = useState<SystemStatusResponseDto | null>(null);
  const [errorCodes, setErrorCodes] = useState<ErrorCodeDocItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, codeRes] = await Promise.all([getSystemStatus(), getErrorCodeDocs()]);
        setStatus(statusRes.data);
        setErrorCodes(codeRes.data);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '시스템 정보를 불러오지 못했어요.'));
      }
    };

    fetchData();
  }, []);

  return (
    <Wrapper>
      <PageHeader title="시스템 상태" />
      <Container>
        {status && (
          <Card>
            <h3>API 상태: {status.status}</h3>
            <p>버전: {status.version}</p>
            <p>서버 시간: {status.serverTime}</p>
            <p>문서: {status.docsUrl}</p>
          </Card>
        )}

        <Card>
          <h3>표준 에러 코드</h3>
          <List>
            {errorCodes.map((item) => (
              <li key={item.code}>
                <strong>{item.code}</strong> ({item.httpStatus}) - {item.description}
              </li>
            ))}
          </List>
        </Card>

        {errorMessage && <Notice>{errorMessage}</Notice>}
      </Container>
    </Wrapper>
  );
}
