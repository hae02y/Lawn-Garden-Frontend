import styled from 'styled-components';
import morningBg from '@/assets/background-frame-morning.svg';
import nightBg from '@/assets/background-frame-night.svg';
import sumImg from '@/assets/image-sum.svg';
import treeImg from '@/assets/image-tree.svg';
import cloudImg from '@/assets/image-cloud.svg';
import groungImg from '@/assets/image-ground.svg';

const FrameViewportContanier = styled.div<StyledFrameViewportProps>`
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
  font-weight: bold;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #3d8d7a;
  span {
    color: #99bc85;
  }
`;

const SumImage = styled.img`
  position: absolute;
  top: 30px;
  right: 10px;
  width: 100px;
  z-index: 1;
`;

const GroundImage = styled.img`
  position: absolute;
  right: 0px;
  bottom: 0px;
  z-index: 1;
  width: 100%;
`;

const CloudFirstImage = styled.img`
  position: absolute;
  top: 100px;
  right: 40px;
  z-index: 1;
  width: 180px;
`;

const CloudSecondImage = styled.img`
  position: absolute;
  top: 30px;
  left: 20px;
  z-index: 1;
  width: 180px;
  transform: scaleX(-1);
`;

const TreeImage = styled.img`
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  z-index: 2;
`;

interface StyledFrameViewportProps {
  $themeMode: 'morning' | 'night';
}

interface FrameViewportProps {
  themeMode: 'morning' | 'night';
  treeState: any;
}

export function FrameViewport({ themeMode, treeState }: FrameViewportProps) {
  return (
    <FrameViewportContanier $themeMode={themeMode}>
      <DayInfoText>
        <h3>
          기록 <span>{treeState.totalDate}</span>일
        </h3>
        <h3>
          현재 <span>{treeState.currentDate}</span>일
        </h3>
      </DayInfoText>
      {themeMode === 'morning' && <SumImage src={sumImg} alt="해" />}
      <GroundImage src={groungImg} alt="땅" />
      {themeMode === 'morning' && (
        <CloudFirstImage src={cloudImg} alt="구름1" />
      )}
      {themeMode === 'morning' && (
        <CloudSecondImage src={cloudImg} alt="구름2" />
      )}
      <TreeImage src={treeImg} alt="나무" />
    </FrameViewportContanier>
  );
}
