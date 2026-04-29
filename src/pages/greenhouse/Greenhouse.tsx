import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import Container from '@/styles/Container';
import SearchBar from '@/components/SearchBar';
import { FooterPagination } from '@/styles/FooterPagination';
import {
  getGeekNews,
  getMyBookmarkedGeekNews,
  markGeekNewsRead,
  toggleGeekNewsBookmark,
} from '@/api/geeknews';
import type { GeekNewsResponseDto } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const Intro = styled.p`
  color: var(--color-content-font);
  margin-bottom: 1rem;
`;

const SearchHeader = styled.header`
  display: flex;
   justify-content: space-between;
   align-items: center;
   gap: 0.7rem;
  margin-bottom: 1rem;
`;

const ModeSwitch = styled.div`
  display: flex;
  gap: 0.35rem;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-weight: 700;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#3d8d7a' : '#dad6d2')};
  color: ${({ $active }) => ($active ? '#fff' : '#57504c')};
`;

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  text-align: left;
`;

const ListViewport = styled.div`
  width: 100%;
  max-height: min(54vh, 520px);
  overflow-y: auto;
  padding-right: 0.2rem;
`;

const NewsCard = styled.li`
  background: var(--color-background);
  border-radius: 20px;
  padding: 0.85rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const NewsTitle = styled.h3`
  color: var(--color-deep-green);
  font-size: 1.05rem;
  margin-bottom: 0.35rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Summary = styled.p`
  color: var(--color-content-font);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

const BookmarkButton = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#ffffff' : '#3d8d7a')};
  background: ${({ $active }) => ($active ? '#3d8d7a' : '#eef5f3')};
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
  const [viewMode, setViewMode] = useState<'all' | 'bookmarks'>('all');
  const PAGE_SIZE = 6;

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response =
          viewMode === 'bookmarks'
            ? await getMyBookmarkedGeekNews({ page: currentPage, size: PAGE_SIZE })
            : await getGeekNews({
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
  }, [currentPage, keyword, viewMode]);

  const handleBookmark = async (item: GeekNewsResponseDto) => {
    if (!item.id) return;
    try {
      const response = await toggleGeekNewsBookmark(item.id, !item.bookmarked);
      setItems((prev) =>
        prev.map((news) =>
          news.id === item.id
            ? {
                ...news,
                bookmarked: response.data.bookmarked,
                read: response.data.read,
                readAt: response.data.readAt,
              }
            : news
        )
      );
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, '북마크 변경에 실패했어요.'));
    }
  };

  const handleReadAndOpen = async (item: GeekNewsResponseDto) => {
    if (item.id) {
      try {
        const response = await markGeekNewsRead(item.id);
        setItems((prev) =>
          prev.map((news) =>
            news.id === item.id
              ? {
                  ...news,
                  bookmarked: response.data.bookmarked,
                  read: response.data.read,
                  readAt: response.data.readAt,
                }
              : news
          )
        );
      } catch {
        // 읽음 처리 실패 시에도 원문 이동은 허용한다.
      }
    }
    window.open(item.link, '_blank', 'noopener,noreferrer');
  };

  const hasResult = useMemo(() => items.length > 0, [items]);

  return (
    <Wrapper>
      <PageHeader title="비닐하우스" />
      <Container>
        <Intro>GeekNews 최신 동향을 정원에서 바로 확인해보세요.</Intro>

        <SearchHeader>
          <ModeSwitch>
            <ModeButton
              type="button"
              $active={viewMode === 'all'}
              onClick={() => {
                setViewMode('all');
                setCurrentPage(0);
              }}
            >
              전체
            </ModeButton>
            <ModeButton
              type="button"
              $active={viewMode === 'bookmarks'}
              onClick={() => {
                setViewMode('bookmarks');
                setCurrentPage(0);
              }}
            >
              북마크
            </ModeButton>
          </ModeSwitch>
          <SearchBar
            placeholder="키워드 검색"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setCurrentPage(0);
            }}
            disabled={viewMode === 'bookmarks'}
          />
        </SearchHeader>

        {isLoading && <Notice>불러오는 중...</Notice>}
        {!isLoading && errorMessage && <Notice>{errorMessage}</Notice>}
        {!isLoading && !errorMessage && !hasResult && <Notice>표시할 소식이 없어요.</Notice>}

        {!isLoading && !errorMessage && hasResult && (
          <ListViewport>
            <List>
              {items.map((news) => {
                const title = news.title?.trim() || '제목 정보가 없어요.';
                const summary = news.summary?.trim() || '요약 정보가 없어요.';

                return (
                  <NewsCard key={news.id ?? news.sourceId}>
                    <NewsTitle>
                      {news.read ? '✓ ' : ''}
                      {title}
                    </NewsTitle>
                    <Summary>{summary}</Summary>
                    <Meta>
                      <DateText>{formatPublishedAt(news.publishedAt)}</DateText>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <BookmarkButton
                          type="button"
                          $active={news.bookmarked}
                          onClick={() => handleBookmark(news)}
                        >
                          {news.bookmarked ? '저장됨' : '저장'}
                        </BookmarkButton>
                        <LinkButton
                          href={news.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => {
                            event.preventDefault();
                            handleReadAndOpen(news);
                          }}
                        >
                        원문 보기
                        </LinkButton>
                      </div>
                    </Meta>
                  </NewsCard>
                );
              })}
            </List>
          </ListViewport>
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
