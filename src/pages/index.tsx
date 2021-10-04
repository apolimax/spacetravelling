import Link from 'next/link';
import { GetStaticProps } from 'next';

import Head from 'next/head';
import Prismic from '@prismicio/client'
import { FiCalendar } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';

import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ next_page, results }: PostPagination) {
  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  function treatNewPosts(newPosts) {
    const treatedPosts = newPosts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    return treatedPosts;
  }

  function handleLoadMorePosts() {
    try {
      fetch(nextPage)
        .then(resp => resp.json())
        .then(newPosts => {
          setNextPage(newPosts.next_page);
          const treatedPosts = treatNewPosts(newPosts);
          setPosts([...posts, ...treatedPosts])
          // console.log("treatedPosts", [...posts, ...treatedPosts])
        })
        .catch()
    } catch (error) {
      console.log('Erro ao carregar mais posts')
    }
  }

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <main className={styles.postsContent}>
        {posts.map(post => (
          <div className={styles.postContainer} key={post.uid}>
            <Link href={`/post/${post.uid}`}>{post.data.title}</Link>
            <p>{post.data.subtitle}</p>
            <div className={styles.postInfo}>
              <div className={styles.postPublicationDate}>
                <FiCalendar />
                <span>
                  {post.first_publication_date}
                </span>
              </div>
              <div className={styles.postPublicationAuthor}>
                <FiUser />
                <span>
                  {post.data.author}
                </span>
              </div>
            </div>
          </div>
        )
        )}
      </main>
      {nextPage && <p className={styles.CarregarMaisPosts} onClick={handleLoadMorePosts}>Carregar mais posts</p>}
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content', 'post.banner'],
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const nextPage = postsResponse.next_page

  // console.log("props", {
  //   results: posts,
  //   next_page: nextPage
  // })

  return {
    props: {
      next_page: nextPage,
      results: posts
    }
  }
};
