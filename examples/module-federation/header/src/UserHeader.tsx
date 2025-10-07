import React, { useEffect, useState } from 'react';
import { getStore } from './store';

export default function UserHeader() {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ fontWeight: 700 }}>ShopCo</div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button title="Notifications" style={{ background: 'transparent', color: '#e6e9f0', border: '1px solid #24335c', padding: '6px 10px', borderRadius: 8 }}>
          🔔 {notifCount}
        </button>
        <img src={avatar} alt="avatar" width={28} height={28} style={{ borderRadius: '50%' }} />
        <span style={{ opacity: .9 }}>{name}</span>
        <button onClick={onLogout} style={{ background: '#22335d', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 8 }}>Logout</button>
      </div>
    </div>
  );
}
