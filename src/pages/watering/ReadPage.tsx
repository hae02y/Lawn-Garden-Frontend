import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import BlockLabel from '@/styles/BlockLabel';
import PageHeader from '@/components/PageHeader';
import Container from '@/styles/Container';
import ProofItem from '@/components/ProofItem';
import Loading from '@/components/Loading';
import { deletePost, getPostById } from '@/api/post';
import { API_BASE_URL } from '@/api/config';
import type { PostDetailDto } from '@/types/api';
import { getErrorMessage } from '@/utils/error';
import { useAuthStore } from '@/store/authStore';

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

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
  background: ${({ $danger }) => ($danger ? '#c54f4f' : '#3d8d7a')};
`;

const resolveImageUrl = (image: string) => {
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_BASE_URL}/images/${encodeURIComponent(image)}`;
};

export default function ReadPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const userId = useAuthStore((state) => state.userId);
  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '글 불러오기에 실패했어요.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const isMine = useMemo(() => {
    if (!post?.user?.id || !userId) return false;
    return post.user.id === userId;
  }, [post, userId]);

  const handleDelete = async () => {
    if (!postId || isDeleting) return;
    const confirmed = window.confirm('이 글을 삭제할까요? 삭제 후 복구할 수 없어요.');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deletePost(postId);
      alert('글이 삭제되었습니다.');
      navigate('/watering');
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, '글 삭제에 실패했어요.'));
    } finally {
      setIsDeleting(false);
    }
  };

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
                  src={resolveImageUrl(post.image)}
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

            {isMine && (
              <ActionRow>
                <ActionButton type="button" onClick={() => navigate(`/watering/${postId}/edit`)}>
                  수정
                </ActionButton>
                <ActionButton type="button" $danger onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? '삭제 중...' : '삭제'}
                </ActionButton>
              </ActionRow>
            )}
          </>
        )}
      </Container>
    </Wrapper>
  );
}
