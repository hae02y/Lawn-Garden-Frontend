import { FrameViewport } from '@/components/FrameViewport';
import ProgressBar from '@/components/ProgressBar';
import Wrapper from '@/styles/Wrapper';
import styled from 'styled-components';

const MyGardenPageContanier = styled.section`
  width: 90vw;
  max-width: 430px;
`;

const UserInfoBox = styled.header`
  background-color: #faf1e6; // Todo : var()로 수정
  width: 100%;
  height: 100px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const UserInfoText = styled.header`
  color: #99bc85;
  span {
    color: #3d8d7a;
  }
`;

const FrameContanier = styled.section`
  width: 100%;
  height: 450px;
  margin-bottom: 10px;
`;

const TreeInfoBox = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #faf1e6;
  width: 100%;
  height: 200px;
  border-radius: 25px;
`;

const TreeInfoText = styled.div`
  color: #3d8d7a;
  span {
    font-size: 17px;
    color: #99bc85;
  }
`;
// 테스팅 데이터
const treeInfo = {
  totalDate: 132,
  currentDate: 22,
  level: 4,
};

export default function Mygarden() {
  return (
    <Wrapper marginBottom>
      {/* <PageHeader */}
      <MyGardenPageContanier>
        <UserInfoBox>
          <UserInfoText>
            <h2>
              <span>aaa</span> 님의 정원
            </h2>
            <h4>
              당신의 레벨 : <span>잔디관리원</span>
            </h4>
          </UserInfoText>
        </UserInfoBox>
        <FrameContanier>
          <FrameViewport themeMode="morning" treeState={treeInfo} />
        </FrameContanier>
        <TreeInfoBox>
          <TreeInfoText>
            <h3>
              지금 내 나무는?
              <br />
              <span>개쩌는나무</span>
            </h3>
          </TreeInfoText>
          <ProgressBar total={20} value={14} />
          {/* Todo : ghchart는 UI용으로 일단 배치만 해 두고 나중에 데이터 형식 오면 거기에 맞춰 구현할 예정 */}
          <img
            src="https://ghchart.rshah.org/xode114kr1"
            alt="GitHub 잔디 그래프"
            style={{ width: '100%', border: 'none', display: 'block' }}
          />
        </TreeInfoBox>
      </MyGardenPageContanier>
    </Wrapper>
  );
}
