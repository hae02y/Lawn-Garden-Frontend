import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import Container from '@/styles/Container';
import SearchBar from '@/components/SearchBar';
import { FooterPagination } from '@/styles/FooterPagination';
import { UserList, UserItem, UserInfoRow, Icon, Count } from '@/styles/UserList';
import { getTodayUsers } from '@/api/user';
import { getWeeklyStats } from '@/api/stats';
import type { UserDetailResponseDto, UserStatsResponseDto } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const SearchHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const Filter = styled.button`
  background-color: #f5e0c9;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-right: 0.2rem;
`;

const BoxText = styled.h2`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.8rem;
  color: var(--color-content-font);
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
`;

const ClickableUserItem = styled(UserItem)`
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const Notice = styled.p`
  text-align: center;
  color: var(--color-content-font);
  margin-top: 1rem;
`;

export default function Participant() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDetailResponseDto[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<UserStatsResponseDto[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userErrorMessage, setUserErrorMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const USERS_PER_PAGE = 7;
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setUserErrorMessage('');

      try {
        const usersRes = await getTodayUsers('a');
        setUsers(usersRes.data);
      } catch (error: unknown) {
        setUserErrorMessage(getErrorMessage(error, '유저 조회에 실패했어요.'));
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await getWeeklyStats();
        setWeeklyStats(statsRes.data);
      } catch {
        // 통계 실패 시에도 참여자 목록은 정상 표시한다.
      }
    };

    fetchStats();
  }, []);

  const commitCountMap = useMemo(() => {
    return weeklyStats.reduce<Record<string, string>>((acc, stat) => {
      acc[stat.username] = stat.commitCount;
      return acc;
    }, {});
  }, [weeklyStats]);

  const sortedUsers = [...users].sort((a, b) => a.username.localeCompare(b.username));

  const filteredUsers = sortedUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    currentPage * USERS_PER_PAGE,
    (currentPage + 1) * USERS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  return (
    <Wrapper>
      <PageHeader title="잔디정원 참여자" />
      <Container>
        <BoxText>정원사들과 이번주 제출 현황을 확인할 수 있어요!</BoxText>
        <SearchHeader>
          <div>
            <Filter onClick={() => setCurrentPage(0)}>이름순</Filter>
          </div>
          <SearchBar
            placeholder="정원사 검색"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
          />
        </SearchHeader>

        {isLoadingUsers && <Notice>불러오는 중...</Notice>}
        {!isLoadingUsers && userErrorMessage && <Notice>{userErrorMessage}</Notice>}
        {!isLoadingUsers && !userErrorMessage && !filteredUsers.length && <Notice>검색 결과가 없어요.</Notice>}

        {!isLoadingUsers && !userErrorMessage && filteredUsers.length > 0 && (
          <UserList>
            {paginatedUsers.map((user, i) => (
              <ClickableUserItem
                key={user.id ?? i}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!user?.id) {
                    alert('유저 정보를 찾을 수 없어요.');
                    return;
                  }
                  navigate(`/mygarden/${user.id}`);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (!user?.id) {
                      alert('유저 정보를 찾을 수 없어요.');
                      return;
                    }
                    navigate(`/mygarden/${user.id}`);
                  }
                }}
              >
                <UserInfoRow>
                  <Left>
                    <Icon>🌱</Icon> {user.username}
                  </Left>
                  <Count>{commitCountMap[user.username] ?? '-'}</Count>
                </UserInfoRow>
              </ClickableUserItem>
            ))}
          </UserList>
        )}
      </Container>

      <FooterPagination>
        {Array.from({ length: totalPages }).map((_, i) => (
          <span
            key={i}
            className={i === currentPage ? 'active' : ''}
            onClick={() => setCurrentPage(i)}
          />
        ))}
      </FooterPagination>
    </Wrapper>
  );
}
