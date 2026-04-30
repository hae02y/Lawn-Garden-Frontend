import { motion, useReducedMotion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
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
  levelUpPulse?: boolean;
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

const TreeImage = styled(motion.img)`
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
`;

const TreeStageImage = styled(TreeImage)<{ $level: number }>`
  width: ${({ $level }) => {
    if ($level <= 1) return 'clamp(250px, 74vw, 320px)';
    if ($level === 2) return 'clamp(275px, 80vw, 350px)';
    if ($level === 3) return 'clamp(300px, 86vw, 380px)';
    if ($level === 4) return 'clamp(318px, 92vw, 405px)';
    return 'clamp(335px, 96vw, 430px)';
  }};
  bottom: ${({ $level }) => ($level >= 4 ? '-14px' : '-8px')};
  filter: ${({ $level }) => {
    if ($level <= 1) return 'saturate(0.82) brightness(0.98)';
    if ($level === 2) return 'saturate(0.95) brightness(1.01)';
    if ($level === 3) return 'saturate(1.05) brightness(1.04)';
    if ($level === 4) return 'saturate(1.15) brightness(1.06)';
    return 'saturate(1.22) brightness(1.1) drop-shadow(0 8px 16px rgba(61, 141, 122, 0.18))';
  }};
  transition: width 0.35s ease, filter 0.35s ease;
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
  animation: sparkle 2.2s ease-in-out infinite;

  @keyframes sparkle {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.78);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }
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

const Fence = styled.div`
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: 12px;
  height: 14px;
  border-radius: 999px;
  background: repeating-linear-gradient(
    90deg,
    rgba(132, 98, 79, 0.92) 0 10px,
    rgba(146, 113, 93, 0.92) 10px 20px
  );
  z-index: 2;
`;

const Stone = styled.div<{ $x: string; $y: string; $size?: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  bottom: ${({ $y }) => $y};
  width: ${({ $size }) => $size ?? '15px'};
  height: ${({ $size }) => $size ?? '11px'};
  border-radius: 50%;
  background: #d2d3cf;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.12);
  z-index: 2;
`;

const Pot = styled.div<{ $x: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  bottom: 16px;
  width: 16px;
  height: 14px;
  border-radius: 2px 2px 6px 6px;
  background: linear-gradient(180deg, #c98c63 0%, #b56f47 100%);
  z-index: 3;

  &::before {
    content: '';
    position: absolute;
    left: -1px;
    right: -1px;
    top: -4px;
    height: 5px;
    border-radius: 8px;
    background: #d39a72;
  }
`;

const fly = keyframes`
  0% { transform: translate(0, 0) scale(0.8); opacity: 0.2; }
  50% { transform: translate(4px, -6px) scale(1); opacity: 0.95; }
  100% { transform: translate(0, 0) scale(0.8); opacity: 0.2; }
`;

const Firefly = styled.div<{ $x: string; $y: string; $delay?: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #ffe78b;
  box-shadow: 0 0 12px rgba(255, 231, 139, 0.82);
  z-index: 3;
  animation: ${fly} 2.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay ?? '0s'};
`;

const LevelUpBadgePop = styled(motion.div)`
  position: absolute;
  top: 16px;
  right: 14px;
  z-index: 5;
  background: linear-gradient(130deg, #3d8d7a 0%, #77b49f 100%);
  color: #fff;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 10px;
  letter-spacing: 0.02em;
`;

const badgeLevelMap: Record<string, number> = {
  SPROUT: 1,
  SAPLING: 2,
  GROWING_TREE: 3,
  BIG_TREE: 4,
  MASTER_GARDENER: 5,
};

export function FrameViewport({
  themeMode,
  treeState,
  treeBadge = 'SPROUT',
  levelUpPulse = false,
}: FrameViewportProps) {
  const stageLevel = badgeLevelMap[treeBadge] ?? 1;
  const reduceMotion = useReducedMotion();
  const canDecorate = stageLevel >= 2;

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

      {canDecorate && <Fence />}
      {stageLevel >= 3 && (
        <>
          <Stone $x="20%" $y="18px" $size="18px" />
          <Stone $x="73%" $y="18px" $size="14px" />
          <Stone $x="77%" $y="12px" $size="11px" />
        </>
      )}
      {stageLevel >= 4 && (
        <>
          <Pot $x="14%" />
          <Pot $x="82%" />
        </>
      )}
      {themeMode === 'night' && stageLevel >= 3 && (
        <>
          <Firefly $x="26%" $y="30%" />
          <Firefly $x="68%" $y="36%" $delay="0.8s" />
          {stageLevel >= 5 && <Firefly $x="54%" $y="24%" $delay="1.5s" />}
        </>
      )}

      {stageLevel >= 2 && <StageSpark $level={stageLevel} $x="26%" $y="45%" />}
      {stageLevel >= 3 && <StageSpark $level={stageLevel} $x="67%" $y="41%" />}
      {stageLevel >= 4 && <StageSpark $level={stageLevel} $x="49%" $y="35%" />}
      {stageLevel >= 5 && <CrownMark>👑</CrownMark>}

      <TreeStageImage
        src={treeImg}
        alt="나무"
        $level={stageLevel}
        initial={reduceMotion ? undefined : { opacity: 0, scale: 0.86 }}
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: 1,
                scale: levelUpPulse ? [1, 1.05, 1] : 1,
              }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 0.9,
                ease: 'easeOut',
                scale: { duration: 0.55, ease: 'easeInOut' },
              }
        }
      />

      {levelUpPulse && (
        <LevelUpBadgePop
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          LEVEL UP!
        </LevelUpBadgePop>
      )}
    </FrameViewportContainer>
  );
}

export default FrameViewport;
