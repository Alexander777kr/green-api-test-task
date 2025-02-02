import { Box, Button, InputBase, TextInput, Title } from '@mantine/core';
import { InputMask } from '@react-input/mask';
import { useApiSettings } from '../../store/apiStore';
import { useShallow } from 'zustand/react/shallow';
import { useValidatedState } from '@mantine/hooks';
import { ChangeEvent, useRef, useState } from 'react';
import { axiosInstance } from '../../api/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

type CheckInstanceType = {
  idInstance: string;
  apiTokenInstance: string;
};

type CheckContactType = CheckInstanceType & { phoneNumber: string };

const checkInstance = async ({
  idInstance,
  apiTokenInstance,
}: {
  idInstance: string;
  apiTokenInstance: string;
}) => {
  try {
    const response = await axiosInstance.get(
      `/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response ? error.response.status : error.message;
    } else if (error instanceof Error) {
      return error.message;
    }
    return 'Произошла неизвестная ошибка';
  }
};

const checkContact = async ({
  phoneNumber,
  idInstance,
  apiTokenInstance,
}: {
  phoneNumber: string;
  idInstance: string;
  apiTokenInstance: string;
}) => {
  try {
    const response = await axiosInstance.post(
      `/waInstance${idInstance}/getContactInfo/${apiTokenInstance}`,
      {
        chatId: `${phoneNumber}@c.us`,
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response ? error.response.status : error.message;
    } else if (error instanceof Error) {
      return error.message;
    }
    return 'Произошла неизвестная ошибка';
  }
};

export default function Login({
  onChangeScreen,
}: {
  onChangeScreen: () => void;
}) {
  const {
    idInstance,
    apiTokenInstance,
    phoneNumber,
    setIdInstance,
    setApiTokenInstance,
    setPhoneNumber,
    setAvatar,
    setName,
    setChatId,
  } = useApiSettings(
    useShallow((state) => ({
      idInstance: state.idInstance,
      apiTokenInstance: state.apiTokenInstance,
      phoneNumber: state.phoneNumber,
      setIdInstance: state.setIdInstance,
      setApiTokenInstance: state.setApiTokenInstance,
      setPhoneNumber: state.setPhoneNumber,
      setAvatar: state.setAvatar,
      setName: state.setName,
      setChatId: state.setChatId,
    }))
  );
  const [currentIdInstance, setCurrentIdInstance] = useState(idInstance);
  const [currentApiTokenInstance, setCurrentApiTokenInstance] =
    useState(apiTokenInstance);
  const [{ value: currentPhoneNumber, valid }, setPhone] = useValidatedState(
    phoneNumber,
    (val) => /^\d{11}$/.test(val),
    true
  );
  const ref = useRef<HTMLElement>(null);

  const mutationInstance = useMutation({
    mutationFn: (obj: CheckInstanceType) => checkInstance(obj),
    onSuccess: (data) => {
      if (data === 'Network Error') {
        toast.error('Неверные данные для входа');
      } else if (data.stateInstance !== 'authorized') {
        toast.error(
          `Проверьте инстанс в личном кабинете, текущий статус инстанса: ${data.stateInstance}`
        );
      } else if (data.stateInstance === 'authorized') {
        toast.success('Успешный инстанс, проверяем номер телефона');
        setIdInstance(currentIdInstance);
        setApiTokenInstance(currentApiTokenInstance);
        setTimeout(() => {
          mutationContact.mutate({
            idInstance: currentIdInstance,
            apiTokenInstance: currentApiTokenInstance,
            phoneNumber: currentPhoneNumber,
          });
        }, 100);
      }
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  const mutationContact = useMutation({
    mutationFn: (obj: CheckContactType) => checkContact(obj),
    onSuccess: (data) => {
      if (data === 400) {
        toast.error(
          'Ошибка при запросе номера телефона, попробуйте ввести другой номер'
        );
      } else if (data.chatId) {
        toast.success('Успешный логин, дождитесь загрузки чата');
        onChangeScreen();
        setPhoneNumber(currentPhoneNumber);
        setAvatar(data.avatar);
        setName(data.name);
        setChatId(data.chatId);
      } else {
        toast.error(`Ошибка: ${data}`);
      }
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  function handleClick() {
    if (!valid || currentPhoneNumber === '') {
      toast.error(
        `Введите правильный номер телефона. Должно быть 11 цифр без пробелов, с кодом страны`
      );
      ref?.current?.focus();
    } else {
      mutationInstance.mutate({
        idInstance: currentIdInstance,
        apiTokenInstance: currentApiTokenInstance,
      });
    }
  }

  return (
    <div>
      <Title order={1} size="h1">
        Введите данные для входа в чат
      </Title>
      <Box
        style={{
          marginTop: '20px',
        }}
      >
        <TextInput
          value={currentIdInstance}
          onChange={(event) => setCurrentIdInstance(event.currentTarget.value)}
          label="idInstance"
          placeholder="idInstance"
        />
      </Box>
      <Box
        style={{
          marginTop: '20px',
        }}
      >
        <TextInput
          value={currentApiTokenInstance}
          onChange={(event) =>
            setCurrentApiTokenInstance(event.currentTarget.value)
          }
          label="apiTokenInstance"
          placeholder="apiTokenInstance"
        />
      </Box>
      <Box
        style={{
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        <InputBase
          value={currentPhoneNumber}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setPhone(event.currentTarget.value)
          }
          label="Номер телефона (только цифры)"
          component={InputMask}
          mask="___________"
          replacement={{ _: /\d/ }}
          placeholder="Номер телефона"
          error={
            !valid ? 'Должно быть 11 цифр без пробелов, с кодом страны' : false
          }
          ref={ref}
        />
      </Box>
      <Button
        onClick={handleClick}
        variant="filled"
        color="indigo"
        size="md"
        radius="md"
      >
        Войти
      </Button>
    </div>
  );
}
