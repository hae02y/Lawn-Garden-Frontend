// 로그인 및 회원가입 가운데 정렬

// import styled from 'styled-components';

// const Wrapper = styled.main`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   text-align: center;
//   ${({ marginBottom }) => marginBottom && `margin-bottom: 9vh;`}
// `

// export default Wrapper;

// 애니메이션 추가
import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { Variants } from 'framer-motion';

// styled-components에 전달될 prop의 타입을 정의합니다.
interface AnimatedWrapperProps {
  marginBottom?: boolean;
}

// 컴포넌트가 받을 props 타입을 정의합니다.
interface WrapperProps {
  children: ReactNode;
  marginBottom?: boolean;
}

const AnimatedWrapper = styled(motion.main)<AnimatedWrapperProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  ${({ marginBottom }) => marginBottom && `margin-bottom: 9vh;`}
`;

const wrapperVariants: Variants = {
  initial: {
    opacity: 0,
    x: -60,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    scale: 0.96,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

export default function Wrapper({ children, marginBottom }: WrapperProps) {
  return (
    <AnimatedWrapper
      marginBottom={marginBottom}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={wrapperVariants}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {children}
    </AnimatedWrapper>
  );
}
