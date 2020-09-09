import { Request, Response } from 'express';
import { add } from 'date-fns';
import Database from '../database/schema';
import api from '../services/api';

interface GetUpdatesResponse {
  result: ResultResponse[];
}

interface ResultResponse {
  update_id: number;
  message: {
    photo: string;
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
    };
    chat: {
      id: number;
      title: string;
      first_name: string;
      last_name: string;
      username: string;
      type: string;
    };
    date: number;
    text: string;
  };
}

class MessageController {
  async save(req: Request, res: Response) {
    const response = await api.post<GetUpdatesResponse>('getUpdates');

    const field: any = response.data.result.pop();

    const chat_id = field.message.chat.id;
    const { text } = field.message;
    const reply_to_message_id = field.message.message_id;
    const { title } = field.message.chat;

    const data = new Date();

    const signals: String[] = text.split('/\t/');
    signals.forEach(async x => {
      function newText(): string {
        const numOfLines = x.split('\n');
        let ativo: string;
        let expiracao: string;
        let direcao: string;
        let horarioDeEntrada: string;

        if (numOfLines[0].startsWith('2')) {

          ativo = numOfLines[3].replace('Ativo: ', '');
          direcao = numOfLines[5].includes('Call') ? 'Call' : 'Put';
          expiracao = numOfLines[6].substring(11, 13);
          if (numOfLines[7].includes('1')) {
            const time = add(data, { minutes: 1 });
            const hour = time.getHours().toString();
            const min = time.getMinutes().toString();
            horarioDeEntrada = `${hour}:${min}`.toString();
          } else {
            const time = add(data, { minutes: 5 });
            // eslint-disable-next-line prefer-const
            const hour = time.getHours().toString();
            let min = time.getMinutes().toString();

            min = (Math.ceil(Number(min) / 5) * 5).toString();

            if (Number(min) < 10) {
              min = '0' + min
            }
            horarioDeEntrada = `${hour}:${min}`.toString();
          }
        } else {
          ativo = numOfLines[2].replace('Ativo: ', '');
          direcao = numOfLines[4].includes('Call') ? 'Call' : 'Put';
          if (numOfLines[6].includes('1')) {
            const time = add(data, { minutes: 1 });
            const hour = time.getHours().toString();
            let min = time.getMinutes().toString();
            if (Number(min) < 10) {
              min = '0' + min;
            }
            horarioDeEntrada = `${hour}:${min}`.toString();
          } else {
            const time = data;
            // eslint-disable-next-line prefer-const
            const hour = time.getHours().toString();
            let min = time.getMinutes().toString();
            min = (Math.ceil(Number(min) / 5) * 5).toString();

            if (Number(min) < 10) {
              min = '0' + min
            }
            horarioDeEntrada = `${hour}:${min}`.toString();
          }
          expiracao = numOfLines[5].substring(11, 13);
        }

        return `${ativo} ${horarioDeEntrada} M${expiracao}${direcao.toUpperCase()}`;
      }
      const alreadyExists = await Database.findOne({
        reply_to_message_id,
        chat_id,
      });

      if (
        !alreadyExists &&
        text &&
        !text.startsWith('/') &&
        title &&
        title === 'Formatador de sinais'
      ) {
        const sinal = await Database.create({
          chat_id,
          text: newText(),
          reply_to_message_id,
          wasSended: false,
          data,
        });

        if (!sinal.wasSended) {
          await api.post('sendMessage', null, {
            params: {
              chat_id,
              text: sinal.text,
              reply_to_message_id,
            },
          });
          await Database.findByIdAndUpdate(
            sinal,
            { wasSended: true },
            { new: true, useFindAndModify: false },
          );
        }

      }
    });
    return res.json({ success: true });
  }
}

export default new MessageController();
