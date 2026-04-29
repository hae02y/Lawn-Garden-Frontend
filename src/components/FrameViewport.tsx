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
  treeBadge?: string;
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
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
`;

const TreeStageImage = styled(TreeImage)<{ $level: number }>`
  width: ${({ $level }) => {
    if ($level <= 1) return '320px';
    if ($level === 2) return '350px';
    if ($level === 3) return '380px';
    if ($level === 4) return '405px';
    return '430px';
  }};
  filter: ${({ $level }) => {
    if ($level <= 1) return 'saturate(0.82) brightness(0.98)';
    if ($level === 2) return 'saturate(0.95) brightness(1.01)';
    if ($level === 3) return 'saturate(1.05) brightness(1.04)';
    if ($level === 4) return 'saturate(1.15) brightness(1.06)';
    return 'saturate(1.22) brightness(1.1) drop-shadow(0 8px 16px rgba(61, 141, 122, 0.18))';
  }};
  z-index: 2;
`;

const StageSpark = styled.div<{ $level: number; $x: string; $y: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: ${({ $level }) => ($level >= 4 ? '12px' : '9px')};
  height: ${({ $level }) => ($level >= 4 ? '12px' : '9px')};
  border-radius: 999px;
  background: ${({ $level }) => ($level >= 4 ? '#f7d57a' : '#a4d7b6')};
  box-shadow: 0 0 12px rgba(164, 215, 182, 0.5);
  z-index: 3;
`;

const CrownMark = styled.div`
  position: absolute;
  left: 50%;
  bottom: 52%;
  transform: translateX(-50%);
  font-size: 24px;
  z-index: 4;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.18));
`;

const badgeLevelMap: Record<string, number> = {
  SPROUT: 1,
  SAPLING: 2,
  GROWING_TREE: 3,
  BIG_TREE: 4,
  MASTER_GARDENER: 5,
};

export function FrameViewport({ themeMode, treeState, treeBadge = 'SPROUT' }: FrameViewportProps) {
  const stageLevel = badgeLevelMap[treeBadge] ?? 1;

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

      {stageLevel >= 2 && <StageSpark $level={stageLevel} $x="26%" $y="45%" />}
      {stageLevel >= 3 && <StageSpark $level={stageLevel} $x="67%" $y="41%" />}
      {stageLevel >= 4 && <StageSpark $level={stageLevel} $x="49%" $y="35%" />}
      {stageLevel >= 5 && <CrownMark>👑</CrownMark>}

      <TreeStageImage src={treeImg} alt="나무" $level={stageLevel} />
    </FrameViewportContainer>
  );
}

export default FrameViewport;
