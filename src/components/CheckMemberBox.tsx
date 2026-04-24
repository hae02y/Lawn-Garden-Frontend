import styled from 'styled-components';
import { UserList, UserItem, Icon } from '@/styles/UserList';
import type { UserDetailResponseDto } from '@/types/api';

interface CheckMemberBoxProps {
  title: string;
  description: string;
  icon: string;
  list: UserDetailResponseDto[];
  onUserClick?: (user: UserDetailResponseDto) => void;
}

const Container = styled.section`
  background-color: var(--color-container-background);
  flex: 1;
  width: 50vh;
  border-radius: 30px;
  padding: 1.6rem 1.35rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BoxTitle = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--color-content-font);

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const SubText = styled.p`
  text-align: center;
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ClickableUserItem = styled(UserItem)`
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.li`
  text-align: center;
  color: var(--color-content-font);
  padding: 0.6rem 0;
`;

export default function CheckMemberBox({ title, description, icon, list, onUserClick }: CheckMemberBoxProps) {
  return (
    <Container>
      <BoxTitle>{title}</BoxTitle>
      <SubText>{description}</SubText>
      <UserList>
        {!list.length && <EmptyState>아직 없어요.</EmptyState>}
        {list.map((user, i) => (
          <ClickableUserItem
            key={user.id ?? i}
            role="button"
            tabIndex={0}
            onClick={() => onUserClick?.(user)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onUserClick?.(user);
              }
            }}
          >
            <Icon>{icon}</Icon>
            {user.username}
          </ClickableUserItem>
        ))}
      </UserList>
    </Container>
  );
}
