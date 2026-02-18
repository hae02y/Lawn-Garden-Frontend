import { useNavigate } from 'react-router-dom';
import styled from 'styled-components'
import Wrapper from '@/styles/Wrapper'
import ArrowButton from '@/components/ArrowButton'
import { useAuthStore } from '@/store/authStore';

const HeaderText = styled.header`
    color: var(--color-light-green);
    margin-bottom: 12vh;
    span {
        color: var(--color-deep-green);
    }
`

const UserNameButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    color: var(--color-deep-green);
    font-size: inherit;
    font-weight: inherit;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`
const SignsSection = styled.section`
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    gap: 1.15rem;
    margin-top: 0.5rem;
`
const Pole = styled.div`
    width: 15px;
    background-color: #997C70;
    border-radius: 6px;
    position: absolute;
    left: 50%;
    top: -5vh;
    bottom: 0;
    height: 100vh;
`
export default function Main() {
  const navigate = useNavigate();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);
  const username = useAuthStore((state) => state.username);
  const userId = useAuthStore((state) => state.userId);
  
    const handleLogout = () => {
      clearAccessToken();      // Zustand 토큰 제거
      localStorage.clear();    // 혹시 localStorage에 저장한 값도 있다면 같이 삭제
      navigate('/');           
    };

  return (
    <Wrapper marginBottom>
      <HeaderText>
        <h2>안녕하세요!<br />
        <UserNameButton
          type="button"
          onClick={() =>
            navigate(userId ? `/mygarden/${userId}` : '/mygarden')
          }
        >
          {username ?? '아이디'}
        </UserNameButton> 님!</h2>
        <p>당신의 레벨: <span>잔디관리인</span></p>
      </HeaderText>

      <SignsSection>
      <Pole />
        <ArrowButton direction='left' text='잔디에 물주기' angle={4}
        onClick={() => navigate('/watering')}/>
        <ArrowButton direction='right' text='인증 내역 확인' angle={-4}
        onClick={() => navigate('/laydown')}
        />
        <ArrowButton direction='left' text='잔디정원 참여자' angle={10}
        onClick={() => navigate('/farmer')}
        />
        <ArrowButton direction='right' text='아침에사과' angle={-5}
        onClick={() => navigate('/mail')}
        />
        <ArrowButton direction='center' text='로그아웃' angle={2}
          onClick={handleLogout}/>
      </SignsSection>
    </Wrapper>
  )
}
