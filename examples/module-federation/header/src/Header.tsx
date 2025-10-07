import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getStore } from './store';
import styles from './Header.module.css';

export default function Header() {
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [notifCount, setNotifCount] = useState<number>(0);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    getStore().then((store) => {
      const update = () => {
        const s = store.getSnapshot();
        setName(s.user?.name ?? 'Guest');
        setAvatar(s.user?.avatar ?? 'https://i.pravatar.cc/100?u=guest');
        setNotifCount(s.notifications.filter((n) => !n.read).length);
      };
      update();
      unsub = store.subscribe(update);
    });
    return () => { unsub?.(); };
  }, []);

  const onLogout = async () => {
    const store = await getStore();
    store.logout();
  };

  return (
    <div className={styles.header}>
      <div className={styles.brand}>ShopCo</div>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
        >
          Home
        </NavLink>
        <NavLink
          to="/catalog"
          className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
        >
          Product Catalog
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
        >
          Orders
        </NavLink>
      </nav>
      <div className={styles.right}>
        <button title="Notifications" className={styles.bellBtn}>
          🔔 {notifCount}
        </button>
        <img src={avatar} alt="avatar" width={28} height={28} className={styles.avatar} />
        <span className={styles.name}>{name}</span>
        <button onClick={onLogout} className={styles.logoutBtn}>Logout</button>
      </div>
    </div>
  );
}
