import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import CheckMemberBox from '@/components/CheckMemberBox';
import { getTodayUsers } from '@/api/user';
import type { UserDetailResponseDto } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const BoxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1.2rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }
`;

const Notice = styled.p`
  width: 100%;
  text-align: center;
  color: var(--color-content-font);
`;

export default function CheckMember() {
  const navigate = useNavigate();
  const [certified, setCertified] = useState<UserDetailResponseDto[]>([]);
  const [uncertified, setUncertified] = useState<UserDetailResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUserClick = (user: UserDetailResponseDto) => {
    if (!user?.id) {
      alert('유저 정보를 찾을 수 없어요.');
      return;
    }
    navigate(`/mygarden/${user.id}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [certifiedRes, uncertifiedRes] = await Promise.all([
          getTodayUsers('y'),
          getTodayUsers('n'),
        ]);
        setCertified(certifiedRes.data);
        setUncertified(uncertifiedRes.data);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '인증자 조회에 실패했어요.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Wrapper>
      <PageHeader title="인증 내역 확인" />
      <BoxWrapper>
        {isLoading && <Notice>불러오는 중...</Notice>}
        {!isLoading && errorMessage && <Notice>{errorMessage}</Notice>}
        {!isLoading && !errorMessage && (
          <>
            <CheckMemberBox
              title="금일 미인증자"
              description="오늘 잔디를 심지 않은 사람입니다!"
              icon="❌"
              list={uncertified}
              onUserClick={handleUserClick}
            />
            <CheckMemberBox
              title="금일 인증자"
              description="오늘 잔디를 심었어요!"
              icon="🌱"
              list={certified}
              onUserClick={handleUserClick}
            />
          </>
        )}
      </BoxWrapper>
    </Wrapper>
  );
}
