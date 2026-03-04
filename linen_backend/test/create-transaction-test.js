import http from 'k6/http';
import { check, sleep } from 'k6';

const TOKEN = '';

// เก็บวันเริ่มต้น
let baseDate = new Date();

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '10s', target: 0 },
  ]
};

export default function () {
  const linenId = 1;
  const amount = Math.floor(Math.random() * 5) + 1;

  // 70% IN, 30% OUT
  const statusType = Math.random() < 0.7 ? 'IN' : 'OUT';

  // เพิ่มวันไปเรื่อย ๆ
  const currentDate = new Date(baseDate.getTime() + (__ITER * 86400000));
  const formattedDate = currentDate.toISOString().split('T')[0];

  const payload = JSON.stringify([
    {
      linen_id: linenId,
      amount: amount,
      date: formattedDate,
      status_type: statusType,
      partner_name: 'LoadTest',
      price: 100,
      payer: 'k6',
      receiver: 'system'
    }
  ]);

  const res = http.post(
    'http://localhost:3000/api/stock/create',
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  check(res, {
    'status is 201 or 400': (r) => r.status === 201 || r.status === 400,
  });
}