import styled from 'styled-components';

interface ProgressBarProps {
  total: number;
  value: number;
}

interface FillBarProps {
  $rate: number;
}

const Bar = styled.div`
  overflow: hidden;
  position: relative;
  width: 90%;
  height: 30px;
  background-color: #d7ecd4;
  border-radius: 999px;
`;

const FillBar = styled.div<FillBarProps>`
  position: absolute;
  width: ${({ $rate }) => `${$rate}%`};
  height: 100%;
  background-color: #91c59e;
  z-index: 1;
`;

const BarInfoText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: absolute;
  color: white;
  font-weight: bold;
  z-index: 2;
`;

export default function ProgressBar({ total, value }: ProgressBarProps) {
  const rate = total > 0 ? (value / total) * 100 : 0;

  return (
    <Bar>
      <FillBar $rate={Math.min(100, Math.max(0, rate))} />
      <BarInfoText>
        {value}/{total}
      </BarInfoText>
    </Bar>
  );
}
