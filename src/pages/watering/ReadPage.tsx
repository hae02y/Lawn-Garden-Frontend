import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import BlockLabel from '@/styles/BlockLabel';
import PageHeader from '@/components/PageHeader';
import Container from '@/styles/Container';
import ProofItem from '@/components/ProofItem';
import Loading from '@/components/Loading';
import { getPostById } from '@/api/post';
import type { PostDetailDto } from '@/types/api';

const PhotoBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-background);
  border-radius: 1.5rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  gap: 1rem;
  min-height: 21vh;
`;

const Block2 = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-background);
  border-radius: 1.5rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  gap: 1rem;
  min-height: 15vh;
`;

const Notice = styled.p`
  text-align: center;
  color: var(--color-content-font);
  padding: 1rem 0;
`;

export default function ReadPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!postId) {
      setIsLoading(false);
      setErrorMessage('게시글을 찾을 수 없어요.');
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const res = await getPostById(postId);
        setPost(res.data);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('글 불러오기에 실패했어요.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (isLoading) return <Loading />;

  return (
    <Wrapper>
      <PageHeader title="오늘의 잔디정원" />
      <Container>
        {errorMessage && <Notice>{errorMessage}</Notice>}
        {!errorMessage && post && (
          <>
            <ProofItem date={post.createdDate} writer={post.user?.username ?? '-'} />

            <BlockLabel>오늘의 활동 인증</BlockLabel>
            <PhotoBlock>
              {post.image ? (
                <img
                  src={`data:image/png;base64,${post.image}`}
                  alt="인증 이미지"
                  style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: '10px' }}
                />
              ) : (
                <p>이미지가 없습니다</p>
              )}
            </PhotoBlock>

            <BlockLabel>오늘의 한마디</BlockLabel>
            <Block2>
              <p>{post.contents ?? '내용이 없습니다.'}</p>
            </Block2>

            {post.link && (
              <>
                <BlockLabel>첨부 링크</BlockLabel>
                <Block2>
                  <a href={post.link} target="_blank" rel="noreferrer">
                    {post.link}
                  </a>
                </Block2>
              </>
            )}
          </>
        )}
      </Container>
    </Wrapper>
  );
}
