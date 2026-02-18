// 잔디정원 참여자 조회 farmer
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper'
import PageHeader from '@/components/PageHeader'
import Container from '@/styles/Container'
import SearchBar from '@/components/SearchBar'
import { FooterPagination } from '@/styles/FooterPagination';
import { UserList, UserItem, UserInfoRow, Icon, Count,} from '@/styles/UserList';
// import { participants } from '@/data/proofData';
// 유저 정보 불러오기
import { getAllUsers } from '@/api/user';

const SearchHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* gap: 0.7rem; */
    margin-bottom: 1rem;
`

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


export default function Participant() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  // 페이지네이션 프론트에서 구현
  const [currentPage, setCurrentPage] = useState(0);
  const USERS_PER_PAGE = 7;

  // 정렬 버튼
  const [sortBy, setSortBy] = useState('name'); // or 'level'

  // 검색
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data); // 서버에서 온 데이터 저장
      } catch (err) {
        console.error('유저 조회 실패:', err.response?.data || err.message);
      }
    };

    fetchUsers();
  }, []);

  const sortedUsers = [...users];

  if (sortBy === 'name') {
    sortedUsers.sort((a, b) => a.username.localeCompare(b.username));
  }
  
  // 필터링된 유저 목록
  const filteredUsers = sortedUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    currentPage * USERS_PER_PAGE,
    (currentPage + 1) * USERS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  // 페이지별 유저 잘라내기
  // const paginatedUsers = sortedUsers.slice(
  //   currentPage * USERS_PER_PAGE,
  //   (currentPage + 1) * USERS_PER_PAGE
  // );
  
  // const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

  return (
     <Wrapper>
        <PageHeader title="잔디정원 참여자"/>
            <Container>
                <BoxText>
                    정원사들과 이번주 제출 현황을 확인할 수 있어요!
                </BoxText>
                <SearchHeader>
                    <div>
                    <Filter onClick={() => {
                        setSortBy('name');
                        setCurrentPage(0); //클릭시 페이지 초기화
                      }}
                    >이름순</Filter>
                    {/* <Filter>레벨순</Filter> */}
                    </div>
                    <SearchBar placeholder='정원사 검색'
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(0); 
                      }}
                    />
                </SearchHeader>
                
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
                        <Count>-</Count>
                        {/* <Count>{user.count}</Count> */}
                      </UserInfoRow>
                    </ClickableUserItem>
                    ))}
                </UserList>
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
  )
}
