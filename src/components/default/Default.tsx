import { useState } from 'react';
import Login from '../login/Login';
import Chat from '../chat/Chat';

export default function Default() {
  const [screen, setScreen] = useState(0);

  function handleScreenToChat() {
    setScreen(1);
  }

  if (screen === 0) {
    return <Login onChangeScreen={handleScreenToChat} />;
  } else if (screen === 1) {
    return <Chat />;
  }
  return <div>Ошибка приложения</div>;
}
