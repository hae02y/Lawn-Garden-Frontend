import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import Container from '@/styles/Container';
import SearchBar from '@/components/SearchBar';
import { FooterPagination } from '@/styles/FooterPagination';
import { getGeekNews } from '@/api/geeknews';
import type { GeekNewsResponseDto } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const Intro = styled.p`
  color: var(--color-content-font);
  margin-bottom: 1rem;
`;

const SearchHeader = styled.header`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  text-align: left;
`;

const NewsCard = styled.li`
  background: var(--color-background);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const NewsTitle = styled.h3`
  color: var(--color-deep-green);
  font-size: 1.05rem;
  margin-bottom: 0.45rem;
`;

const Summary = styled.p`
  color: var(--color-content-font);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.7rem;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
`;

const DateText = styled.span`
  color: #8f7e79;
  font-size: 0.85rem;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  background: #3d8d7a;
  text-decoration: none;

  &:hover {
    background: #337765;
  }
`;

const Notice = styled.p`
  color: var(--color-content-font);
  text-align: center;
  padding: 1.2rem 0;
`;

const formatPublishedAt = (value: string | null) => {
  if (!value) return '발행일 미상';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '발행일 미상';

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function Greenhouse() {
  const [items, setItems] = useState<GeekNewsResponseDto[]>([]);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getGeekNews({
          page: currentPage,
          size: PAGE_SIZE,
          keyword: keyword.trim() || undefined,
        });

        setItems(response.data.items);
        setTotalPages(response.data.totalPages);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '비닐하우스 소식을 불러오지 못했어요.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [currentPage, keyword]);

  const hasResult = useMemo(() => items.length > 0, [items]);

  return (
    <Wrapper>
      <PageHeader title="비닐하우스" />
      <Container>
        <Intro>GeekNews 최신 동향을 정원에서 바로 확인해보세요.</Intro>

        <SearchHeader>
          <SearchBar
            placeholder="키워드 검색"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setCurrentPage(0);
            }}
          />
        </SearchHeader>

        {isLoading && <Notice>불러오는 중...</Notice>}
        {!isLoading && errorMessage && <Notice>{errorMessage}</Notice>}
        {!isLoading && !errorMessage && !hasResult && <Notice>표시할 소식이 없어요.</Notice>}

        {!isLoading && !errorMessage && hasResult && (
          <List>
            {items.map((news) => (
              <NewsCard key={news.id ?? news.sourceId}>
                <NewsTitle>{news.title}</NewsTitle>
                <Summary>{news.summary ?? '요약 정보가 없어요.'}</Summary>
                <Meta>
                  <DateText>{formatPublishedAt(news.publishedAt)}</DateText>
                  <LinkButton href={news.link} target="_blank" rel="noreferrer">
                    원문 보기
                  </LinkButton>
                </Meta>
              </NewsCard>
            ))}
          </List>
        )}
      </Container>

      <FooterPagination>
        {Array.from({ length: totalPages }).map((_, i) => (
          <span
            key={i}
            className={i === currentPage ? 'active' : ''}
            onClick={() => {
              setCurrentPage(i);
              window.scrollTo(0, 0);
            }}
          />
        ))}
      </FooterPagination>
    </Wrapper>
  );
}
