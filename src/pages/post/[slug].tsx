import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import { RichText } from 'prismic-dom';
import { FiCalendar } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useEffect, useState } from 'react';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string | undefined;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const [postBlog, setPostBlog] = useState<Post>(post)
  const router = useRouter();

  useEffect(() => {
    setPostBlog(post)
  }, [post])

  // if (post) {
  //   const totalWordsContent = post.data.content.reduce(((acc, curr) => {
  //     const content = curr.body.text.split(" ").length
  //     return acc += content
  //   }), 0)
  //   console.log('totalWordsContent', totalWordsContent)
  // }
  // const ContentBodyArray = [...postBlog?.data.content.map(item => item.body.text)]
  // console.log('ContentBodyArray', JSON.stringify(ContentBodyArray, null, 2))

  // .map(body => )

  // console.log('POST', post)

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <div className={styles.postContainer}>
      <img src={post.data.banner.url} />
      <h1>{post.data.title}</h1>
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
        <div className={styles.postPublicationTime}>
          <FiClock />
          <span>
            4 min
          </span>
        </div>
      </div>
      <div>
        {post.data.content.map(item => (
          <div key={item.heading}>
            <h2>{item.heading}</h2>
            <div>{item.body.text.map(phrase => (
              <p className={styles.bodyContent} key={Math.random()}>{phrase}</p>
            ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content', 'post.banner'],
    pageSize: 1,
  });

  return {
    paths: [{ params: { slug: posts.results[0].uid } }],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID("post", String(slug), {});

  // console.log("response", JSON.stringify(response, null, 2));

  const post = {
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    data: {
      title: (response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: (response.data.author),
      // content: RichText.asHtml(response.data.content.body),
      content: {
        heading: "",
        body: {
          text: "",
        },
      },
    }
  }

  // console.log("post", JSON.stringify(post, null, 2))

  post.data.content = response.data.content.map(data => {
    return {
      heading: (data.heading),
      body: {
        text: data.body.map(item => item.text)
      }
    }
  })

  // console.log("post", JSON.stringify(post, null, 2))

  return {
    props: {
      post
    },
    revalidate: 60 * 30
  }
};
