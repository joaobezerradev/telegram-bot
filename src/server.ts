import { schedule } from 'node-cron';
import axios from 'axios';
import app from './app';

app.listen(process.env.PORT || 5000);

schedule('*/4 * * * * *', () => {
  // eslint-disable-next-line no-console
  axios
    .get('https://telegram-bot-signal.herokuapp.com')
    .catch(e => console.log(e));
});
