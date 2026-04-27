import { useRef, useState, type ChangeEvent } from 'react';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import BlockLabel from '@/styles/BlockLabel';
import PageHeader from '@/components/PageHeader';
import Container from '@/styles/Container';
import ProofItem from '@/components/ProofItem';
import Button from '@/components/Button';
import { createPost } from '@/api/post';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/utils/error';

const PhotoBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-background);
  border-radius: 1.5rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  gap: 1rem;
  min-height: 18vh;
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
`;

const CommentBox = styled.textarea`
  resize: none;
  width: 100%;
  border: none;
  padding: 1rem 1.2rem;
  background: var(--color-background);
  font-size: 1rem;
  color: var(--color-content-font);

  &:focus {
    outline: none;
  }
`;

const LinkInput = styled.input`
  width: 100%;
  border: none;
  background: var(--color-background);
  color: var(--color-content-font);
  padding: 1rem 1.2rem;

  &:focus {
    outline: none;
  }
`;

const WriteButton = styled.button`
  background-color: var(--color-light-green);
  border: none;
  color: var(--color-background);
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--color-deep-green);
  }
`;

const PreviewImage = styled.img`
  max-width: 300px;
  height: 15vh;
  border-radius: 12px;
`;

const Notice = styled.p`
  color: #d46a6a;
  margin-top: 0.75rem;
`;

export default function WritePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contents, setContents] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!selectedFile || !contents.trim()) {
      setErrorMessage('이미지와 한마디는 필수로 입력해주세요!');
      return;
    }

    const formData = new FormData();
    formData.append('contents', contents);
    formData.append('imageFile', selectedFile);

    if (link.trim()) {
      formData.append('link', link.trim());
    }

    try {
      setIsSubmitting(true);
      await createPost(formData);
      alert('물주기 글이 작성되었습니다!');
      navigate('/watering');
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, '글 작성에 실패했어요.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <PageHeader title="오늘의 잔디정원" />
      <Container>
        <ProofItem date={today} writer="나" />

        <BlockLabel>오늘의 활동 인증</BlockLabel>
        <PhotoBlock>
          {!previewUrl && <WriteButton onClick={handleButtonClick}>첨부하기</WriteButton>}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          {previewUrl && <PreviewImage src={previewUrl} alt="선택한이미지" />}
        </PhotoBlock>

        <BlockLabel>첨부 링크</BlockLabel>
        <Block2>
          <LinkInput
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="참고 링크가 있다면 입력해주세요"
          />
        </Block2>

        <BlockLabel>오늘의 한마디</BlockLabel>
        <Block2>
          <CommentBox
            value={contents}
            onChange={(e) => setContents(e.target.value)}
            placeholder={
              '오늘의 한마디를 작성해주세요!\n오늘 공부한 내용이나 기분, 어떤한 내용이든 좋습니다 :)'
            }
          />
        </Block2>

        <Button $marginB="0px" $bgColor="#A3D1C6" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '글 작성하기'}
        </Button>
        {errorMessage && <Notice>{errorMessage}</Notice>}
      </Container>
    </Wrapper>
  );
}
