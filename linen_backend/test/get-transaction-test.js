import http from 'k6/http';
import { check, sleep } from 'k6';

const TOKEN = '';

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '20s', target: 200 },
    { duration: '10s', target: 0 },
  ]
};

export default function () {

  const page = Math.floor(Math.random() * 2000) + 1;
  const linenId = Math.floor(Math.random() * 5) + 1;

  const url = `http://localhost:3000/api/stock/transactions?page=50&limit=50`;

  const res = http.get(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(0.2);
}