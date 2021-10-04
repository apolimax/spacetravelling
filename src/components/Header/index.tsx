import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.scss';

export default function Header() {
  return (
    <Link href="/">
      <header className={styles.header}>
        <Image src="/logo.svg" width="40" height="23.01" alt="logo" />
        <Image src="/spacetraveling.svg" width="172.09" height="23.63" alt="logo" />
        <Image src="/dot.svg" width="4.09" height="4.09" />
      </header>
    </Link>
  )
}
