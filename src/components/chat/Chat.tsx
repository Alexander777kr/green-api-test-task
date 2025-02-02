import { useShallow } from 'zustand/react/shallow';
import { useApiSettings } from '../../store/apiStore';
import { Button, Flex, TextInput, Title } from '@mantine/core';
import { axiosInstance } from '../../api/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { parsePhone, sleep } from '../../utils/utils';
import toast from 'react-hot-toast';

type MessagesType = {
  sender: string;
  data: string;
  id: string;
};

type SendMessageType = {
  idInstance: string;
  apiTokenInstance: string;
  chatId: string;
  message: string;
};

const getNotification = async ({
  idInstance,
  apiTokenInstance,
}: {
  idInstance: string;
  apiTokenInstance: string;
}) => {
  try {
    const response = await axiosInstance.get(
      `/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`
    );
    const receiptId = response.data?.receiptId;
    if (receiptId) {
      sleep(100);
      await axiosInstance.delete(
        `/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`
      );
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Произошла неизвестная ошибка';
  }
};

const sendMessage = async ({
  idInstance,
  apiTokenInstance,
  chatId,
  message,
}: SendMessageType) => {
  try {
    const response = await axiosInstance.post(
      `/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
      {
        chatId,
        message,
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Произошла неизвестная ошибка';
  }
};

export default function Chat() {
  const { idInstance, apiTokenInstance, phoneNumber, name, avatar, chatId } =
    useApiSettings(
      useShallow((state) => ({
        idInstance: state.idInstance,
        apiTokenInstance: state.apiTokenInstance,
        phoneNumber: state.phoneNumber,
        name: state.name,
        avatar: state.avatar,
        chatId: state.chatId,
      }))
    );
  const [messages, setMessages] = useState<Array<MessagesType>>([]);
  const [textValue, setTextValue] = useState('');
  const queryClient = useQueryClient();

  const { data, error } = useQuery({
    queryKey: ['notification'],
    queryFn: () => getNotification({ idInstance, apiTokenInstance }),
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (data === null) {
      return;
    }
    if (data?.body?.messageData?.textMessageData?.textMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.body?.idMessage,
          sender: data.body?.senderData?.sender,
          data: data.body.messageData.textMessageData.textMessage,
        },
      ]);
    }
    if (data?.body?.messageData?.extendedTextMessageData?.text) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.body?.idMessage,
          sender: data?.body?.senderData?.sender,
          data: data.body.messageData.extendedTextMessageData.text,
        },
      ]);
    }
  }, [data]);

  const mutationSendText = useMutation({
    mutationFn: (obj: SendMessageType) => sendMessage(obj),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  function handleSendMessage() {
    mutationSendText.mutate({
      idInstance,
      apiTokenInstance,
      chatId,
      message: textValue,
    });
    setTextValue('');
  }

  if (error) {
    toast.error('Ошибка приложения, проверьте инстанс');
    return <div>Ошибка приложения, проверьте инстанс</div>;
  }

  return (
    <div
      style={{
        margin: 0,
      }}
    >
      <Flex
        direction="column"
        wrap="nowrap"
        style={{
          minHeight: '80vh',
          margin: 0,
          minWidth: '80vw',
        }}
      >
        <header>
          <Flex
            direction="row"
            gap={5}
            wrap="wrap"
            align="center"
            style={{
              marginBottom: '20px',
            }}
          >
            <img
              src={avatar}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
              }}
            />
            <Title order={1} size="h4">
              {name || 'Без имени'}
            </Title>
            <Title order={2} size="h4">
              ({parsePhone(phoneNumber) || phoneNumber})
            </Title>
          </Flex>
        </header>
        <main
          style={{
            flexGrow: 1,
            border: '1px solid black',
          }}
        >
          <Flex
            direction="column"
            wrap="nowrap"
            gap="30px"
            style={{
              marginTop: '30px',
              marginBottom: '30px',
            }}
          >
            {messages.map((message) => {
              if (message.sender.includes(phoneNumber)) {
                return (
                  <div
                    key={message.id}
                    style={{
                      padding: '20px',
                      width: '30vw',
                      border: '1px solid black',
                      borderRadius: '30px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {message.data}
                  </div>
                );
              } else {
                return (
                  <div
                    key={message.id}
                    style={{
                      alignSelf: 'end',
                      padding: '20px',
                      width: '30vw',
                      border: '1px solid black',
                      borderRadius: '30px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {message.data}
                  </div>
                );
              }
            })}
          </Flex>
        </main>
        <footer
          style={{
            flexShrink: 0,
            marginTop: '20px',
          }}
        >
          <Flex direction="row" wrap="nowrap" gap="10px">
            <TextInput
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder="Custom layout"
              style={{
                flexGrow: 1,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button variant="filled" onClick={handleSendMessage}>
              Отправить
            </Button>
          </Flex>
        </footer>
      </Flex>
    </div>
  );
}
