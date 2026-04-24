import styled from 'styled-components';
import morningBg from '@/assets/background-frame-morning.svg';
import nightBg from '@/assets/background-frame-night.svg';
import sunImg from '@/assets/image-sum.svg';
import treeImg from '@/assets/image-tree.svg';
import cloudImg from '@/assets/image-cloud.svg';
import groundImg from '@/assets/image-ground.svg';

interface TreeState {
  totalDate: number;
  currentDate: number;
}

interface FrameViewportProps {
  themeMode: 'morning' | 'night';
  treeState: TreeState;
}

interface StyledFrameViewportProps {
  $themeMode: 'morning' | 'night';
}

const FrameViewportContainer = styled.div<StyledFrameViewportProps>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 10% 10% / 25% 25% 8% 8%;
  overflow: hidden;
  background: ${({ $themeMode }) =>
    $themeMode === 'morning'
      ? `url(${morningBg}) center / cover no-repeat`
      : `url(${nightBg}) center / cover no-repeat`};
`;

const DayInfoText = styled.div`
  font-weight: 700;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #3d8d7a;
  text-align: center;

  span {
    color: #99bc85;
  }
`;

const SunImage = styled.img`
  position: absolute;
  top: 28px;
  right: 14px;
  width: 92px;
  z-index: 1;
`;

const GroundImage = styled.img`
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
`;

const CloudImage = styled.img<{ $reverse?: boolean }>`
  position: absolute;
  top: 42px;
  width: 170px;
  z-index: 1;
  transform: ${({ $reverse }) => ($reverse ? 'scaleX(-1)' : 'none')};
`;

const FirstCloud = styled(CloudImage)`
  right: 34px;
`;

const SecondCloud = styled(CloudImage)`
  left: 16px;
`;

const TreeImage = styled.img`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 390px;
  z-index: 2;
`;

export function FrameViewport({ themeMode, treeState }: FrameViewportProps) {
  return (
    <FrameViewportContainer $themeMode={themeMode}>
      <DayInfoText>
        <h3>
          기록 <span>{treeState.totalDate}</span>일
        </h3>
        <h3>
          현재 <span>{treeState.currentDate}</span>일
        </h3>
      </DayInfoText>
      {themeMode === 'morning' && <SunImage src={sunImg} alt="해" />}
      <GroundImage src={groundImg} alt="땅" />
      {themeMode === 'morning' && <FirstCloud src={cloudImg} alt="구름1" />}
      {themeMode === 'morning' && <SecondCloud src={cloudImg} alt="구름2" $reverse />}
      <TreeImage src={treeImg} alt="나무" />
    </FrameViewportContainer>
  );
}

export default FrameViewport;
