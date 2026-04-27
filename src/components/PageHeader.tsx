import styled from 'styled-components';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import backButton from '@/assets/backButton.svg';

interface PageHeaderProps {
  title: string;
  rightButton?: ReactNode;
}

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
  white-space: nowrap;

  h1 {
    font-size: 1.8rem;
    font-weight: bold;
    color: #3d8d7a;
  }
`;
const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
  }

  &:hover {
    transform: scale(1.1);
  }
`;

export default function PageHeader({ title, rightButton }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Header>
      <BackButton type="button" aria-label="뒤로가기" onClick={() => navigate(-1)}>
        <img src={backButton} alt="뒤로가기" />
      </BackButton>
      <h1>{title}</h1>
      {rightButton ?? <span />}
    </Header>
  );
}
